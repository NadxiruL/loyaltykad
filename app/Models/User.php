<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Carbon\Carbon;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    protected $appends = [
        'active_subscription',
        'ongoing_subscription',
        'has_active_subscription',
        'has_valid_subscription'
    ];

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function getActiveSubscriptionAttribute()
    {
        return $this->subscriptions()
            ->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->first();
    }

    public function getOngoingSubscriptionAttribute()
    {
        return $this->subscriptions()
            ->whereIn('status', ['active', 'pending', 'trial'])
            ->where(function ($query) {
                $query->whereNull('end_date')
                      ->orWhere('end_date', '>=', now());
            })
            ->orderBy('created_at', 'desc')
            ->first();
    }

    public function getHasActiveSubscriptionAttribute(): bool
    {
        return $this->subscriptions()
            ->where('status', 'active')
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->exists();
    }

    public function getHasValidSubscriptionAttribute(): bool
    {
        return $this->subscriptions()
            ->whereIn('status', ['active', 'trial'])
            ->where('start_date', '<=', now())
            ->where(function ($query) {
                $query->whereNull('end_date')
                      ->orWhere('end_date', '>=', now());
            })
            ->exists();
    }

    public function hasActiveSubscription(): bool
    {
        return $this->has_active_subscription;
    }

    public function hasValidSubscription(): bool
    {
        return $this->has_valid_subscription;
    }

    public function getSubscriptionExpiryDate(): ?Carbon
    {
        $subscription = $this->subscriptions()
            ->whereIn('status', ['active', 'trial'])
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->orderBy('end_date', 'desc')
            ->first();

        return $subscription?->end_date ? Carbon::parse($subscription->end_date) : null;
    }

    public function getSubscriptionDaysRemaining(): ?int
    {
        $expiryDate = $this->getSubscriptionExpiryDate();

        if (!$expiryDate) {
            return null;
        }

        return max(0, now()->diffInDays($expiryDate, false));
    }

    public function isSubscriptionExpiringSoon(int $days = 7): bool
    {
        $daysRemaining = $this->getSubscriptionDaysRemaining();

        return $daysRemaining !== null && $daysRemaining <= $days && $daysRemaining > 0;
    }

    public function customers()
    {
        return $this->hasMany(Customer::class);
    }
}

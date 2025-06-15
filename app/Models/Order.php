<?php
namespace App\Models;

use App\Models\Scopes\UserScope;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Model;


class Order extends Model
{
    protected $fillable = [
        'user_id',
        'package_id',
        'reference_id',
        'name',
        'email',
        'phone',
        'total_amount',
        'status',
    ];

    protected $casts = [
        'total_amount' => 'float',
        'status' => 'string',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new UserScope);

        static::creating(function ($order) {
            if (empty($order->reference_id)) {
                $order->reference_id = 'ORD-' . Str::random(10);
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'reference_id';
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}

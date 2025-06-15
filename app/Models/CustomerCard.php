<?php

namespace App\Models;

use App\Models\Scopes\UserScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class CustomerCard extends Model
{
    protected $fillable = [
        'customer_id',
        'card_template_id',
        'current_stamps',
        'completed',
        'start_date',
        'expiry_date',
        'user_id'
    ];

    protected $casts = [
        'completed' => 'boolean',
        'current_stamps' => 'integer'
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new UserScope);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(CardTemplate::class, 'card_template_id');
    }

    public function stampHistory(): HasMany
    {
        return $this->hasMany(StampHistory::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, foreignKey: 'user_id');
    }

    public function rewards(): HasManyThrough
    {
        return $this->hasManyThrough(
            CardReward::class,
            CardTemplate::class,
            'id',
            'card_template_id',
            'card_template_id',
            'id'
        );
    }
}

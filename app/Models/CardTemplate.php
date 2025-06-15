<?php

namespace App\Models;

use App\Models\Scopes\UserScope;
use Illuminate\Database\Eloquent\Model;

class CardTemplate extends Model
{
    protected $fillable = [
        'name',
        'total_stamps',
        'has_expiration',
        'validity_days',
        'user_id'
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new UserScope);
    }

    public function rewards()
    {
        return $this->hasMany(CardReward::class);
    }

    public function customerCards()
    {
        return $this->hasMany(CustomerCard::class);
    }
}

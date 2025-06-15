<?php

namespace App\Models;

use App\Models\Scopes\UserScope;
use Illuminate\Database\Eloquent\Model;

class StampHistory extends Model
{
    protected $fillable = [
        'customer_card_id',
        'stamps_added',
        'notes',
        'user_id'
    ];

    protected static function booted(): void
    {
        static::addGlobalScope(new UserScope);
    }

    public function customerCard()
    {
        return $this->belongsTo(CustomerCard::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}


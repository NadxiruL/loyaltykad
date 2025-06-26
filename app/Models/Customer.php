<?php

namespace App\Models;

use App\Models\Scopes\UserScope;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = ['name', 'phone', 'user_id', 'is_existing_customer'];

    //cast
    protected $casts = [
        'is_existing_customer' => 'boolean',
    ];


    protected static function booted(): void
    {
        static::addGlobalScope(new UserScope);
    }

    public function cards()
    {
        return $this->hasMany(CustomerCard::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Add a unique index on phone and user_id
    public function uniqueIds()
    {
        return ['phone', 'user_id'];
    }
}

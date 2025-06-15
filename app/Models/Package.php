<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    protected $fillable = [
        'name',
        'price',
        'duration',
        'description',
        'features',
    ];

    protected $casts = [
        'features' => 'array',
        'price' => 'float',
        'duration' => 'integer',
    ];

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }
}

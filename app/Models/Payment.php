<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{

    /** @var string */
    public const STATUS_PENDING = 'pending';

    /** @var string */
    public const STATUS_SUCCESS = 'success';

    /** @var string */
    public const STATUS_FAIL = 'fail';

    /** @var string */
    public const STATUS_SPECIAL = 'special';
    
    protected $fillable = [
        'order_id',
        'user_id',
        'amount',
        'status',
        'provider',
        'transaction_id',
        'provider_data',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'float',
        'provider_data' => 'array',
        'paid_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

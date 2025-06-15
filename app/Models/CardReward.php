<?php

namespace App\Models;

use App\Models\Scopes\UserScope;
use Illuminate\Database\Eloquent\Model;

class CardReward extends Model
{
    protected $fillable = [
        'card_template_id',
        'stamp_number',
        'reward_description',
        'is_final_reward'
    ];

 
    public function template()
    {
        return $this->belongsTo(CardTemplate::class, 'card_template_id');
    }
}

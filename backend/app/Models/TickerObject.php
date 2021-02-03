<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\TickerGroup;

class TickerObject extends Model
{
    protected $table = 'ticker_objects';
    protected $fillable = [
        'type', 'positionX', 'positionY', 'width', 'height', 'animationspeed', 'order_number', 'text', 'group_id', 'fontsize', 'fontcolor', 'font'
    ];

    public function tickerGroup()
    {
        return $this->belongsTo(TickerGroup::class);
    }
}

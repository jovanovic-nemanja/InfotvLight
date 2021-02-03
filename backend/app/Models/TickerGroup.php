<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\TickerObject;
use App\Models\TickerGroupPlaylistElement;

class TickerGroup extends Model
{
    protected $table = 'ticker_group';
    protected $fillable = [
        'group_name'
    ];

    public function tickerObjects()
    {
        $tickers = $this->hasMany(TickerObject::class, 'group_id')->get();
        
        return $tickers;
    }

    public function tickerGroupPlaylistElements()
    {
        return $this->hasMany(TickerGroupPlaylistElement::class, 'playlist_and_elements_id')->get();
    }
}

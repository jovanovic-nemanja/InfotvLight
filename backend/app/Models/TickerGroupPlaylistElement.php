<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\TickerGroup;
use App\Models\PlaylistElement;

class TickerGroupPlaylistElement extends Model
{
    protected $table = 'ticker_groups_and_playlist_and_elements';
    protected $fillable = [
        'group_id', 'playlist_and_elements_id'
    ];

    public function tickerGroup()
    {
        return $this->belongsTo(TickerGroup::class);
    }

    public function playlistElement()
    {
        return $this->belongsTo(PlaylistElement::class);
    }
}

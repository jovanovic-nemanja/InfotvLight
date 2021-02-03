<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Element;
use App\Models\Playlist;
use App\Models\TickerGroupPlaylistElement;

class PlaylistElement extends Model
{
    protected $table = 'playlist_and_elements';
    
    protected $fillable = [
        'playlist_id', 'element_id', 'order_number',
    ];

    public function element()
    {
        return $this->belongsTo(Element::class);
    }

    public function playlist()
    {
        return $this->belongsTo(Playlist::class);
    }

    public function tickerGroupPlaylistElement()
    {
        return $this->hasOne(TickerGroupPlaylistElement::class, 'playlist_and_elements_id')->first();
    }
}

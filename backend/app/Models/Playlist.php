<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Timetable;
use App\Models\PlaylistElement;
use App\Models\Element;
use App\Models\TickerGroupPlaylistElement;
use App\Models\TickerGroup;

class Playlist extends Model
{
    protected $table = 'playlist';
    protected $fillable = [
        'name', 'positionX', 'positionY', 'width', 'height'
    ];

    public function getGalleryFiles($folder)
    {
        $files = [];
        $filesInFolder = \File::files(public_path() . '/' . $folder);
        foreach ($filesInFolder as $path) {
            $files[] = pathinfo($path);
        }

        return $files;
    }

    public function playlistElements()
    {
        return $this->hasMany(PlaylistElement::class, 'playlist_id')->orderBy('order_number')->get();
    }

    public function elements()
    {
        $data = [];
        $playlistElements = $this->playlistElements();
        foreach($playlistElements as $row)
        {
            $element = Element::find($row->element_id);
            if($element == null) continue;
            $element->order_number = $row->order_number;
            $tickerGroupPlaylistElement = TickerGroupPlaylistElement::where('playlist_and_elements_id', $row->id)->first();
            if($tickerGroupPlaylistElement) {
                $element->ticker_group = TickerGroup::find($tickerGroupPlaylistElement->group_id);
            }
            if ($element->type == 3) { // Gallery
                $element->files = $this->getGalleryFiles($element->filename);
            }
            $element->playlistelement_id = $row->id;
            array_push($data, $element);
        }

        return $data;
    }

    public function elementIds()
    {
        $data = [];
        $map = $this->hasMany(PlaylistElement::class, 'playlist_id')->get();
        foreach ($map as $row) {
            array_push($data, $row->element_id);
        }

        return $data;
    }

    public function lastOrderNumber()
    {
        $max = $this->hasMany(PlaylistElement::class, 'playlist_id')->max('order_number');

        return $max;
    }

    public function timetables()
    {
        return $this->hasMany(Timetable::class, 'playlist_id')->get();
    }
}

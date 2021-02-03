<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Playlist;

class Timetable extends Model
{
    protected $table = 'timetable';
    protected $fillable = [
        'start_time', 'end_time', 'playlist_id', 'repeat_flag', 'repeat_id'
    ];

    public function playlist()
    {
        return $this->belongsTo(Playlist::class)->first();
    }
}

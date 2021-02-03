<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\ElementType;
use App\Models\PlaylistElement;

class Element extends Model
{
    protected $table = 'elements';
    protected $fillable = [
        'filename', 'type', 'duration', 'audio_source',
    ];

    public function elementType()
    {
        return $this->belongsTo(ElementType::class, 'id');
    }

    public function playlistElements()
    {
        return $this->hasMany(PlaylistElement::class, 'element_id')->get();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Element;

class ElementType extends Model
{
    use SoftDeletes;

    protected $table = 'element_type';
    protected $dates = ['deleted_at'];

    public function elements()
    {
        return $this->hasMany(Element::class, 'type');
    }
}

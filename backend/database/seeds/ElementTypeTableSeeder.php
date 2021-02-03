<?php

use Illuminate\Database\Seeder;
use App\Models\ElementType;

class ElementTypeTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        ElementType::truncate();

        ElementType::create(['type' => 1, 'description' => 'movie']);
        ElementType::create(['type' => 2, 'description' => 'image']);
        ElementType::create(['type' => 3, 'description' => 'slideshow']);
        ElementType::create(['type' => 4, 'description' => 'website']);
    }
}

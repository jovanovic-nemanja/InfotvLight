<?php

use Illuminate\Database\Seeder;
use App\Models\TickerObjectType;

class TickerObjectTypeTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        TickerObjectType::truncate();

        TickerObjectType::create(['type' => 1, 'description' => 'date']);
        TickerObjectType::create(['type' => 2, 'description' => 'time']);
        TickerObjectType::create(['type' => 3, 'description' => 'scrolltext']);
        TickerObjectType::create(['type' => 4, 'description' => 'fade_text']);
        TickerObjectType::create(['type' => 5, 'description' => 'static_text']);
        TickerObjectType::create(['type' => 6, 'description' => 'png_image']);
        TickerObjectType::create(['type' => 7, 'description' => 'cart_text']);
    }
}

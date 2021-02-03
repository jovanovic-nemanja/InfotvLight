<?php

use Illuminate\Database\Seeder;
use App\Models\WebRadio;

class WebRadioTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        WebRadio::truncate();

        WebRadio::create([
            'name' => 'MainRadio',
            'url' => 'http://188.138.1.125:24332'
        ]);
    }
}

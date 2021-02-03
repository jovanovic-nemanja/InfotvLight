<?php

use Illuminate\Database\Seeder;
use App\Models\Radio;

class RadioTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Radio::truncate();

        Radio::create([
            'channel' => 'http://188.138.1.125:24332'
        ]);
    }
}

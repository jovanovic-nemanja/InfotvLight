<?php

use Illuminate\Database\Seeder;
use App\Models\TickerGroup;

class TickerGroupTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = \Faker\Factory::create();
        TickerGroup::truncate();

        for ($i = 0; $i < 12; $i++) {
            TickerGroup::create(['group_name' => $faker->word()]);          
        }
    }
}

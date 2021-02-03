<?php

use Illuminate\Database\Seeder;
use App\Models\TickerGroup;
use App\Models\TickerObject;

class TickerObjectTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = \Faker\Factory::create();

        TickerObject::truncate();
        $ticker_groups = TickerGroup::all();

        function createTickerObject($type, $ticker_groups, $faker) {
            if($type != 6) {
                TickerObject::create([
                    'type' => $type,
                    'group_id' => $ticker_groups->random()->id,
                    'text' => $type == 1 || $type == 2 ? '' : $faker->paragraph(),
                    'positionX' => rand(0, 500),
                    'positionY' => rand(0, 300),
                    'width' => rand(300, 1000),
                    'height' => rand(100, 500),
                    'font' => 'verdana.ttf',
                    'fontcolor' => rand(0, 255) . "," . rand(0, 255) . "," . rand(0, 255),
                    'fontsize' => rand(12, 30),
                    'animationspeed' => rand(1, 25),
                    'order_number' => rand(1, 1000)
                ]);
            } else {
                TickerObject::create([
                    'type' => $type,
                    'group_id' => $ticker_groups->random()->id,
                    'text' => $faker->image('public/upload/ticker', 800, 480, null, true),
                    'positionX' => rand(0, 500),
                    'positionY' => rand(0, 500),
                    'width' => 800,
                    'height' => 480,
                    'font' => 'verdana.ttf',
                    'fontcolor' => '255,255,255',
                    'fontsize' => 12,
                    'animationspeed' => rand(1, 25),
                    'order_number' => rand(1, 1000)
                ]);
            }
        }

        for ($i = 0; $i < 50; $i++) {
            $type = rand(1, 7);
            createTickerObject($type, $ticker_groups, $faker);
        }
    }
}

<?php

use Illuminate\Database\Seeder;
use App\Models\Playlist;

class PlaylistTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = \Faker\Factory::create();
        Playlist::truncate();

        for ($i = 0; $i < 20; $i++) {
            $playlist = Playlist::create([
                'name' => $faker->word(),
                'positionX' => rand(0, 500),
                'positionY' => rand(0, 500),
                'width' => rand(100, 500),
                'height' => rand(100, 500)
            ]);
        }
    }
}

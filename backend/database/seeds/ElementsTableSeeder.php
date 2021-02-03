<?php

use Illuminate\Database\Seeder;
use App\Models\Element;

class ElementsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */

    public function run()
    {
        function randomImage()
        {
            $random = rand(1, 1000);
            return "https://picsum.photos/1000/400/?image=$random";
        }

        $faker = \Faker\Factory::create();
        Element::truncate();

        for ($i = 0; $i < 80; $i++) {
            $rand = rand(1, 1000);
            switch($rand % 4) {
                case 0:
                    Element::create([
                        'type' => 1,
                        'filename' => $faker->file('public/videos', 'public/upload', true),
                    ]);
                    break;
                case 1:
                    Element::create([
                        'type' => 2,
                        'filename' => $faker->image('public/upload', 800, 480, null, true),
                        'duration' => rand(5000, 15000),
                    ]);
                    break;
                case 2:
                    $filename = $faker->word();
                    $path = public_path() . '/upload/' . $filename;
                    \File::makeDirectory($path, $mode = 0777, true, true);

                    Element::create([
                        'type' => 3,
                        'filename' => $filename,
                        'duration' => rand(5000, 15000),
                    ]);
                    break;
                case 3:
                    Element::create([
                        'type' => 4,
                        'filename' => $faker->url(),
                        'duration' => rand(5000, 15000),
                    ]);
                    break;
            }
        }

    }
}

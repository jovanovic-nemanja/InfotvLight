<?php

use Illuminate\Database\Seeder;
use App\Models\Playlist;
use App\Models\Element;
use App\Models\PlaylistElement;

class PlaylistAndElementsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = \Faker\Factory::create();
        PlaylistElement::truncate();

        $playlists = Playlist::all();
        $elements = Element::all();

        foreach ($playlists as $playlist) 
        {
            $playlist_id = $playlist->id;
            $count = rand(3, 10);
            for ($i = 0; $i < $count; $i++) {
                $element_id = $elements->random()->id;
                $result_count = PlaylistElement::where('playlist_id', $playlist_id)
                    ->where('element_id', $element_id)
                    ->count();

                if($result_count == 0) {
                    $playlist_element = PlaylistElement::create([
                        'playlist_id' => $playlist->id,
                        'element_id' => $element_id,
                        'order_number' => $i,
                    ]);
                }
            }
        }
    }
}

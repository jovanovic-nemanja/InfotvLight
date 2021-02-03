<?php

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Setting::truncate();

        Setting::create([
            'key' => 'footer',
            'value' => '<h3>TREMTEC AV GmbH</h3>' .
                '<p>' .
                  'Wilhelmsederstraße 13<br />' .
                  '5020 Salzburg<br />' .
                  'E-Mail: office@tremtec-av.at' .
                '</p>'
        ]);

        Setting::create([
            'key' => 'copyright',
            'value' => '© 2017 TREMTEC AV GmbH'
        ]);

        Setting::create([
            'key' => 'database_path',
            'value' => '/home/pi/infotv.db'
        ]);

        Setting::create([
            'key' => 'exe_path',
            'value' => '/home/pi/raspi2png/raspi2png'
        ]);

        Setting::create([
            'key' => 'screen_max_width',
            'value' => 1920
        ]);

        Setting::create([
            'key' => 'screen_max_height',
            'value' => 1080
        ]);
    }
}

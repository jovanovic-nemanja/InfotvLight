<?php

use Illuminate\Database\Seeder;
use App\Models\Element;
use App\Models\TickerObject;
use App\Models\Setting;

class RefineDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $elements = Element::all();

        foreach($elements as $element) {
            $element->filename = str_replace('public/', '', $element->filename);
            if($element->type == 3) {
                $element->filename = str_replace("upload/", "", $element->filename);
                $element->filename = 'upload/' . $element->filename;
            }
            $element->save();
        }

        $tickerObjects = TickerObject::all();

        foreach ($tickerObjects as $etickerObject) {
            $etickerObject->text = str_replace('public/', '', $etickerObject->text);
            $etickerObject->save();
        }

        Setting::create([
            'key' => 'logo',
            'value' => '/assets/images/tremtec-logo-small.png'
        ]);

        Setting::create([
            'key' => 'auth_logo',
            'value' => '/assets/images/tremtec-logo-white.png'
        ]);
    }
}

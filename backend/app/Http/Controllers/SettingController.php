<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Setting;


class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all();
        $data = [];
        foreach ($settings as $setting) {
            $data[$setting->key] = $setting->value;
        }

        return response()->json($data);
    }

    public function getValue(Request $request, $key)
    {
        $setting = Setting::where('key', $key)->first();
        $value = $setting ? $setting->value : '';

        return response()->json(['message' => $value]);
    }

    public function setValue($key, $value)
    {
        $setting = Setting::where('key', $key)->first();
        if ($setting) {
            $setting->value = $value;
            $setting->save();
        }
    }

    public function update(Request $request)
    {
        $this->setValue('footer', $request->get('footer'));
        $this->setValue('copyright', $request->get('copyright'));
        $this->setValue('database_path', $request->get('database_path'));
        $this->setValue('exe_path', $request->get('exe_path'));
        $this->setValue('screen_max_width', $request->get('screen_max_width'));
        $this->setValue('screen_max_height', $request->get('screen_max_height'));
        $this->setValue('logo', $request->get('logo'));
        $this->setValue('auth_logo', $request->get('auth_logo'));

        return response()->json(['message' => 'success']);
    }
}

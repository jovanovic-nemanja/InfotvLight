<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Models\Setting;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    public function showScreen()
    {
        $exe_path = Setting::where('key', 'exe_path')->first();
        if($exe_path == null) {
            return response()->json(['message' => 'error'], 500);
        }

        $exe_path = $exe_path->value;
        $output = shell_exec($exe_path);

        return response()->json(['message' => $output]);
    }
}

<?php

namespace App\Http\Controllers;

use App\User;
use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;
use App\Models\Setting;


class AdminController extends Controller
{
    public function getUsers(Request $request)
    {
        $search = $request->get('search');
        $data = User::where('name', 'LIKE', "%$search%")->paginate(10);

        return response()->json($data);
    }

    public function approveDismissUser(Request $request)
    {
        $user_id = $request->get('user_id');
        $approved = $request->get('approved');

        $user = User::find($user_id);

        if ($user) {
            $user->approved = $approved;
            $user->save();

            return response()->json(['message' => 'success']);
        }

        return response()->json(['message' => 'The user is not exist!'], 400);
    }

    public function backup(Request $request)
    {
        $setting = Setting::where('key', 'database_path')->first();
        $path = $setting ? $setting->value : 'D:\\';
        $copy = @\File::copy(database_path('database.sqlite'), $path);

        if($copy) {
            return response()->json(['message' => 'success']);
        }

        return response()->json(['message' => 'The database is not exist or invalid software path.'], 500);
    }
}

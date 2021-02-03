<?php

namespace App\Http\Middleware;

use Closure;
use App\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class CheckAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $user = JWTAuth::parseToken()->authenticate();
        if(!$user) {
            return response()->json(['message' => 'The token is invalid or expired!'], 401);
        }
        $role = $user->roles->first();
        if($role == null) {
            return response()->json(['message' => 'No role!'], 401);
        }
        if($role->slug != 'admin') {
            return response()->json(['message' => 'No permission!'], 500);
        }

        return $next($request);
    }
}

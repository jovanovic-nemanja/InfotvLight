<?php

namespace App\Http\Controllers;

use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Mail;


class UserController extends Controller
{
  public function authenticate(Request $request)
  {
    $credentials = $request->only('email', 'password');
    // try {
    //   if (!$token = JWTAuth::attempt($credentials)) {
    //     return response()->json(['error' => 'Invalid credentials!'], 400);
    //   }
    // } catch (JWTException $e) {
    //   return response()->json(['error' => 'Token creation failed!'], 500);
    // }

    // $user = User::where('email', $request->get('email'))->first();

    // if($user->approved == 0) {
    //   return response()->json(['error' => 'You are not approved!'], 400);
    // }

    //return response()->json(compact('token'));    
  }

  public function register(Request $request)
  {
    $validator = Validator::make($request->all(), [
      'name' => 'required|string|max:255',
      'email' => 'required|string|email|max:255|unique:users',
      'password' => 'required|string|min:6',
    ]);

    if ($validator->fails()) {
      return response()->json($validator->errors()->toJson(), 400);
    }

    $name = $request->get('name');
    $email = $request->get('email');
    
    $user = User::create([
      'name' => $name,
      'email' => $email,
      'password' => Hash::make($request->get('password')),
    ]);

    // Set avatar, confirmation code
    $avatar = \Avatar::create($name)->toBase64()->encoded;
    $confirmation_code = str_random(30);
    $user->avatar = $avatar;
    $user->confirmation_code = $confirmation_code;
    $user->save();
    
    // Attach Role
    $role = \Bican\Roles\Models\Role::where('slug', 'user')->get();
    $user->attachRole($role);
    
    // Send confirmation email
    $front_url = $request->get('front_url');
    $reset_link = $front_url . '/auth/verify/' . $confirmation_code;
    $data = [
      'email' => $user->email,
      'reset_link' => $reset_link
    ];
    Mail::send('emails.verify', $data, function ($message) use($email) {
      $message->to($email, 'Infotv Light')
        ->subject('Infotv Light');
    });

    $token = JWTAuth::fromUser($user);

    return response()->json([compact('user', 'token')], 201);
  }

  public function getAuthenticatedUser()
  {
    try {

      if (!$user = JWTAuth::parseToken()->authenticate()) {
        return response()->json(['user_not_found'], 404);
      }

    } catch (Tymon\JWTAuth\Exceptions\TokenExpiredException $e) {

      return response()->json(['token_expired'], $e->getStatusCode());

    } catch (Tymon\JWTAuth\Exceptions\TokenInvalidException $e) {

      return response()->json(['token_invalid'], $e->getStatusCode());

    } catch (Tymon\JWTAuth\Exceptions\JWTException $e) {

      return response()->json(['token_absent'], $e->getStatusCode());

    }

    if($user->roles->first() != null) {
      $user->role = $user->roles->first();
    } else {
      $user->role = ['slug' => 'Visitor', 'name' => 'visitor'];
    }

    return response()->json(compact('user'));
  }

  public function verify(Request $request)
  {
    $confirmation_code = $request->get('confirmation_code');

    $user = User::where('confirmation_code', $confirmation_code)->first();
    if(isset($user->email)) {
      $user->approved = 1;
      $user->save();

      return response()->json(['message' => 'Your account has been verified.']);
    }

    return response()->json(['message' => 'Your confirmation code is not exist!'], 400);
  }

  public function forgotPassword(Request $request)
  {
    $email = $request->get('email');

    $user = User::where('email', $email)->first();
    if(isset($user->email)) {
      $reset_password_code = str_random(30);
      $user->reset_password_code = $reset_password_code;
      $user->save();

      // Send reset password email
      $front_url = $request->get('front_url');
      $reset_link = $front_url . '/auth/reset_password/' . $reset_password_code;
      $data = [
        'email' => $user->email,
        'reset_link' => $reset_link
      ];
      Mail::send('emails.reset_password', $data, function ($message) use ($email) {
        $message->to($email, 'Infotv Light')
          ->subject('Infotv Light');
      });

      return response()->json(['message' => 'success'], 200);
    }

    return response()->json(['message' => 'The email is not exist!'], 400);
  }

  public function resetPassword(Request $request)
  {
    $new_password = $request->get('new_password');
    $reset_password_code = $request->get('reset_password_code');

    $user = User::where('reset_password_code', $reset_password_code)->first();
    if($user) {
      $user->password = Hash::make($new_password);
      $user->save();

      return response()->json(['message' => 'success'], 200);
    }

    return response()->json(['message' => 'The reset password code is invalid!'], 400);
  }

  public function updateProfile(Request $request)
  {
    $name = $request->get('name');
    $bio = $request->get('bio');
    $user = JWTAuth::parseToken()->authenticate();

    if($user) {
      $user->name = $name;
      $user->bio = $bio;
      $user->save();

      return response()->json(['message' => 'success'], 200);
    }

    return response()->json(['message' => 'The token is invalid!'], 400);
  }

  public function uploadAvatar(Request $request)
  {
    $avatar = $request->get('avatar');
    $user = JWTAuth::parseToken()->authenticate();

    if ($user) {
      $user->avatar = $avatar;
      $user->save();

      return response()->json(['message' => 'success'], 200);
    }

    return response()->json(['message' => 'The token is invalid!'], 400);
  }

  public function updatePassword(Request $request)
  {
    $password = $request->get('password');
    $new_password = $request->get('new_password');
    $user = JWTAuth::parseToken()->authenticate();

    if ($user) {
      $token = JWTAuth::attempt([
        'email' => $user->email,
        'password' => $password
      ]);
      if(!$token) {
        return response()->json(['message' => 'The password is invalid!'], 400);
      }

      $user->password = Hash::make($new_password);
      $user->save();

      return response()->json(['message' => 'success'], 200);
    }

    return response()->json(['message' => 'The token is invalid!'], 400);
  }
}

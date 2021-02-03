<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

// Authentication
Route::post('login', 'UserController@authenticate');
Route::post('register', 'UserController@register');
Route::post('verifyAccount', 'UserController@verify');
Route::post('forgotPassword', 'UserController@forgotPassword');
Route::post('resetPassword', 'UserController@resetPassword');

Route::group(['middleware' => ['jwt.auth']], function () {
    Route::post('getMe', 'UserController@getAuthenticatedUser');
    Route::post('updateProfile', 'UserController@updateProfile');
    Route::post('uploadAvatar', 'UserController@uploadAvatar');
    Route::post('updatePassword', 'UserController@updatePassword');

    Route::group(['middleware' => ['check.admin']], function() {
        Route::get('admin/users', 'AdminController@getUsers');
        Route::post('admin/approveDismissUser', 'AdminController@approveDismissUser');
        Route::get('backup', 'AdminController@backup');
        Route::post('settings', 'SettingController@update');
    });

    Route::delete('elements', 'ElementController@destroyByIds');
    Route::delete('elements/{id}', 'ElementController@destroy');
    Route::post('storeImageMedia', 'ElementController@storeImageMedia');
//    added by Rpz
    Route::post('preupdateImageMedia', 'ElementController@preupdateImageMedia');
    Route::post('updateImageMedia', 'ElementController@updateImageMedia');
    Route::post('updateImageMediaAudio', 'ElementController@updateImageMediaAudio');
    Route::post('storeWebsiteMedia', 'ElementController@storeWebsiteMedia');
    Route::post('updateWebsiteMedia', 'ElementController@updateWebsiteMedia');
    Route::post('storeVideoMedia', 'ElementController@storeVideoMedia');
//    added by Rpz
    Route::post('preupdateVideoMedia', 'ElementController@preupdateVideoMedia');
    Route::post('updateVideoMedia', 'ElementController@updateVideoMedia');
    Route::post('storeGalleryMedia', 'ElementController@storeGalleryMedia');
    Route::post('updateGalleryMedia', 'ElementController@updateGalleryMedia');
    Route::post('deleteGalleryFile', 'ElementController@deleteGalleryFile');
    Route::post('storeGalleryFile', 'ElementController@storeGalleryFile');

    Route::post('playlists', 'PlaylistController@store');
    Route::put('playlists/{id}', 'PlaylistController@update');
    Route::delete('playlists/{id}', 'PlaylistController@destroy');
    Route::post('playlists/{id}/updateMedias', 'PlaylistController@updateMedias');
    Route::post('playlists/{id}/updateOrder', 'PlaylistController@updateOrder');
    Route::post('playlists/{id}/deleteMedia/{element_id}', 'PlaylistController@deleteMedia');

    Route::get('tickerGroups', 'TickerGroupController@index');
    Route::get('tickerGroups/all', 'TickerGroupController@all');
    Route::get('tickerGroups/{id}', 'TickerGroupController@show');
    Route::post('tickerGroups', 'TickerGroupController@store');
    Route::put('tickerGroups', 'TickerGroupController@update');
    Route::delete('tickerGroups', 'TickerGroupController@destroy');

    Route::post('tickerObjects/updateTickers', 'TickerObjectController@updateTickers');
    Route::post('tickerObjects', 'TickerObjectController@store');
    Route::delete('tickerObjects/{id}', 'TickerObjectController@destroy');
    Route::post('updateTickerImage', 'TickerObjectController@updateTickerImage');

    Route::post('tickerGroupPlaylistElements', 'TickerGroupPlaylistElementController@save');

    Route::get('web_radio/{name}', 'WebRadioController@show');
    Route::put('web_radio/{name}', 'WebRadioController@update');

    Route::post('timetable', 'TimetableController@store');
    Route::put('timetable/{id}', 'TimetableController@update');
    Route::delete('timetable/{id}', 'TimetableController@destroy');
    Route::delete('timetable/repeats/{repeat_id}', 'TimetableController@destroyRepeats');

    Route::get('showScreen', 'Controller@showScreen');
});

Route::get('elements', 'ElementController@index');
Route::get('elements/{id}', 'ElementController@show');
Route::get('elements/all', 'ElementController@all');

Route::get('playlists', 'PlaylistController@index');
Route::get('playlists/all', 'PlaylistController@all');
Route::get('playlists/{id}', 'PlaylistController@show');

Route::get('timetable', 'TimetableController@index');

Route::get('settings', 'SettingController@index');
Route::get('settings/{key}', 'SettingController@getValue');

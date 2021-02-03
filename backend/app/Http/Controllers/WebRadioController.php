<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\WebRadio;


class WebRadioController extends Controller
{
  public function show(Request $request, $name)
  {
    $radio = WebRadio::where('name', $name)->first();

    return response()->json($radio);
  }

  public function update(Request $request, $name)
  {
    $url = $request->get('url');
    $radio = WebRadio::where('name', $name)->first();
		if ($radio === null) {
			$radio = WebRadio::create([
				'name' => $name,
				'url' => $url
			]);
		} else {
			$radio->url = $url;
			$radio->save();
		}

    return response()->json(['message' => 'success']);
  }
}

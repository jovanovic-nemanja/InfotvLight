<?php

namespace App\Http\Controllers;

use App\Models\TickerGroupPlaylistElement;
use Illuminate\Http\Request;


class TickerGroupPlaylistElementController extends Controller
{
	public function save(Request $request)
	{
		$group_id = $request->get('group_id');
		$playlistelement_id = $request->get('playlistelement_id');

		$elements = TickerGroupPlaylistElement::where([
			'playlist_and_elements_id' => $playlistelement_id,
		])->delete();

		if ((int)$group_id != 0) {
			TickerGroupPlaylistElement::create([
				'group_id' => $group_id,
				'playlist_and_elements_id' => $playlistelement_id
			]);
		}

		return response()->json(['message' => 'success']);
	}
}

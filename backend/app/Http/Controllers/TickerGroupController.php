<?php

namespace App\Http\Controllers;

use App\Models\TickerGroup;
use Illuminate\Http\Request;


class TickerGroupController extends Controller
{
  public function index(Request $request)
  {
    $search = $request->get('search');
    $data = TickerGroup::orderBy('created_at', 'desc')->where('group_name', 'LIKE', "%$search%")->paginate(10);
    foreach ($data->values()->all() as $row) {
      $row->tickerObjects = $row->tickerObjects();
    }

    return response()->json($data);
  }

  public function all(Request $request)
  {
    return response()->json(TickerGroup::all());
  }

  public function show(Request $request, $id)
  {
    $tickerGroup = TickerGroup::find($id);
    $tickerGroup->tickerObjects = $tickerGroup->tickerObjects();

    return response()->json($tickerGroup);
  }

  public function store(Request $request)
  {
    $group_name = $request->get('group_name');

    TickerGroup::create([
      'group_name' => $group_name
    ]);

    return response()->json(['message' => 'success']);
  }

  public function update(Request $request)
  {
    $id = $request->get('id');
    $group_name = $request->get('group_name');

    $ticker_group = TickerGroup::find($id);
    $ticker_group->group_name = $group_name;
    $ticker_group->save();
    
    return response()->json(['message' => 'success']);
  }

  public function destroy(Request $request)
  {
    $id = $request->get('id');

    $ticker_group = TickerGroup::find($id);
    $tickerGroupPlaylistElements = $ticker_group->tickerGroupPlaylistElements();
    foreach($tickerGroupPlaylistElements as $row) {
      $row->delete();
    }
    $ticker_group->delete();

    return response()->json(['message' => 'success']);
  }
}

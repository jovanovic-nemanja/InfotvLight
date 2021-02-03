<?php

namespace App\Http\Controllers;

use App\Models\Playlist;
use App\Models\PlaylistElement;
use App\Models\Element;
use Illuminate\Http\Request;
use Illuminate\Pagination\Paginator;


class PlaylistController extends Controller
{
  public function index(Request $request)
  {
    $search = $request->get('search');
    // $data = Playlist::orderBy('created_at', 'desc')->where('name', 'LIKE', "%$search%")->paginate(10);
    $data = Playlist::orderBy('id', 'asc')->where('name', 'LIKE', "%$search%")->paginate(10);
    foreach ($data->values()->all() as $row) {
      $row->elements = $row->elements();
    }

    return response()->json($data);
  }

  public function all(Request $request)
  {
    // $data = Playlist::orderBy('created_at', 'desc')->get();
    $data = Playlist::orderBy('id', 'asc')->get();

    return response()->json($data);
  }

  public function show($id)
  {
    $playlist = PlayList::find($id);
    $playlist->elements = $playlist->elements();

    return response()->json($playlist);
  }

  public function store(Request $request)
  {
    PlayList::create([
      'name' => $request->get('name'),
      'positionX' => $request->get('positionX'),
      'positionY' => $request->get('positionY'),
      'width' => $request->get('width'),
      'height' => $request->get('height')
    ]);

    return response()->json(['message' => 'success']);
  }

  public function update(Request $request, $id)
  {
    $playlist = PlayList::find($id);
    $playlist->name = $request->get('name');
    $playlist->positionX = $request->get('positionX');
    $playlist->positionY = $request->get('positionY');
    $playlist->width = $request->get('width');
    $playlist->height = $request->get('height');
    $playlist->save();

    return response()->json(['message' => 'success']);
  }

  public function destroy($id)
  {
    $playlist = PlayList::find($id);

    $playlistElements = $playlist->playlistElements();
    foreach($playlistElements as $row) {
      $tickerGroupPlaylistElement = $row->tickerGroupPlaylistElement();
      if($tickerGroupPlaylistElement) $tickerGroupPlaylistElement->delete();
      $row->delete();
    }

    $timetables = $playlist->timetables();
    foreach($timetables as $row) {
      $row->delete();
    }

    $playlist->delete();

    return response()->json(['message' => 'success']);
  }

  public function updateMedias(Request $request, $id)
  {
    $playlist = PlayList::find($id);
    $element_ids = $request->get('element_ids');
    // $original_ids = $playlist->elementIds();
    // $deleted_ids = array_diff($original_ids, $element_ids);
    // $added_ids = array_diff($element_ids, $original_ids);

    // Delete playlist_elements from playlist
    // foreach($deleted_ids as $element_id) {
    //   PlaylistElement::where(['playlist_id' => $playlist->id, 'element_id' => $element_id])->delete();
    // }
    // Add playlist_elements to playlist


    if (!empty($element_ids)) {
        foreach ($element_ids as $element_id) {

            PlaylistElement::create([
                'playlist_id' => $playlist->id,
                'element_id' => $element_id,
                'order_number' => $playlist->lastOrderNumber() + 1
            ]);
        }
    }
    return response()->json(['message' => 'success']);
  }

  public function updateOrder(Request $request, $id)
  {
    $elements = $request->get('elements');

    foreach($elements as $row)
    {
      $playlist_element = PlaylistElement::where(['playlist_id' => $id, 'element_id' => $row['id']])->first();
      $playlist_element->order_number = $row['order_number'];
      $playlist_element->save();
    }

    return response()->json(['message' => $elements]);
  }

  public function deleteMedia(Request $request, $id, $element_id)
  {
    $playlistElement = PlaylistElement::where(['playlist_id' => $id, 'element_id' => $element_id])->first();
    $tickerGroupPlaylistElement = $playlistElement->tickerGroupPlaylistElement();
    if($tickerGroupPlaylistElement) $tickerGroupPlaylistElement->delete();
    $playlistElement->delete();

    return response()->json(['message' => 'success']);
  }
}

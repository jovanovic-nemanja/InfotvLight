<?php

namespace App\Http\Controllers;

use App\Models\TickerGroup;
use App\Models\TickerObject;
use Illuminate\Http\Request;


class TickerObjectController extends Controller
{
  public function updateTickers(Request $request)
  {
    $tickers = $request->get('tickers');
    if($tickers == null) {
      return response()->json(['message' => 'success']);
    }

    foreach($tickers as $row) {
      $ticker = TickerObject::find($row['id']);
      $ticker->positionX = $row['positionX'];
      $ticker->positionY = $row['positionY'];
      $ticker->width = $row['width'];
      $ticker->height = $row['height'];
      $ticker->text = $row['text'] == null ? '' : $row['text'];
      $ticker->animationspeed = $row['animationspeed'];
      $ticker->order_number = $row['order_number'];
      $ticker->font = $row['font'];
      $ticker->fontsize = $row['fontsize'];
      $ticker->fontcolor = $row['fontcolor'];
      $ticker->save();
    }

    return response()->json(['message' => 'success']);
  }

  public function store(Request $request)
  {
    $type = $request->get('type');
    $group_id = $request->get('group_id');

    TickerObject::create([
      'type' => $type,
      'text' => 'Text',
      'positionX' => 10,
      'positionY' => 10,
      'width' => 300,
      'height' => 150,
      'font' => 'verdana.ttf',
      'fontsize' => 30,
      'animationspeed' => 4,
      'fontcolor' => '255,255,255',
      'group_id' => $group_id
    ]);

    return response()->json(['message' => 'success']);
  }

  public function destroy($id)
  {
    $ticker = TickerObject::find($id);
    if($ticker->type == 6) {
      $this->unlinkTickerFile($ticker);
    }
    $ticker->delete();

    return response()->json(['message' => 'success']);
  }

  public function unlinkTickerFile($ticker)
  {
    $filename = $ticker->text;
    $path = str_replace('\\', '/', $filename);
    $path = str_replace('public/', '', $path);
    @unlink(public_path($path));
  }

  public function updateTickerImage(Request $request)
  {
    $id = $request->get('id');
    $image = $request->file('image');

    if ($image) {
      $destinationPath = public_path() . '/upload/ticker/';
      $filename = time() . "_" . str_random(5) . ".mp4";

      $upload_success = $request->file('image')->move($destinationPath, $filename);

      if ($upload_success) {
        $ticker = TickerObject::find($id);
        $ticker->text = 'upload/ticker/' . $filename;
        $ticker->save();

        return response()->json(['message' => 'success']);
      } else {
        return response()->json('The image upload has been failed.', 400);
      }
    }
  }
}

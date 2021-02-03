<?php

namespace App\Http\Controllers;

use App\Models\Element;
use App\Models\PlaylistElement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Mail;
use Illuminate\Pagination\Paginator;


class ElementController extends Controller
{
  public function index(Request $request)
  {
    $type = $request->get('type');
    if($type == 0) {
      $data = Element::orderBy('created_at', 'desc')->paginate(12);
    } else {
      $data = Element::orderBy('created_at', 'desc')->where('type', $type)->paginate(12);
    }
    foreach($data->values()->all() as $row) {
      if($row->type == 3) { // Gallery
        $row->files = $this->getGalleryFiles($row->filename);
      }
    }

    return response()->json($data);
  }

  public function all(Request $request)
  {
    $data = Element::all();

    return response()->json($data);
  }

  public function show($id)
  {
    $element = Element::find($id);
    if($element->type == 3) { // Gallery
      $element->files = $this->getGalleryFiles($element->filename);
    }

    return response()->json($element);
  }

  public function getGalleryFiles($folder)
  {
    $files = [];
    $path = public_path() . '/' . $folder;
    if(\File::exists($path)) {
      $filesInFolder = \File::files($path);
      foreach ($filesInFolder as $path) {
        $files[] = pathinfo($path);
      }
    }

    return $files;
  }

  public function unlinkMediaFile($element)
  {
    $filename = $element->filename;
    if($element->type == 3) { // Gallery
      \File::deleteDirectory(public_path() . '/' . $filename);
    } else if($element->type == 1 || $element->type == 2) { // Video/Image
      $path = str_replace('\\', '/', $filename);
      $path = str_replace('public/', '', $path);
      @unlink(public_path($path));
    }
  }

  public function destroy($id)
  {
    $element = Element::find($id);
//    $this->unlinkMediaFile($element);

    $playlist_elements = $element->playlistElements();
    foreach ($playlist_elements as $row) {
      $row->delete();
    }

    $element->delete();
  }

  public function destroyByIds(Request $request)
  {
    $ids = $request->get('ids');
    foreach($ids as $id)
    {
      $this->destroy($id);
    }

    return response()->json(['message' => 'success']);
  }

  public function getImageType($str)
  {
    return str_replace('image/', '', substr($str, 5, strpos($str, ';') - 5));
  }

  public function saveImage($image, $image_name = null)
  {
    $type = $this->getImageType($image);
    $base64Image = preg_replace('#^data:image/\w+;base64,#i', '', $image);
    $data = base64_decode($base64Image);
    if(!$image_name)
      $filename = "upload/" . time() . "_" . str_random(5) . "." . $type;
    else
      $filename = $image_name;

    file_put_contents($filename, $data);

    return $filename;
  }

  public function storeImageMedia(Request $request)
  {
    $image = $request->get('image');
    $image_name = $request->get('image_name');
      // modified by Rpz
    $filename = $this->saveImage($image,"upload/".$image_name);

    Element::create([
      'type' => 2,
      'filename' => $filename,
      'duration' => 10000
    ]);

    return response()->json(['message' => 'success']);
  }
  //added by Rpz
  public function preupdateImageMedia(Request $request)
  {

    $image_name = $request->get('image_name');
    $IsExist = false;
    $elements = Element::all();
    foreach ($elements as $element) {
        if ($element->filename == 'upload/'.$image_name){
            $IsExist = true;
            break;
        }
    }
    return response()->json(['message' => 'success','IsExist' => $IsExist]);
  }



    public function updateImageMedia(Request $request)
  {
    $id = $request->get('id');
    $image = $request->get('image');
    // modified by Rpz
    $image_name = $request->get('image_name');

//    $IsExist = false;
//    $Allelements = Element::all();
//    foreach ($Allelements as $allelement) {
//      if($allelement->filename == $image_name){
//          $IsExist = true; break;
//      }
//    }
    $element = Element::find($id);
    $this->unlinkMediaFile($element);
    $filename = $this->saveImage($image, "upload/".$image_name);
    $element->filename = $filename;
    $element->audio_source = $request->get('audio_source');
    $element->duration = $request->get('duration');
    $element->save();

    return response()->json(['message' => 'success']);
  }

  public function updateImageMediaAudio(Request $request)
  {
    $id = $request->get('id');

    $element = Element::find($id);
    $element->audio_source = $request->get('audio_source');
    $element->duration = $request->get('duration');
    $element->save();

    return response()->json(['message' => 'success']);
  }

  public function storeWebsiteMedia(Request $request)
  {
    $filename = $request->get('filename');

    Element::create([
      'type' => 4,
      'filename' => $filename,
      'audio_source' => $request->get('audio_source'),
      'duration' => $request->get('duration'),
    ]);

    return response()->json(['message' => 'success']);
  }

  public function updateWebsiteMedia(Request $request)
  {
    $id = $request->get('id');
    $filename = $request->get('filename');

    $element = Element::find($id);
    $element->filename = $filename;
    $element->audio_source = $request->get('audio_source');
    $element->duration = $request->get('duration');
    $element->save();

    return response()->json(['message' => 'success']);
  }

  public function storeVideoMedia(Request $request)
  {
    $video = $request->file('video');

    if ($video) {
      $destinationPath = public_path() . '/upload/';
      $filename = $request->file('video')->getClientOriginalName();//time() . "_" . str_random(5) . ".mp4";

      $upload_success = $request->file('video')->move($destinationPath, $filename);

      if ($upload_success) {
        Element::create([
          'type' => 1,
          'filename' => 'upload/' . $filename,
        ]);

        return response()->json(['message' => 'success']);
      } else {
        return response()->json('The video upload has been failed.', 400);
      }
    }
  }

    //added by Rpz
    public function preupdateVideoMedia(Request $request)
    {
        $video = $request->file('video');
        $IsExist = false;
        if ($video) {
            $filename = $request->file('video')->getClientOriginalName();//time() . "_" . str_random(5) . ".mp4";

            $elements = Element::all();
            foreach ($elements as $element) {
                if ($element->filename == 'upload/'.$filename){
                    $IsExist = true;
                    break;
                }
            }
        }


        return response()->json(['message' => 'success','IsExist' => $IsExist]);
    }

  public function updateVideoMedia(Request $request)
  {
    $id = $request->get('id');
    $video = $request->file('video');

    if ($video) {
      $destinationPath = public_path() . '/upload/';
      $filename = $request->file('video')->getClientOriginalName();//time() . "_" . str_random(5) . ".mp4";

      $element = Element::find($id);
      $this->unlinkMediaFile($element);
      $upload_success = $request->file('video')->move($destinationPath, $filename);
      if ($upload_success) {
        $element->filename = 'upload/' . $filename;
        $element->save();
        return response()->json(['message' => 'success']);
      } else {
        return response()->json('The video upload has been failed.', 400);
      }
    }
  }

  public function storeGalleryMedia(Request $request)
  {
    $filename = $request->get('filename');

    $path = public_path() . '/upload/' . $filename;
    \File::makeDirectory($path, $mode = 0777, true, true);

    Element::create([
      'type' => 3,
      'filename' => 'upload/' . $filename,
      'audio_source' => $request->get('audio_source'),
      'duration' => $request->get('duration')
    ]);

    return response()->json(['message' => 'success']);
  }

  public function updateGalleryMedia(Request $request)
  {
    $id = $request->get('id');
    $filename = 'upload/' . $request->get('filename');

    $element = Element::find($id);
    $success = rename(public_path() . '/' . $element->filename, public_path() . '/' . $filename);
    if($success) {
      $element->filename = $filename;
      $element->audio_source = $request->get('audio_source');
      $element->duration = $request->get('duration');
      $element->save();

      return response()->json(['message' => 'success']);
    }

    return response()->json(['message' => 'The gallery update has been failed.'], 400);
  }

  public function deleteGalleryFile(Request $request)
  {
    $path = $request->get('path');
    $path = public_path() . '/upload/' . $path;
    unlink($path);

    return response()->json(['message' => 'success']);
  }

  public function storeGalleryFile(Request $request)
  {
    $folder = $request->get('folder');
    $file = $request->file('file');

    if ($file) {
      $destinationPath = public_path() . '/upload/' . $folder;
      $filename = time() . "_" . str_random(5) . "." . $file->getClientOriginalExtension();

      $upload_success = $request->file('file')->move($destinationPath, $filename);

      if ($upload_success) {
        return response()->json(['message' => 'success']);
      } else {
        return response()->json('The file upload has been failed.', 400);
      }
    }
  }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Timetable;
use App\Models\Playlist;

class TimetableController extends Controller
{
    public function index()
    {
        $data = Timetable::all();
        foreach($data as $row) {
            $row->playlist = $row->playlist();
        }

        return response()->json($data);
    }

    public function store(Request $request)
    {
        function mstoseconds($timestamp)
        {
            $length = strlen($timestamp);
            $seconds = "0";
            if ($length > 3) {
                $seconds = substr($timestamp, 0, $length - 3);
            }

            return $seconds;
        }

        $start_time = $request->get('start_time');
        $end_time = $request->get('end_time');
        $playlist_id = $request->get('playlist_id');
        $repeat_flag = $request->get('repeat_flag');

        if((int)$repeat_flag == 1) {
            $data = [];
            $repeat_start = $request->get('repeat_start');
            $repeat_end = $request->get('repeat_end');
            $interval = \DateInterval::createFromDateString('1 day');
            $start_date = new \DateTime($repeat_start);
            $end_date = new \DateTime($repeat_end);
            $end_date = $end_date->modify('+1 day');
            $period = new \DatePeriod($start_date, $interval, $end_date);
            $repeat_id = \str_random(30);

            foreach ($period as $dt) {
                $day_start = $dt->format("Y-m-d") . $start_time;
                $day_end = $dt->format("Y-m-d") . $end_time;
                $start_stamp = strtotime($day_start);
                $end_stamp = strtotime($day_end);

                $timetable = Timetable::create([
                    'start_time' => $start_stamp,
                    'end_time' => $end_stamp,
                    'playlist_id' => $playlist_id,
                    'repeat_flag' => 1,
                    'repeat_id' => $repeat_id
                ]);
                $timetable->playlist = $timetable->playlist();

                array_push($data, $timetable);
            }

            return response()->json($data);
        } else {
            $timetable = Timetable::create([
                'start_time' => mstoseconds($start_time),
                'end_time' => mstoseconds($end_time),
                'playlist_id' => $playlist_id,
            ]);
            $timetable->playlist = $timetable->playlist();

            return response()->json([$timetable]);
        }

        return response()->json(['message' => 'error'], 500);
    }

    public function update(Request $request, $id)
    {
        $timetable = Timetable::find($id);
        $timetable->start_time = $request->get('start_time');
        $timetable->end_time = $request->get('end_time');
        $timetable->playlist_id = $request->get('playlist_id');
        $timetable->save();

        $timetable->playlist = $timetable->playlist();

        return response()->json($timetable);
    }

    public function destroy($id)
    {
        $timetable = Timetable::find($id);
        $timetable->playlist = $timetable->playlist();
        $timetable->delete();

        return response()->json($timetable);
    }

    public function destroyRepeats($repeat_id)
    {
        $timetables = Timetable::where('repeat_id', $repeat_id)->get();

        foreach($timetables as $timetable) {
            $timetable->delete();
        }

        return response()->json($timetables);
    }
}

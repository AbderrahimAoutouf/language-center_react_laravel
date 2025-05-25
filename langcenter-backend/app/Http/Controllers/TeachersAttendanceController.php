<?php

namespace App\Http\Controllers;

use App\Models\TeachersAttendance;
use App\Models\Class_;
use Illuminate\Http\Request;
use App\Http\Resources\TeachersAttendanceResource;

class TeachersAttendanceController extends Controller
{
    /**
     * Display all attendance records.
     */
    public function index()
    {
        $data = TeachersAttendance::all();
        return TeachersAttendanceResource::collection($data);
    }

    /**
     * Store attendance records for teachers in a given class.
     */
    public function store($class_id, Request $request)
    {
        $dates = $request->input('dates');
        $teachers = Class_::where('id', $class_id)->pluck('teacher_id');
        $teachersAttendance = [];

        foreach ($teachers as $teacher_id) {
            foreach ($dates as $date) {
                $existingAttendance = TeachersAttendance::where('teacher_id', $teacher_id)
                    ->where('date', $date)
                    ->where('class_id', $class_id)
                    ->first();

                if (!$existingAttendance) {
                    $attendance = TeachersAttendance::create([
                        'date' => $date,
                        'teacher_id' => $teacher_id,
                        'isAbsent' => 0,
                        'reason' => '',
                        'late_hours' => null, // support late hours from start
                        'class_id' => $class_id,
                    ]);
                    $teachersAttendance[] = $attendance;
                }
            }
        }

        return response()->json(['teachersAttendance' => $teachersAttendance], 201);
    }

    /**
     * Display attendance records for a specific class.
     */
    public function show($class_id)
    {
        $teacherId = Class_::where('id', $class_id)->pluck('teacher_id');
        $records = TeachersAttendance::where('teacher_id', $teacherId)
            ->where('class_id', $class_id)
            ->get();

        return TeachersAttendanceResource::collection($records);
    }

    /**
     * Update attendance records (called when saving from frontend).
     */
    public function update($class_id, Request $request)
    {
        $requests = $request->all();

        foreach ($requests as $req) {
            if ($req['role'] === 'teacher') {
                $teacherId = $req['id'];
                $attendanceData = $req['attendanceData'];

                foreach ($attendanceData as $data) {
                    $date = $data['date'];
                    $attendanceStatus = $data['attendanceStatus'];
                    $lateHours = $data['lateHours'] ?? null;

                    $record = TeachersAttendance::where('teacher_id', $teacherId)
                        ->where('date', $date)
                        ->where('class_id', $class_id)
                        ->first();

                    if ($record) {
                        $record->isAbsent = $attendanceStatus;
                        $record->late_hours = $lateHours;
                        $record->save();
                    }
                }
            }
        }

        return response()->json(['message' => 'Attendance updated successfully'], 200);
    }

    /**
     * Delete attendance rows for a given date(s) and class.
     */
    public function destroy($class_id, Request $request)
    {
        $dates = $request->input('date');
        $teachers = Class_::where('id', $class_id)->pluck('teacher_id');

        $deleted = TeachersAttendance::whereIn('date', $dates)
            ->whereIn('teacher_id', $teachers)
            ->where('class_id', $class_id)
            ->delete();

        return response()->json([
            'message' => 'Rows deleted successfully',
            'rows_deleted' => $deleted
        ], 200);
    }
}

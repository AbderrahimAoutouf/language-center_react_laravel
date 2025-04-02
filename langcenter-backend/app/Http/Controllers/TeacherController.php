<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use Illuminate\Http\Request;
use App\Http\Resources\TeacherResource;
use Illuminate\Validation\Rule;

class TeacherController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $teachers = Teacher::all();
        return TeacherResource::collection($teachers);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'address' => 'required|string',
            'cin' => 'required|string|unique:teachers,cin',
            'email' => 'nullable|email|unique:teachers,email', // Changed to nullable
            'phone' => 'required|string|unique:teachers,phone',
            'diploma' => 'nullable|string', // Changed to nullable
            'speciality' => 'nullable|string', // Changed to nullable
            'hourly_rate' => 'required|integer',
            'birthday' => 'required|date',
            'gender' => 'required|string'
        ]);
        $teacher = new Teacher();
        $teacher->first_name = $request->first_name;
        $teacher->last_name = $request->last_name;
        $teacher->address = $request->address;
        $teacher->cin = $request->cin;
        $teacher->email = $request->email ?? null;
        $teacher->phone = $request->phone;
        $teacher->diploma = $request->diploma ?? null;
        $teacher->speciality = $request->speciality ?? null;
        $teacher->hourly_rate = $request->hourly_rate;
        $teacher->birthday = $request->birthday;
        $teacher->hiredate = now();
        $teacher->gender = $request->gender;
        $teacher->save();
        return new TeacherResource($teacher);
    }

    /**
     * Display the specified resource.
     */
    public function show(Teacher $teacher)
    {
        return new TeacherResource($teacher);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Teacher $teacher)
    {
        $data = $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'address' => 'required|string',
            'cin' => [
                'required',
                'string',
                'max:255',
                Rule::unique('teachers')->ignore($teacher->id),
            ],
            'email' => [
                'nullable',
                'email',
                Rule::unique('teachers')->ignore($teacher->id),
            ],
            'phone' => [
                'required',
                'string',
                'max:255',
                Rule::unique('teachers')->ignore($teacher->id),
            ],
            'diploma' => 'nullable|string',
            'speciality' => 'nullable|string',
            'hourly_rate' => 'required|integer',
            'birthday' => 'required|date',
            'gender' => 'required|string'
        ]);
        $teacher->update($data);

        return new TeacherResource($teacher);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Teacher $teacher)
    {
        $teacher->delete();
        return response()->json(null, 204);
    }
}

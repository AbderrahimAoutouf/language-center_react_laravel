<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use Illuminate\Http\Request;
use App\Http\Resources\TeacherResource;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

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
        try {
            $validated = $request->validate([
                'first_name' => 'required|string',
                'last_name' => 'required|string',
                'address' => 'required|string',
                'cin' => 'required|string|unique:teachers,cin',
                'email' => 'nullable|email|unique:teachers,email',
                'phone' => 'required|string|unique:teachers,phone',
                'diploma' => 'nullable|string',
                'F' => 'nullable|string',
                'hourly_rate' => 'required|integer',
                'birthday' => 'required|date',
                'gender' => 'required|string'
            ]);

            $teacher = Teacher::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'address' => $validated['address'],
                'cin' => $validated['cin'],
                'email' => $validated['email'] ?? null,
                'phone' => $validated['phone'],
                'diploma' => $validated['diploma'] ?? null,
                'speciality' => $validated['speciality'] ?? null,
                'hourly_rate' => $validated['hourly_rate'],
                'birthday' => $validated['birthday'],
                'hiredate' => now(),
                'gender' => $validated['gender'],
            ]);

            return new TeacherResource($teacher);
        } catch (\Exception $e) {
            Log::error('Error storing teacher: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur serveur : ' . $e->getMessage()
            ], 500);
        }
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
        try {
            $data = $request->validate([
                'first_name' => 'required|string',
                'last_name' => 'required|string',
                'address' => 'required|string',
                'cin' => [
                    'required',
                    'string',
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
        } catch (\Exception $e) {
            Log::error('Error updating teacher: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la mise à jour : ' . $e->getMessage()
            ], 500);
        }
    }
    public function toggleActive(Teacher $teacher)
{
    try {
        // Inverser l'état de l'enseignant (actif/inactif)
        $teacher->active = !$teacher->active;
        $teacher->save();

        return new TeacherResource($teacher);
    } catch (\Exception $e) {
        Log::error('Error toggling active status: ' . $e->getMessage());
        return response()->json([
            'message' => 'Erreur lors de la mise à jour de l\'état actif : ' . $e->getMessage()
        ], 500);
    }
}


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Teacher $teacher)
    {
        try {
            $teacher->delete();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error('Error deleting teacher: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erreur lors de la suppression : ' . $e->getMessage()
            ], 500);
        }
    }
}

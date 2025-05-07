<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use Illuminate\Http\Request;
use App\Http\Resources\TeacherResource;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;


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
                'address' => 'nullable|string',
                'cin' => 'nullable|string|unique:teachers,cin',
                'email' => 'nullable|email|unique:teachers,email',
                'phone' => 'required|string|unique:teachers,phone',
                'diploma' => 'nullable|string',
                'F' => 'nullable|string',
                'hourly_rate' => 'nullable|integer',
                'birthday' => 'nullable|date',
                'gender' => 'nullable|string',
                'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'contract_type' => 'required|string|in:hourly,monthly',
                'monthly_salary' => 'nullable|numeric|required_if:contract_type,monthly',
            ]);
            if ($request->hasFile('avatar')) {
                $path = $request->file('avatar')->store('avatars', 'public');
                $validated['avatar'] = $path;
            }
        

            $teacher = Teacher::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'address' => $validated['address'] ?? null,
                'cin' => $validated['cin'] ?? null,
                'email' => $validated['email'] ?? null,
                'phone' => $validated['phone'],
                'diploma' => $validated['diploma'] ?? null,
                'speciality' => $validated['speciality'] ?? null,
                'hourly_rate' => $validated['hourly_rate'] ?? null,
                'birthday' => $validated['birthday'] ?? null,
                'hiredate' => now(),
                'gender' => $validated['gender'] ?? null,
                'contract_type' => $validated['contract_type'],
                'monthly_salary' => $validated['contract_type'] === 'monthly' ? $validated['monthly_salary'] : null,
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
                'address' => 'nullable|string',
                'cin' => [
                    'nullable',
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
                'hourly_rate' => 'nullable|integer',
                'birthday' => 'nullable|date',
                'gender' => 'nullable|string',
                'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);
            if ($request->hasFile('avatar')) {
                // Supprimer l'ancien avatar
                if ($teacher->avatar) {
                    Storage::disk('public')->delete($teacher->avatar);
                }
                
                $path = $request->file('avatar')->store('avatars', 'public');
                $data['avatar'] = $path;
            }

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

    /**
     * 
     */

    public function updateAvatar(Request $request, Teacher $teacher)
{
    $request->validate([
        'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
    ]);

    if ($teacher->avatar && $teacher->avatar != 'avatars/default-avatar.jpg') {
        Storage::disk('public')->delete($teacher->avatar);
    }

    $path = $request->file('avatar')->store('avatars', 'public');
    $teacher->update(['avatar' => $path]);

    return response()->json([
        'avatar_url' => asset("storage/$path")
    ]);
}
}

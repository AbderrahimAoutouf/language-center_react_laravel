<?php

namespace App\Http\Controllers;

use App\Models\Class_;
use Illuminate\Http\Request;
use App\Http\Resources\ClassRessource;
use App\Models\Cours;
use Illuminate\Support\Facades\Log;

class ClassController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    // public function index()
    //{
    //   $classes = Class_::all();
    //   return response(ClassRessource::collection($classes), 200);
    //}
    public function index(Request $request)
    {
        if ($request->has('cours_id')) {
            $coursId = $request->input('cours_id');
            $classes = Class_::where('cours_id', $coursId)->get();
            return response(ClassRessource::collection($classes), 200);
        } else {
            $classes = Class_::all();
            return response(ClassRessource::collection($classes), 200);
        }
    }




    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:254|unique:classes',
            'school_year' => 'required|string|max:254',
            'description' => 'string|nullable',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'level' => 'required|string|max:254',
            'cours_id' => 'required|integer|exists:cours,id',
            'teacher_id' => 'required|integer|exists:teachers,id',
            'event_color' => 'string',
        ]);
        $class_ = new Class_();
        $class_->name = $data['name'];
        $class_->school_year = $data['school_year'];
        $class_->description = $data['description'];
        $class_->start_date = $data['start_date'];
        $class_->end_date = $data['end_date'];
        $class_->level = $data['level'];
        $class_->cours_id = $data['cours_id'];
        $class_->teacher_id = $data['teacher_id'];
        $class_->event_color = $data['event_color'];
        $class_->save();

        Log::info($data);
        return new ClassRessource($class_);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
{
    $class = Class_::with(['etudiants', 'teacher', 'cours'])
        ->withCount('etudiants')
        ->findOrFail($id);
        
    return new ClassRessource($class);
}

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Class_ $class_)
    {
        $data = $request->validate([
            'name' => 'required|string|max:254|unique:classes,name,' . $class_->id,
            'school_year' => 'required|string|max:254',
            'description' => 'string|nullable',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'level' => 'required|string|max:254',
            'cours_id' => 'required|integer|exists:cours,id',
            'teacher_id' => 'required|integer|exists:teachers,id',
            'event_color' => 'string',
        ]);
        $class_->name = $data['name'];
        $class_->school_year = $data['school_year'];
        $class_->description = $data['description'];
        $class_->start_date = $data['start_date'];
        $class_->end_date = $data['end_date'];
        $class_->level = $data['level'];
        $class_->cours_id = $data['cours_id'];
        $class_->teacher_id = $data['teacher_id'];
        $class_->event_color = $data['event_color'];
        $class_->save();
        return new ClassRessource($class_);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Class_ $class_)
    {
        if ($class_) {
            $class_->delete();
            return response(['message' => 'Class deleted'], 200);
        } else {
            return response(['message' => 'Class not found'], 404);
        }
    }
}

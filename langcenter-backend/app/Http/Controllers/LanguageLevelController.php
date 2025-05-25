<?php

namespace App\Http\Controllers;

use App\Models\LanguageLevel;
use Illuminate\Http\Request;

class LanguageLevelController extends Controller
{
    public function index()
    {
        $levels = LanguageLevel::all();
        return response()->json($levels);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string'
        ]);
        $level = LanguageLevel::create($data);
        return response()->json($level);
    }

    public function show(LanguageLevel $languageLevel)
    {
        return response()->json($languageLevel);
    }

    public function update(Request $request, LanguageLevel $languageLevel)
    {
        //
    }

    public function destroy($id)
    {
        $level = LanguageLevel::find($id);
    
        if (!$level) {
            return response()->json(['message' => 'Level not found'], 404);
        }
    
        $level->delete();
    
        return response()->json(['message' => 'Level deleted successfully']);
    }
}

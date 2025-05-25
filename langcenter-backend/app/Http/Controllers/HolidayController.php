<?php

namespace App\Http\Controllers;

use App\Models\Holiday;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class HolidayController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
{
    try {
        return Holiday::select('id', 'name', 'start_date', 'end_date')->get();
    } catch (\Exception $e) {
        \Log::error('Holiday Fetch Error: ' . $e->getMessage());
        return response()->json([
            'message' => 'Failed to retrieve holidays',
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);
        $holiday = Holiday::create([
            'name' => $request->input('name'),
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
        ]);

        return response()->json(['message' => 'Holiday added successfully', 'data' => $holiday], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Holiday $holiday)
    {

        return response()->json(['Holiday' => $holiday]);
    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Holiday $holiday)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Holiday $holiday)
    {
        $request->validate([
            'name' => 'required',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);
        
        $holiday->update($request->all());
        
        return response()->json(['message' => 'Holiday Updated successfully', 'data' => $holiday]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Holiday $holiday)
    {
        $holiday->delete();
        return response()->json(['message' => 'Holiday deleted successfully']);
    }
}

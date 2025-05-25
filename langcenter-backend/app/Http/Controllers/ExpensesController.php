<?php

namespace App\Http\Controllers;

use App\Http\Resources\ExpensesResource;
use App\Models\Expenses;
use Illuminate\Http\Request;

class ExpensesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $expenses = Expenses::all();
        return ExpensesResource::collection($expenses);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
{
    $data = $request->validate([
        'expense_name' => 'required|string|max:255',
        'expense_amount' => 'required|numeric',
        'expense_description' => 'nullable|string',
        'quantity' => 'required|integer',
        'payment_type' => 'required|string|max:100',
        'item_details' => 'required|string',
        'discount' => 'nullable|numeric',
        'total_override' => 'nullable|numeric',
        'purchased_by' => 'required|string|max:255',
        'purchased_from' => 'required|string|max:255',
    ]);

    Expenses::create($data);

    return response()->json([
        'message' => 'Expense created successfully'
    ], 201);
}


    /**
     * Display the specified resource.
     */
    public function show(Expenses $expense)
    {
        return new ExpensesResource($expense);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Expenses $expense)
{
    $data = $request->validate([
        'expense_name' => 'required|string|max:255',
        'expense_amount' => 'required|numeric',
        'expense_description' => 'nullable|string',
        'quantity' => 'required|integer',
        'payment_type' => 'required|string|max:100',
        'item_details' => 'required|string',
        'discount' => 'nullable|numeric',
        'total_override' => 'nullable|numeric',
        'purchased_by' => 'required|string|max:255',
        'purchased_from' => 'required|string|max:255',
    ]);

    $expense->update($data);

    return response()->json([
        'message' => 'Expense updated successfully'
    ], 200);
}


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Expenses $expense)
    {
        $expense->delete();
        return response()->json([
            'message' => 'Expense deleted successfully'
        ], 200);
    }
}

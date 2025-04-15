<?php

namespace App\Http\Controllers;

use App\Http\Resources\ParentResource;
use App\Models\Parent_;
use Illuminate\Http\Request;

class ParentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $parents = Parent_::orderBy('id','desc')->paginate(10);
        return ParentResource::collection($parents);
  
    }



    /**
     * Display the specified resource.
     */
    public function show(Parent_ $parent_)
    {
        return new ParentResource($parent_);
    }



    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Parent_ $parent_)
    {

            // Validate the request data
            $request->validate([
                'nom' => 'required|string',
                'prenom' => 'required|string',
                'cin' => 'required|string',
                'date_naissance' => 'required|date',
                'sexe' => 'required|string',
                'email' => 'required|email',
                'telephone' => 'required|string',
                'adresse' => 'required|string',
                // Add validation rules for other fields
            ]);

            // Update the Parent fields
            $parent_->nom = $request->nom;
            $parent_->prenom = $request->prenom;
            $parent_->sexe = $request->sexe;
            $parent_->cin = $request->cin;
            $parent_->email = $request->email;
            $parent_->adresse = $request->adresse;
            $parent_->telephone = $request->telephone;
            $parent_->date_naissance = $request->date_naissance;
            // Update other fields
            $parent_->save();

            return response()->json(['message' => 'Parent updated successfully']);
    }
    /**
     * 
     */
    public function search(Request $request)
{
    return Parent_::where('nom', 'like', '%'.$request->q.'%')
        ->orWhere('prenom', 'like', '%'.$request->q.'%')
        ->active()
        ->limit(10)
        ->get();
}

public function archive(Parent_ $parent)
{
    $parent->update(['archived' => !$parent->archived]);
    return response()->json(['message' => 'Parent archivé/désarchivé']);
}
}

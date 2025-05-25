<?php

namespace App\Http\Controllers;

use App\Models\Etudiant;
use App\Models\Parent_;
use Illuminate\Http\Request;

class ApiController extends Controller
{
    public function getEtudiants()
    {
        $etudiants = Etudiant::all();
        return response()->json($etudiants);
    }

    public function createEtudiant(Request $request)
    {
        // Validate the request data
        $data = $request->validate([
            'nom' => 'required|string|max:254',
            // 'prenom' => 'required|string|max:254',
            // 'date_naissance' => 'required|date',
            // 'sexe' => 'required|string|max:254',
            // 'email' => 'required|string|email|max:254',
            // 'adresse' => 'required|string|max:254',
            // 'telephone' => 'required|string|max:254',
            // 'isActive' => 'required|boolean',
            'parent_nom' => 'string|max:254',
            // 'parent_prenom' => 'string|max:254',
            'parent_cin' => 'nullable|string|max:254',
            // 'parent_email' => 'string|email|max:254',
            // 'parent_adresse' => 'string|max:254',
            // 'parent_telephone' => 'string|max:254',
            // 'parent_nbenfants' => 'integer|max:254',
        ]);

        // Create a new Etudiant instance and save it to the database
        $etudiant = new Etudiant();
        $etudiant->nom = $request->nom;
        // $etudiant->prenom = $request->input('prenom');
        // $etudiant->date_naissance = $request->input('date_naissance');
        // $etudiant->sexe = $request->input('sexe');
        // $etudiant->email = $request->input('email');
        // $etudiant->adresse = $request->input('adresse');
        // $etudiant->telephone = $request->input('telephone');
        // $etudiant->isActive = $request->input('isActive');
        // Check if the parent with the given cin exists
        $parent = Parent_::where('cin', $request->parent_cin)->first();
        if ($parent) {
            // If the parent exists, associate it with the etudiant
            $etudiant->parent_()->associate($parent);
        } else {
            // If the parent does not exist, create a new parent and associate it
            $newParent = new Parent_();
            $newParent->nom = $request->input('parent_nom');
            // $newParent->prenom = $request->input('parent_prenom');
            $newParent->cin = $request->input('parent_cin');
            // $newParent->email = $request->input('parent_email');
            // $newParent->adresse = $request->input('parent_adresse');
            // $newParent->telephone = $request->input('parent_telephone');
            // $newParent->nbenfants = $request->input('parent_nbenfants');
            $newParent->save();
            $etudiant->parent_()->associate($newParent);
        }
        $etudiant->save();
        return response()->json(['message' => 'Etudiant created successfully'], 201);
    }

    public function updateEtudiant(Request $request, $etudiantId)
    {
        // Find the Etudiant by ID
        $etudiant = Etudiant::findOrFail($etudiantId);

        // Validate the request data
        $request->validate([
            'nom' => 'required',
            'prenom' => 'required',
            // Add validation rules for other fields
        ]);

        // Update the Etudiant fields
        $etudiant->nom = $request->input('nom');
        $etudiant->prenom = $request->input('prenom');
        // Update other fields

        $etudiant->save();

        return response()->json(['message' => 'Etudiant updated successfully']);
    }

    public function deleteEtudiant($etudiantId)
    {
        // Find the Etudiant by ID and delete it
        $etudiant = Etudiant::findOrFail($etudiantId);
        $etudiant->delete();

        return response()->json(['message' => 'Etudiant deleted successfully']);
    }

    public function getParents()
    {
        $parents = Parent_::all();
        return response()->json($parents);
    }

    public function createParent(Request $request)
    {
        // Validate the request data
        $request->validate([
            'nom' => 'required',
            'prenom' => 'required',
            // Add validation rules for other fields
        ]);

        // Create a new Parent instance and save it to the database
        $parent = new Parent_();
        $parent->nom = $request->input('nom');
        $parent->prenom = $request->input('prenom');
        // Set other fields' values

        $parent->save();

        return response()->json(['message' => 'Parent created successfully']);
    }

    public function updateParent(Request $request, $parentId)
    {
        // Find the Parent by ID
        $parent = Parent_::findOrFail($parentId);

        // Validate the request data
        $request->validate([
            'nom' => 'required',
            'prenom' => 'required',
            // Add validation rules for other fields
        ]);

        // Update the Parent fields
        $parent->nom = $request->input('nom');
        $parent->prenom = $request->input('prenom');
        // Update other fields

        $parent->save();

        return response()->json(['message' => 'Parent updated successfully']);
    }

    public function deleteParent($parentId)
    {
        // Find the Parent by ID and delete it
        $parent = Parent_::findOrFail($parentId);
        $parent->delete();

        return response()->json(['message' => 'Parent deleted successfully']);
    }







    // Implement similar delete methods for Etudiant, Parent, and Groupe
}

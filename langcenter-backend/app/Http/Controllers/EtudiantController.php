<?php

namespace App\Http\Controllers;

use App\Models\Etudiant;
use App\Models\Parent_;
use Illuminate\Http\Request;
use App\Http\Resources\EtudiantResource;
use DateTime;

class EtudiantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $etudiant = Etudiant::orderBy('id', 'desc')->paginate(10);
        return EtudiantResource::collection($etudiant);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => 'required|string',
            'prenom' => 'required|string',
            'date_naissance' => 'required|date',
            'sexe' => 'required|string',
            'email' => 'email|unique:etudiants|nullable',
            'adresse' => 'required|string',
            'telephone' => 'string|max:13|regex:/^([0-9\s\-\+\(\)]*)$/|min:10|unique:etudiants|nullable',
            'parent_cin' => 'string',
            'parent_nom' => 'string',
            'parent_prenom' => 'string',
            'parent_sexe' => 'string|nullable',
            'parent_date_naissance' => 'date|nullable',
            //tell the database i want to check the email feild in parents table and if it is unique
            'parent_email' => 'email|unique:parents,email|nullable',
            'parent_adresse' => 'string|nullable',
            'parent_telephone' => 'string|max:13|regex:/^([0-9\s\-\+\(\)]*)$/|min:10|unique:parents,telephone|nullable',
            'emergency_contact' => 'required|string',
            'parent_relationship' => 'required|in:père,mère,tuteur,frère,sœur',
        ]);
        $etudiant = new Etudiant();
        $etudiant->nom = $data['nom'];
        $etudiant->prenom = $data['prenom'];
        $etudiant->date_naissance = $data['date_naissance'];
        $etudiant->sexe = $data['sexe'];
        $etudiant->email = $data['email'];
        $etudiant->adresse = $data['adresse'];
        $etudiant->telephone = $data['telephone'];
        $birthDate = new DateTime($data['date_naissance']);
        $now = new DateTime();
        $age = $now->diff($birthDate)->y;

        // Assign the age group based on the calculated age
        if ($age < 13) {
            $etudiant->age_group = 'kid';
        } elseif ($age >= 13 && $age < 18) {
            $etudiant->age_group = 'teenager';
        } else {
            $etudiant->age_group = 'adult';
        }
        if ($request->has('underAge') && $request->underAge == true) {
            $parent = Parent_::where('cin', $request->parent_cin)->first();
            if ($parent) {
                // If the parent exists, associate it with the etudiant
                $etudiant->parent_()->associate($parent);
                $parent->update(['archived' => $request->archived ?? false]);
            } else {
                // If the parent does not exist, create a new parent and associate it
                $newParent = new Parent_();
                $newParent->nom = $request->parent_nom;
                $newParent->prenom = $request->parent_prenom;
                $newParent->sexe = $request->parent_sexe;
                $newParent->cin = $request->parent_cin;
                $newParent->email = $request->parent_email;
                $newParent->adresse = $request->parent_adresse;
                $newParent->telephone = $request->parent_telephone;
                $newParent->date_naissance = $request->parent_date_naissance;
                $newParent->relationship = $request->parent_relationship;
                $newParent->archived = $request->archived ?? false;
                $newParent->save();
                $etudiant->parent_()->associate($newParent);
            }
        } 
        $etudiant->emergency_contact = $data['emergency_contact'];
    $etudiant->save();
        
        return new EtudiantResource($etudiant);
    }

    /**
     * Display the specified resource.
     */
    public function show(Etudiant $etudiant)
    {
        //
        return new EtudiantResource($etudiant);
    }



    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Etudiant $etudiant)
    {
        $data = $request->validate([
            'nom' => 'required|string',
            'prenom' => 'required|string',
            'date_naissance' => 'required|date',
            'sexe' => 'required|string',
            'email' => 'required|email|unique:etudiants,email,' . $etudiant->id,
            'adresse' => 'required|string',
            'telephone' => 'required|string|max:13|regex:/^([0-9\s\-\+\(\)]*)$/|min:10|unique:etudiants,telephone,' . $etudiant->id,
            'parent_cin' => 'string',
            'parent_telephone' => 'required|string|max:13|unique:parents,telephone',
            'emergency_contact' => 'required|string|min:3',
            'parent_relationship' => 'required|in:père,mère,tuteur,frère,sœur', 
        ]);
        if ($request->has('underAge') && $request->underAge == true) {
            $parent = Parent_::where('cin', $request->parent_cin)->first();
            if ($parent) {
                // If the parent exists, associate it with the etudiant
                $etudiant->parent_()->associate($parent); 
                $parent->update(['archived' => $request->archived ?? false]);
            } else {
                // If the parent does not exist, create a new parent and associate it
                $newParent = new Parent_();
                $newParent->nom = $request->parent_nom;
                $newParent->prenom = $request->parent_prenom;
                $newParent->sexe = $request->parent_sexe;
                $newParent->cin = $request->parent_cin;
                $newParent->email = $request->parent_email;
                $newParent->adresse = $request->parent_adresse;
                $newParent->telephone = $request->parent_telephone;
                $newParent->date_naissance = $request->parent_date_naissance;
                $newParent->save();
                $etudiant->parent_()->associate($newParent);
            }
        } else {
            $etudiant->parent_()->associate(null);
        }
        $etudiant->nom = $request->nom;
        $etudiant->prenom = $request->prenom;
        $etudiant->date_naissance = $request->date_naissance;
        $etudiant->sexe = $request->sexe;
        $etudiant->email = $request->email;
        $etudiant->adresse = $request->adresse;
        $etudiant->telephone = $request->telephone;
        $birthDate = new DateTime($data['date_naissance']);
        $now = new DateTime();
        $age = $now->diff($birthDate)->y;

        // Assign the age group based on the calculated age
        if ($age < 13) {
            $etudiant->age_group = 'kid';
        } elseif ($age >= 13 && $age < 18) {
            $etudiant->age_group = 'teenager';
        } else {
            $etudiant->age_group = 'adult';
        }
        $etudiant->save();
        return new EtudiantResource($etudiant);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Etudiant $etudiant)
    {
        // Delete the inscrireClass
        $etudiant->load('inscrireClasses');
        $etudiant->inscrireClasses->each(function ($inscrireClass) {
            $inscrireClass->delete();
        });

        // Delete the etudiant
        if ($etudiant->parent_ && $etudiant->parent_->etudiant->count() == 1) {
            $etudiant->parent_->delete();
        }
        $etudiant->delete();
        return response()->json(null, 204);
    }
}

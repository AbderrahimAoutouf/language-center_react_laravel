<?php

namespace App\Http\Controllers;

use App\Models\Etudiant;
use App\Models\Parent_;
use Illuminate\Http\Request;
use App\Http\Resources\EtudiantResource;
use DateTime;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;



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
        'sexe' => 'nullable|string',
        'email' => 'email|unique:etudiants|nullable',
        'adresse' => 'nullable|string',
        'telephone' => 'string|max:13|regex:/^([0-9\s\-\+\(\)]*)$/|min:10|unique:etudiants|nullable',
        'parent_cin' => 'string|nullable',
        'parent_nom' => 'string|nullable',
        'parent_prenom' => 'string|nullable',
        'parent_sexe' => 'string|nullable',
        'parent_date_naissance' => 'date|nullable',
        'parent_email' => 'email|unique:parents,email|nullable',
        'parent_adresse' => 'string|nullable',
        'parent_telephone' => 'string|max:13|regex:/^([0-9\s\-\+\(\)]*)$/|min:10|unique:parents,telephone|nullable',
        'emergency_contact' => 'nullable|string',
        'avance' => 'nullable|numeric',
        'parent_relationship' => 'nullable|in:père,mère,tuteur,frère,sœur',
        'gratuit' => 'nullable|boolean',
        'photo_authorized' => 'required|boolean',
        'cours_id' => 'nullable|exists:cours,id',
    ]);

    $etudiant = new Etudiant();
    $etudiant->nom = $data['nom'];
    $etudiant->prenom = $data['prenom'];
    $etudiant->date_naissance = $data['date_naissance'];
    $etudiant->sexe = $data['sexe'] ?? null;
    $etudiant->email = $data['email'] ?? null;
    $etudiant->adresse = $data['adresse'] ?? null;
    $etudiant->telephone = $data['telephone'] ?? null;
    $etudiant->gratuit = $data['gratuit'] ?? false;
    $etudiant->photo_authorized = $data['photo_authorized'];
    $etudiant->avance = $data['avance'] ?? 0;
    $etudiant->cours_id = $data['cours_id']; 


    $birthDate = new DateTime($data['date_naissance']);
    $now = new DateTime();
    $age = $now->diff($birthDate)->y;

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
            $etudiant->parent_()->associate($parent);
            $parent->update(['archived' => $request->archived ?? false]);
        } else {
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

    $etudiant->save();

    return response()->json(['data' => new EtudiantResource($etudiant)]);
}

    /**
     * Display the specified resource.
     */
    public function show(Etudiant $etudiant)
    {
        //
        return new EtudiantResource($etudiant);
    }
    public function authorizePhoto(Etudiant $etudiant)
{
    $etudiant->update(['photo_authorized' => true]);
    return response()->json($etudiant);
}

public function generateReceipt($id)
    {
        try {
            Log::info("Generating receipt for student ID: {$id}");
            
            // Load student with all necessary relationships
            $etudiant = Etudiant::with([
                'inscrireClasses.payments', 
                'inscrireClasses.class.cours',
                'parent_',
                'cours' 
            ])->find($id);

            if (!$etudiant) {
                Log::error("Student not found with ID: {$id}");
                return response()->json(['error' => 'Student not found'], 404);
            }

            Log::info("Student found: {$etudiant->prenom} {$etudiant->nom}");

            // Get the inscription and related data
            $inscription = $etudiant->inscrireClasses->first();
            $classe = $inscription ? $inscription->class : null;
            $cours = $etudiant->cours;
            $payment = $inscription && $inscription->payments ? $inscription->payments->first() : null;

            Log::info("Receipt data - Inscription: " . ($inscription ? 'found' : 'not found'));
            Log::info("Receipt data - Class: " . ($classe ? $classe->name : 'not found'));
            Log::info("Receipt data - Course: " . ($cours ? $cours->title : 'not found'));
            Log::info("Receipt data - Payment: " . ($payment ? $payment->payment_amount : 'not found'));

            // Prepare data for the PDF view
            $receiptData = [
                'etudiant' => $etudiant,
                'classe' => $classe,
                'cours' => $cours,
                'payment' => $payment,
                'inscription' => $inscription,
                'date_generation' => now()->format('d/m/Y H:i'),
            ];

            // Generate PDF
            $pdf = Pdf::loadView('receipt', $receiptData)
                ->setPaper('a4', 'portrait')
                ->setOptions([
                    'defaultFont' => 'sans-serif',
                    'isHtml5ParserEnabled' => true,
                    'isRemoteEnabled' => true,
                ]);

            $filename = "receipt-{$id}-" . now()->format('Y-m-d-H-i-s') . ".pdf";
            
            Log::info("PDF generated successfully for student ID: {$id}");

            // Return PDF as download
            return $pdf->download($filename);
            
        } catch (\Exception $e) {
            Log::error("Error generating receipt for student ID {$id}: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());
            
            return response()->json([
                'error' => 'Failed to generate receipt',
                'message' => $e->getMessage()
            ], 500);
        }
    }
      public function generateReceiptStream($id)
    {
        try {
            $etudiant = Etudiant::with([
                'inscrireClasses.payments', 
                'inscrireClasses.class.cours',
                'parent_'
            ])->find($id);

            if (!$etudiant) {
                return response()->json(['error' => 'Student not found'], 404);
            }

            $inscription = $etudiant->inscrireClasses->first();
            $classe = $inscription ? $inscription->class : null;
            $cours = $classe ? $classe->cours : null;
            $payment = $inscription && $inscription->payments ? $inscription->payments->first() : null;

            $receiptData = [
                'etudiant' => $etudiant,
                'classe' => $classe,
                'cours' => $cours,
                'payment' => $payment,
                'inscription' => $inscription,
                'date_generation' => now()->format('d/m/Y H:i'),
            ];

            $pdf = Pdf::loadView('receipt', $receiptData)
                ->setPaper('a4', 'portrait')
                ->setOptions([
                    'defaultFont' => 'sans-serif',
                    'isHtml5ParserEnabled' => true,
                    'isRemoteEnabled' => true,
                ]);

            return $pdf->stream("receipt-{$id}.pdf");
            
        } catch (\Exception $e) {
            Log::error("Error generating receipt stream for student ID {$id}: " . $e->getMessage());
            
            return response()->json([
                'error' => 'Failed to generate receipt',
                'message' => $e->getMessage()
            ], 500);
        }
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
            'sexe' => 'nullable|string',
            'email' => 'nullable|email|unique:etudiants,email,' . $etudiant->id,
            'adresse' => 'nullable|string',
            'telephone' => 'nullable|string|max:13|regex:/^([0-9\s\-\+\(\)]*)$/|min:10|unique:etudiants,telephone,' . $etudiant->id,
            'parent_cin' => 'string',
            'parent_telephone' => 'nullable|string|max:13|unique:parents,telephone',
            'emergency_contact' => 'nullable|string|min:3',
            'avance' => 'nullable|numeric',
            'parent_relationship' => 'nullable|in:père,mère,tuteur,frère,sœur', 
            'photo_authorized' => 'required|boolean',
            'gratuit' => 'nullable|boolean',
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
        $etudiant->photo_authorized = $data['photo_authorized']; 
        $etudiant->avance = $data['avance'] ?? $etudiant->avance;
        $etudiant->gratuit = $data['gratuit'] ?? false; 
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

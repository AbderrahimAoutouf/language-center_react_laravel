<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ParentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nom' => $this->nom,
            'prenom' => $this->prenom,
            'cin' => $this->cin,
            'sexe' => $this->sexe,
            'date_naissance' => date('Y-m-d', strtotime($this->date_naissance)),
            'email' => $this->email,
            'adresse' => $this->adresse,
            'telephone' => $this->telephone,
            'nb_enfant_inscrit' => $this->etudiant()->count(),
            'enfants' => $this->etudiant()->get(),
            'relationship' => $this->relationship,
            'archived' => $this->archived,
            'emergency_contact' => $this->emergency_contact
        ];
    }
}

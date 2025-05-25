<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\CoursResource;

class EtudiantResource extends JsonResource
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
            'date_naissance' => $this->date_naissance,
            'sexe' => $this->sexe,
            'email' => $this->email,
            'adresse' => $this->adresse,
            'telephone' => $this->telephone,
            'isActive' => $this->isActive,
            'parent' => $this->parent_,
            'gratuit' => $this->gratuit,
        'photo_authorized' => $this->photo_authorized,
            'classes' => $this->inscrireClasses->map(function ($inscrireClass) {
                return $inscrireClass->class_;
            }),
            'cours' => $this->inscrireClasses->map(function ($inscrireClass) {
                return $inscrireClass->class_ != null ? $inscrireClass->class_->cours : null;
            }),
            'level' => $this->level,
            'age_group' => $this->age_group,
        ];
    }
}

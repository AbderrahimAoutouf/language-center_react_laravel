<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\CoursResource;
use App\Http\Resources\TeacherResource;
use App\Http\Resources\EtudiantResource;

class ClassRessource extends JsonResource
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
            'name' => $this->name,
            'school_year' => $this->school_year,
            'description' => $this->description,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'level' => $this->level,
            'nb_etudiants' => $this->etudiants_count,
            'cours' => new CoursResource($this->cours),
            'teacher' => new TeacherResource($this->teacher),
            'etudiants' => EtudiantResource::collection($this->whenLoaded('etudiants')),
            'event_color' => $this->event_color,
        ];
    }

}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'cin' => $this->cin,
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'diploma' => $this->diploma,
            'speciality' => $this->speciality,
            'hourly_rate' => $this->hourly_rate,
            'birthday' => $this->birthday,
            'hiredate' => $this->hiredate,
            'gender' => $this->gender,
            'active' => $this->active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

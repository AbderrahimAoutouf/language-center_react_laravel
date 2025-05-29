<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $total_amount = 0;
        foreach ($this->inscrireClass->payments as $payment) {
            $total_amount += $payment->amount;
        }
        return [
            'id' => $this->id,
            'inscription_id' => $this->inscrireClass->id,
            'etudiant_name' => $this->getEtudiantName(),
            'classe_name' => $this->getClasseName(),
            'classe_id' => $this->getClasseId(),
            'cours_fee' => $this->getCourseFee(),
            'etudiant_id' => $this->getEtudiantId(),
            'avance' => $this->getEtudiantAvance(),
            'status' => $this->inscrireClass->payment_status,
            'negotiated_price' => (float)$this->getNegotiatedPrice(),
            'amount' => (float)$this->amount,
            'payment_date' => $this->payment_date,
            'remaining' => ((float)$this->getNegotiatedPrice()) - ((float)$total_amount) > 0 ? ((float)$this->getNegotiatedPrice()) - ((float)$total_amount) : 0,
        ];
    }
}

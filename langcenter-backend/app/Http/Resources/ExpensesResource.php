<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;

class ExpensesResource extends JsonResource
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
            'expense_name' => $this->expense_name,
            'expense_amount' => $this->expense_amount,
            'expense_description' => $this->expense_description,
            'quantity' => $this->quantity,
            'payment_type' => $this->payment_type,
            'item_details' => $this->item_details,
            'discount' => $this->discount,
            'total_override' => $this->total_override,
            'purchased_by' => $this->purchased_by,
            'purchased_from' => $this->purchased_from,
            'created_at' => Carbon::parse($this->created_at)->format('Y-m-d H:i:s'),
            'updated_at' => Carbon::parse($this->updated_at)->format('Y-m-d H:i:s'),
        ];
    }
}

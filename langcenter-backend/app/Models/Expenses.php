<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expenses extends Model
{
    use HasFactory;

    protected $fillable = [
        'expense_name',
        'expense_amount',
        'expense_description',
        'quantity',
        'payment_type',
        'item_details',
        'discount',
        'total_override',
        'purchased_by',
        'purchased_from',
    ];
}

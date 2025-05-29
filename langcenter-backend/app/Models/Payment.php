<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\InscrireClass;
use Ramsey\Uuid\Type\Decimal;
use Ramsey\Uuid\Type\Integer;

class Payment extends Model
{
    use HasFactory;
    protected $fillable = [
        'inscrire_class_id',
        'amount',
        'payment_date',
    ];

    public function inscrireClass()
    {
        return $this->belongsTo(InscrireClass::class);
    }
    public function getPaymentDateAttribute($value)
    {
        return date('d-m-Y', strtotime($value));
    }
    public function setPaymentDateAttribute($value)
    {
        $this->attributes['payment_date'] = date('Y-m-d', strtotime($value));
    }
    public function getEtudiantName()
    {
        return $this->inscrireClass->etudiant->prenom . ' ' . $this->inscrireClass->etudiant->nom;
    }
    public function getEtudiantAvance()
    {
        return $this->inscrireClass->etudiant->avance;
    }
    public function getClasseName()
    {
        return $this->inscrireClass->class_->name;
    }
    public function getClasseId()
    {
        return $this->inscrireClass->class_->id;
    }
    public function getEtudiantId()
    {
        return $this->inscrireClass->etudiant->id;
    }
    public  function getNegotiatedPrice()
    {
        return $this->inscrireClass->negotiated_price;
    }
    public function getCourseFee()
    {
        return $this->inscrireClass->class_->cours->price;
    }
    public function getStatus()
    {
        return $this->inscrireClass->status;
    }
}

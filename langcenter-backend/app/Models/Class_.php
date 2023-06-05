<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Etudiant;
use App\Models\InscrireClass;
use App\Models\Cours;

class Class_ extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $table = "classes";
    protected $fillable = [
        'name',
        'school_year',
        'description',
        'capacity',
        'start_date',
        'end_date',
        'level',
        'course_id',
        'teacher_id',
    ];
    public function etudiant()
    {
        return $this->belongsToMany(Etudiant::class, 'inscrire_classes')
            ->using(InscrireClass::class, 'etudiant_id', 'class__id')
            ->withPivot('inscription_date', 'frais_paid');
    }
    public function inscrireClasses()
    {
        return $this->hasMany(InscrireClass::class, 'class__id', 'id');
    }
    public function cours()
    {
        return $this->belongsTo(Cours::class, 'cours_id', 'id');
    }
    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'teacher_id', 'id');
    }
}

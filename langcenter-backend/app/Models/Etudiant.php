<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\Parent_;
use App\Models\InscrireClass;
use App\Models\LanguageLevel;


class Etudiant extends Model
{
    use HasFactory;
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    public $table = 'etudiants';
    public $timestamps = false;
    protected $fillable = [
        'nom',
        'prenom',
        'date_naissance',
        'sexe',
        'email',
        'adresse',
        'telephone',
        'isActive',
        'parent_cin',
        'age_group',
        'emergency_contact'
    ];

    public function parent_()
    {
        return $this->belongsTo(Parent_::class, 'parent_id', 'id');
    }
    public function inscrireClasses()
    {
        return $this->hasMany(InscrireClass::class, 'etudiant_id', 'id');
    }
    public function level()
    {
        return $this->hasOne(LanguageLevel::class, 'id', 'level_id');
    }
    public function registerTests()
    {
        return $this->hasMany(RegisterTest::class, 'student_id', 'id');
    }
}

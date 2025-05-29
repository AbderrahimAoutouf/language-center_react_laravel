<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\CoursResource;
use App\Http\Resources\ClassResource;
use Carbon\Carbon;

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
            // Basic Information
            'id' => $this->id,
            'nom' => $this->nom,
            'prenom' => $this->prenom,
            'full_name' => $this->prenom . ' ' . $this->nom,
            
            // Personal Details
            'date_naissance' => $this->date_naissance,
            'age' => $this->date_naissance ? Carbon::parse($this->date_naissance)->age : null,
            'age_group' => $this->age_group,
            'sexe' => $this->sexe,
            'gender_display' => $this->sexe === 'M' ? 'Male' : ($this->sexe === 'F' ? 'Female' : 'Not Specified'),
            
            // Contact Information
            'email' => $this->email,
            'adresse' => $this->adresse,
            'telephone' => $this->telephone,
            
            // Status and Permissions
            'isActive' => $this->isActive,
            'status' => $this->isActive ? 'Active' : 'Inactive',
            'photo_authorized' => $this->photo_authorized,
            'photo_permission' => $this->photo_authorized ? 'Authorized' : 'Not Authorized',
            
            // Family Information
            'parent' => $this->parent_,
            'parent_name' => $this->when($this->parent, function() {
                return is_string($this->parent) ? $this->parent : 
                       (isset($this->parent['name']) ? $this->parent['name'] : 'Parent Information Available');
            }),
            'parent_contact' => $this->when($this->parent && is_array($this->parent), function() {
                return [
                    'phone' => $this->parent['phone'] ?? null,
                    'email' => $this->parent['email'] ?? null,
                    'relationship' => $this->parent['relationship'] ?? 'Parent/Guardian'
                ];
            }),
            
            // Financial Information
            'gratuit' => $this->gratuit,
            'is_free_student' => $this->gratuit,
            'payment_status' => $this->gratuit ? 'Free' : 'Regular',
            'avance' => $this->avance,
            'advance_payment' => $this->avance,
            'financial_status' => $this->when($this->avance > 0, 'Advance Paid', 'No Advance'),
            
            // Academic Information
            'level' => $this->level,
            'academic_level' => $this->level ?? 'Not Assigned',
            
            // Enrollment Information
            'enrollment_date' => $this->created_at,
            'enrollment_formatted' => $this->created_at ? $this->created_at->format('M d, Y') : null,
            'last_updated' => $this->updated_at,
            'registration_duration' => $this->created_at ? $this->created_at->diffForHumans() : null,
            
            // Classes and Courses with detailed information
            'classes' => $this->inscrireClasses->map(function ($inscrireClass) {
                return $inscrireClass->class_;
            }),
            'cours' => $this->inscrireClasses->map(function ($inscrireClass) {
                return $inscrireClass->class_ != null ? $inscrireClass->class_->cours : null;
            }),
            
            // Statistical Information
            'total_classes' => $this->when($this->relationLoaded('inscrireClasses'), function() {
                return $this->inscrireClasses->whereNotNull('class_')->count();
            }),
            
            'active_enrollments' => $this->when($this->relationLoaded('inscrireClasses'), function() {
                return $this->inscrireClasses->where('status', 'active')->count();
            }),
            
            // Additional computed fields
            'display_name' => $this->prenom . ' ' . $this->nom,
            'initials' => strtoupper(substr($this->prenom, 0, 1) . substr($this->nom, 0, 1)),
            'contact_available' => !empty($this->email) || !empty($this->telephone),
            'complete_profile' => $this->hasCompleteProfile(),
            'profile_completion_percentage' => $this->getProfileCompletionPercentage(),
            
            // Timestamps
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'created_at_human' => $this->created_at ? $this->created_at->diffForHumans() : null,
            'updated_at_human' => $this->updated_at ? $this->updated_at->diffForHumans() : null,
        ];
    }
    
    /**
     * Check if student has complete profile
     */
    private function hasCompleteProfile(): bool
    {
        $requiredFields = ['nom', 'prenom', 'email', 'telephone', 'date_naissance'];
        
        foreach ($requiredFields as $field) {
            if (empty($this->$field)) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Calculate profile completion percentage
     */
    private function getProfileCompletionPercentage(): int
    {
        $fields = [
            'nom' => !empty($this->nom),
            'prenom' => !empty($this->prenom),
            'email' => !empty($this->email),
            'telephone' => !empty($this->telephone),
            'date_naissance' => !empty($this->date_naissance),
            'adresse' => !empty($this->adresse),
            'sexe' => !empty($this->sexe),
            'parent' => !empty($this->parent),
        ];
        
        $completedFields = array_sum($fields);
        $totalFields = count($fields);
        
        return round(($completedFields / $totalFields) * 100);
    }
    
    /**
     * Additional methods for specific use cases
     */
    public function withClassDetails()
    {
        return $this->additional([
            'class_details' => $this->when($this->relationLoaded('inscrireClasses'), function() {
                return $this->inscrireClasses->map(function ($inscrireClass) {
                    return new ClassResource($inscrireClass->class_);
                })->filter();
            })
        ]);
    }
    
    public function withCourseDetails()
    {
        return $this->additional([
            'course_details' => $this->when($this->relationLoaded('inscrireClasses'), function() {
                return $this->inscrireClasses->map(function ($inscrireClass) {
                    return $inscrireClass->class_ && $inscrireClass->class_->cours ? 
                           new CoursResource($inscrireClass->class_->cours) : null;
                })->filter()->unique('id');
            })
        ]);
    }
    
    public function withFinancialSummary()
    {
        return $this->additional([
            'financial_summary' => [
                'is_free_student' => $this->gratuit,
                'advance_payment' => $this->avance,
                'payment_status' => $this->gratuit ? 'Free' : 'Paying',
                'outstanding_balance' => $this->calculateOutstandingBalance(),
                'payment_history' => $this->getPaymentHistory()
            ]
        ]);
    }
    
    /**
     * Calculate outstanding balance (you'll need to implement based on your business logic)
     */
    private function calculateOutstandingBalance()
    {
        // Implement your balance calculation logic here
        return 0; // Placeholder
    }
    
    /**
     * Get payment history (you'll need to implement based on your payment model)
     */
    private function getPaymentHistory()
    {
        // Implement your payment history logic here
        return []; // Placeholder
    }
}
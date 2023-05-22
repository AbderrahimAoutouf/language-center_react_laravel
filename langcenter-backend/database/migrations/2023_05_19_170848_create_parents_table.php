<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('parents', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 254);
            $table->string('prenom', 254);
            $table->string('cin', 254)->unique();
            $table->datetime('date_naissance');
            $table->string('sexe', 254);
            $table->string('email', 254);
            $table->string('adresse', 254);
            $table->string('telephone', 254);
            // $table->boolean('isActive');
            $table->integer('nbenfants');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parents');
    }
};

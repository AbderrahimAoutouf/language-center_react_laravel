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
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->char('cin', 8)->unique();
            $table->date('birthday');
            $table->string('address');
            $table->string('gender');
            $table->string('speciality')->nullable();
            $table->string('diploma')->nullable();
            $table->date('hiredate');
            $table->integer('hourly_rate');
            $table->string('email')->unique()->nullable();
            $table->string('phone')->unique();
            $table->timestamps();
            $table->string('avatar')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teachers');
    }
};

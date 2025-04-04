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
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->string('name', 254);
            $table->string('school_year');
            $table->string('description');
            $table->date('start_date');
            $table->date('end_date');
            $table->string('level');
            $table->unsignedBigInteger('cours_id');
            $table->foreign('cours_id')->references('id')->on('cours')->onDelete('cascade');
            $table->string('event_color');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('classes');
    }
};

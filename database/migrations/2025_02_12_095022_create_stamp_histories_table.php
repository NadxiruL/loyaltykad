<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('stamp_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_card_id')->constrained();
            $table->integer('stamps_added');
            $table->string('notes')->nullable();
            $table->foreignId('user_id')->constrained('users');
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stamp_histories');
    }
};

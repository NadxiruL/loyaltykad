<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('card_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('total_stamps');
            $table->boolean('has_expiration')->default(false);
            $table->integer('validity_days')->nullable();
            $table->foreignId('user_id')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card_templates');
    }
};

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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone');  // Removed the unique constraint here
            $table->string('email')->nullable();
            $table->foreignId('user_id')->constrained('users');
            $table->boolean('is_existing_customer')->default(false);
            $table->timestamps();

            // Add a composite unique key on phone and user_id
            $table->unique(['phone', 'user_id']);
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};

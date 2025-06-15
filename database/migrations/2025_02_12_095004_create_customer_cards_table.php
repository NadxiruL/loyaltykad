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
        Schema::create('customer_cards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id');
            $table->foreignId('card_template_id');
            $table->integer('current_stamps')->default(1);
            $table->boolean('completed')->default(false);
            $table->date('start_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->foreignId('user_id')->constrained('users');
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_cards');
    }
};

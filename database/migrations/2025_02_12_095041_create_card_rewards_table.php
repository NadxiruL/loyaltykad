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
        Schema::create('card_rewards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('card_template_id')->constrained('card_templates')->onDelete('cascade');
            $table->integer('stamp_number');
            $table->string('reward_description');
            $table->boolean('is_final_reward')->default(false);
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card_rewards');
    }
};

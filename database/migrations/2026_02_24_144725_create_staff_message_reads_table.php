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
        Schema::create('staff_message_reads', function (Blueprint $table) {
            $table->id();
            // staff_messagesテーブルとの紐付け
            $table->foreignId('message_id')->constrained('staff_messages')->onDelete('cascade');
            // 読んだユーザーのID
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_message_reads');
    }
};

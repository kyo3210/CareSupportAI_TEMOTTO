<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff_messages', function (Blueprint $table) {
            $table->id();
            // 送信者のID（usersテーブルと紐付け）
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            
            // 受信者のID（nullの場合は「全員宛て」とする）
            $table->foreignId('receiver_id')->nullable()->constrained('users')->onDelete('cascade');
            
            // メッセージ内容（画像だけ送る場合もあるので nullable にする）
            $table->text('message')->nullable();
            
            // 添付画像の保存パス
            $table->string('image_path')->nullable();
            
            // 既読フラグ（最初は「未読」なので false）
            $table->boolean('is_read')->default(false);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff_messages');
    }
};
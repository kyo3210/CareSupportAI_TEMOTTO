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
    Schema::create('schedules', function (Blueprint $table) {
        $table->id();
        $table->string('type'); 
        // 修正ポイント：client_id を数値型ではなく、clients.id と同じ「文字列」型として定義する
        $table->string('client_id')->nullable(); 
        // 外部キー制約
        $table->foreign('client_id')->references('id')->on('clients')->onDelete('cascade');
        
        $table->string('title');
        $table->text('description')->nullable();
        $table->datetime('start');
        $table->datetime('end');
        $table->string('color'); 
        $table->timestamps();
    });
}
};

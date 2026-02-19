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
        Schema::table('schedules', function (Blueprint $table) {
            // idカラムの後ろに user_id を追加
            // 既存データがある場合にエラーにならないよう nullable() にしています
            $table->unsignedBigInteger('user_id')->nullable()->after('id');

            // 外部キー制約（usersテーブルのidと紐付け）
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            // ロールバック時にカラムを削除
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
    }
};
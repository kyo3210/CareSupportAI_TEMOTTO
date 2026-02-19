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
        Schema::table('care_records', function (Blueprint $table) {
            // water_intake の後ろに spo2 を追加（既にない場合のみ）
            if (!Schema::hasColumn('care_records', 'spo2')) {
                $table->integer('spo2')->nullable()->after('water_intake')->comment('SpO2(%)');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('care_records', function (Blueprint $table) {
            $table->dropColumn('spo2');
        });
    }
};
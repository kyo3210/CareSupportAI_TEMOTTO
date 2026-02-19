<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // records を care_records に変更
        Schema::table('care_records', function (Blueprint $table) {
            $table->unsignedBigInteger('schedule_id')->nullable()->after('client_id');
            $table->foreign('schedule_id')->references('id')->on('schedules')->onDelete('set null');
        });
    }

    public function down(): void
    {
        // records を care_records に変更
        Schema::table('care_records', function (Blueprint $table) {
            $table->dropForeign(['schedule_id']);
            $table->dropColumn('schedule_id');
        });
    }
};

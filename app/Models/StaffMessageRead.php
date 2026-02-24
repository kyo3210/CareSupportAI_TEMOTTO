<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffMessageRead extends Model
{
    use HasFactory;

    // 保存を許可するカラム
    protected $fillable = [
        'message_id',
        'user_id',
    ];
}
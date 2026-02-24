<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'message',
        'image_path',
        // 'is_read', // ★古い既読管理は使わないのでコメントアウト
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    // ★今回のエラーの原因（おそらくこれが無かった・抜けていた）
    // 既読管理テーブル（StaffMessageRead）との連携をシステムに教える記述です
    public function reads()
    {
        return $this->hasMany(StaffMessageRead::class, 'message_id');
    }
}
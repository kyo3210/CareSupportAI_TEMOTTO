<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'client_id',
        'title',
        'description',
        'start',
        'end',
        'color',
        'is_task',
        'is_confirmed'
    ];

    /**
     * ★追加：この予定に紐づく利用情報を取得
     */
    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    /**
     * この予定に紐づくケア記録を取得
     */
    public function careRecord()
    {
        return $this->hasOne(CareRecord::class, 'schedule_id');
    }

    /**
     * この予定を作成したユーザーを取得
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
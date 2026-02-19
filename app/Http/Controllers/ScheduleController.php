<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Schedule;
use App\Models\CareRecord; // ★CareRecordモデルをインポート

class ScheduleController extends Controller
{
    /**
     * カレンダー表示用のデータ全件取得
     */
public function index()
{
    return Schedule::withExists('careRecord')->get()->map(function($s) {
        return [
            'id'    => $s->id,
            'title' => ($s->care_record_exists ? '✅ ' : '') . $s->title,
            // FullCalendar が最も正確に読み取れる形式に変換
            'start' => \Carbon\Carbon::parse($s->start)->toIso8601String(),
            'end'   => $s->end ? \Carbon\Carbon::parse($s->end)->toIso8601String() : null,
            'backgroundColor' => $s->care_record_exists ? '#adb5bd' : $s->color,
            'borderColor'     => $s->color,
            'extendedProps'   => [
                'description' => $s->description,
                'type'        => $s->type,
                'client_id'   => $s->client_id,
                'is_recorded' => $s->care_record_exists
            ]
        ];
    });
}
    /**
     * 新規予定の保存
     */
    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required',
            'title' => 'required',
            'start' => 'required',
            'end' => 'required',
            'backgroundColor' => 'required',
        ]);

        $schedule = Schedule::create([
            'type'        => $request->type,
            'client_id'   => $request->client_id,
            'title'       => $request->title,
            'description' => $request->description,
            'start'       => $request->start,
            'end'         => $request->end,
            'color'       => $request->backgroundColor,
        ]);

        return response()->json(['status' => 'success', 'data' => $schedule]);
    }

    /**
     * 予定の更新（ドラッグ＆ドロップ、および詳細編集用）
     */
    public function update(Request $request, $id)
    {
        $schedule = Schedule::findOrFail($id);
        
        // 詳細編集から全データが送られてくる場合と、ドラッグ時の start/end のみを両方カバー
        $schedule->update($request->all());

        return response()->json(['status' => 'success']);
    }

    /**
     * 予定の削除
     */
    public function destroy($id)
    {
        $schedule = Schedule::findOrFail($id);
        $schedule->delete();

        return response()->json(['status' => 'success']);
    }
}
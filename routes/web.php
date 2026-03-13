<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CareController;
use App\Http\Controllers\OfficeController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage; // ファイル操作用
use App\Models\CareRecord;
use App\Models\Schedule;
use Carbon\Carbon;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// --- 画面表示 ---
Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::get('/dashboard', function () {
    return view('index'); 
})->middleware(['auth', 'verified'])->name('dashboard');

// --- API 関連 (認証必須) ---
Route::middleware(['auth'])->prefix('web-api')->group(function () {
    
    // 利用者管理
    Route::get('/clients', [ClientController::class, 'index']); 
    Route::post('/clients', [ClientController::class, 'store']); 
    Route::delete('/clients/{id}', [ClientController::class, 'destroy']);
    
    // ケア記録管理
    Route::get('/all-records', [CareController::class, 'getAllRecords']);
    Route::get('/search', [CareController::class, 'search']);
    Route::post('/records', [CareController::class, 'storeRecord']);
    Route::put('/records/{id}', [CareController::class, 'update']);
    Route::delete('/records/{id}', [CareController::class, 'destroy']);
    
    // AIチャット用クイックアクションAPI
    Route::get('/records/recent/{clientId}', [CareController::class, 'getRecentRecords']);
    Route::get('/records/vitals/{clientId}', [CareController::class, 'getVitalData']);
    
    // 今日のスケジュール取得 (AIチャット用)
    Route::get('/schedules/today', function () {
        $today = Carbon::today()->format('Y-m-d');
        return Schedule::with('client')
            ->where('user_id', Auth::id())
            ->whereDate('start', $today)
            ->orderBy('start', 'asc')
            ->get();
    });

    // AI連携
    Route::post('/ask-ai', [CareController::class, 'askAI']);

    // --- スケジュール(カレンダー)関連 (基本操作) ---
    Route::get('/schedules', function () {
        return Schedule::where('user_id', Auth::id())->get();
    });

    Route::post('/schedules', function (Request $request) {
        $messages = ['end.after' => '終了時間は開始時間よりも後の日時を指定してください。'];
        $request->validate([
            'title' => 'required|string|max:255',
            'start' => 'required|date',
            'end'   => 'required|date|after:start',
            'type'  => 'required|string',
        ], $messages);

        $schedule = new Schedule();
        $schedule->user_id = Auth::id();
        $schedule->title = $request->title;
        $schedule->description = $request->description;
        $schedule->start = $request->start;
        $schedule->end = $request->end;
        $schedule->type = $request->type;
        $schedule->client_id = $request->client_id;
        $schedule->color = $request->backgroundColor;
        $schedule->is_task = $request->boolean('is_task');
        $schedule->is_confirmed = false;
        $schedule->save();
        return response()->json(['status' => 'success', 'data' => $schedule]);
    });

    Route::patch('/schedules/{id}', function (Request $request, $id) {
        $schedule = Schedule::where('id', $id)->where('user_id', Auth::id())->firstOrFail();
        if ($request->has('start') && $request->has('end')) { $request->validate(['end' => 'after:start']); }
        if ($request->has('title')) $schedule->title = $request->title;
        if ($request->has('description')) $schedule->description = $request->description;
        if ($request->has('start')) $schedule->start = $request->start;
        if ($request->has('end')) $schedule->end = $request->end;
        if ($request->has('backgroundColor')) $schedule->color = $request->backgroundColor;
        if ($request->has('is_task')) $schedule->is_task = $request->boolean('is_task');
        if ($request->has('is_confirmed')) $schedule->is_confirmed = $request->boolean('is_confirmed');
        $schedule->save();
        return response()->json(['status' => 'success', 'data' => $schedule]);
    });

    Route::patch('/schedules/{id}/confirm', function ($id) {
        $schedule = Schedule::where('id', $id)->where('user_id', Auth::id())->firstOrFail();
        $schedule->is_confirmed = true;
        $schedule->save();
        return response()->json(['status' => 'success']);
    });

    Route::delete('/schedules/{id}', function ($id) {
        $schedule = Schedule::where('id', $id)->where('user_id', Auth::id())->firstOrFail();
        $schedule->delete();
        return response()->json(['status' => 'success']);
    });

    // 事業所・スタッフ管理等
    Route::get('/offices', [OfficeController::class, 'index']);
    Route::post('/offices/update', [OfficeController::class, 'update']);
    Route::get('/staff', [OfficeController::class, 'indexStaff']);
    Route::post('/staff', [OfficeController::class, 'storeStaff']);
    Route::put('/staff/{id}', [OfficeController::class, 'updateStaff']); // ★追加：職員更新ルート
    Route::get('/zipcode/{zip}', function($zip) {
        return Http::get("https://zipcloud.ibsnet.co.jp/api/search?zipcode={$zip}")->json();
    });

    // ダッシュボード用アラート (SPO2考慮)
    Route::get('/dashboard/vital-alerts', function () {
        $threshold = Carbon::now()->subHours(8);
        return CareRecord::with('client')
            ->where('recorded_at', '>=', $threshold)
            ->where(function($query) {
                $query->where('body_temp', '>=', 37.5)
                      ->orWhere('blood_pressure_high', '>=', 140)
                      ->orWhere('spo2', '<', 95);
            })
            ->orderBy('recorded_at', 'desc')->get();
    });

    Route::get('/dashboard/unfinished-tasks', function () {
        $today = Carbon::today()->format('Y-m-d');
        $schedules = Schedule::with('client')->where('user_id', Auth::id())->where('is_task', true)->whereDate('start', $today)->orderBy('start', 'asc')->get();
        $unfinished = [];
        foreach ($schedules as $schedule) {
            if ($schedule->type === 'care') {
                $hasRecord = CareRecord::where('schedule_id', $schedule->id)->exists();
                if (!$hasRecord) { $schedule->alert_type = 'missing_record'; $unfinished[] = $schedule; }
            } else {
                if (!$schedule->is_confirmed) { $schedule->alert_type = 'work_todo'; $unfinished[] = $schedule; }
            }
        }
        return response()->json($unfinished);
    });

    Route::get('/manual-guide', function () {
        $path = storage_path('app/manual_index.json');
        if (file_exists($path)) {
            return response()->json([
                'content' => file_get_contents($path)
            ]);
        }
        return response()->json(['content' => 'FILE_NOT_FOUND']);
    });

    // ▼ 職員チャット用 APIルート ▼
    Route::get('/staff-chat/users', [App\Http\Controllers\StaffChatController::class, 'getStaffList']);
    Route::get('/staff-chat/messages', [App\Http\Controllers\StaffChatController::class, 'getMessages']);
    Route::post('/staff-chat/send', [App\Http\Controllers\StaffChatController::class, 'sendMessage']);
    Route::post('/staff-chat/mark-as-read', [App\Http\Controllers\StaffChatController::class, 'markAsRead']);
    Route::get('/staff-chat/unread-count', [App\Http\Controllers\StaffChatController::class, 'getUnreadCount']);
    Route::delete('/staff-chat/messages/{id}', [App\Http\Controllers\StaffChatController::class, 'deleteMessage']);

    // =========================================================================
    // ★修正: 録音または音声ファイルをGeminiに送って「文字起こしと議事録生成」を行う処理
    // =========================================================================
    Route::post('/transcribe-audio', function (Request $request) {
        
        // ① PHPの実行時間とメモリ制限を大幅に緩和
        set_time_limit(300); 
        ini_set('memory_limit', '512M');

        // ② ファイルが正しく受信できたかチェック
        if (!$request->hasFile('audio_file') || !$request->file('audio_file')->isValid()) {
            $phpMax = ini_get('upload_max_filesize');
            $errorMsg = $request->hasFile('audio_file') ? $request->file('audio_file')->getErrorMessage() : "ファイルを受信できませんでした。（※Docker/PHPのアップロード上限 {$phpMax} を超えている可能性があります）";
            return response()->json(['error' => 'ファイルエラー: ' . $errorMsg], 500);
        }

        $request->validate([
            'audio_file' => 'required|file|max:102400' 
        ]);

        $file = $request->file('audio_file');
        $filePath = $file->getRealPath();
        $mimeType = $file->getClientMimeType();
        $apiKey = env('GEMINI_API_KEY');

        if (!$apiKey) {
            return response()->json(['error' => 'APIキーが設定されていません。'], 500);
        }

        try {
            // ③ Gemini File API へ音声データをアップロード
            $uploadResponse = Http::timeout(120)->withHeaders([
                'Content-Type' => $mimeType,
            ])->withBody(file_get_contents($filePath), $mimeType)
              ->post("https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=media&key={$apiKey}");

            if (!$uploadResponse->successful()) {
                return response()->json(['error' => 'アップロード失敗: ' . $uploadResponse->body()], 500);
            }

            $fileUri = $uploadResponse->json('file.uri');

            // ④ アップロードした音声を使って、Gemini に話者分離と文字起こしを依頼する
            $prompt = "この音声ファイルの内容を解析し、話者ごとに分離して（Aさん、Bさん等）、会話の流れがわかるように文字起こしをしてください。その後、会議の要点と決定事項をまとめて分かりやすい議事録を作成してください。";

            $generateResponse = Http::timeout(300)->withHeaders([
                'Content-Type' => 'application/json',
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                            ['fileData' => ['fileUri' => $fileUri, 'mimeType' => $mimeType]]
                        ]
                    ]
                ]
            ]);

            if (!$generateResponse->successful()) {
                return response()->json(['error' => 'AI生成失敗: ' . $generateResponse->body()], 500);
            }

            $text = $generateResponse->json('candidates.0.content.parts.0.text');
            
            if (!$text) {
                return response()->json(['error' => 'AIからの応答が空でした。'], 500);
            }

            return response()->json(['text' => $text]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'システムエラー: ' . $e->getMessage()], 500);
        }
    });
    // =========================================================================

});

// プロフィール管理
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
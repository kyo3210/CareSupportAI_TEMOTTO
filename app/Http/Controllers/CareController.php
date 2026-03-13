<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Client;
use App\Models\CareRecord;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class CareController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->query('query');
        $client = Client::where('client_name', 'LIKE', "%{$query}%")
            ->orWhere('id', $query)
            ->first();

        if ($client) {
            return response()->json(['status' => 'success', 'client' => $client]);
        }
        return response()->json(['status' => 'error', 'message' => '利用者が存在しません'], 404);
    }

    /**
     * 全記録取得（検索機能付き）
     */
    public function getAllRecords(Request $request)
    {
        try {
            $query = CareRecord::with('client')->orderBy('recorded_at', 'desc');

            if ($request->filled('start')) {
                $query->whereDate('recorded_at', '>=', $request->start);
            }
            if ($request->filled('end')) {
                $query->whereDate('recorded_at', '<=', $request->end);
            }
            if ($request->filled('keyword')) {
                $keyword = $request->keyword;
                $query->where(function($q) use ($keyword) {
                    $q->whereHas('client', function($q2) use ($keyword) {
                        $q2->where('client_name', 'LIKE', "%{$keyword}%");
                    })
                    ->orWhere('content', 'LIKE', "%{$keyword}%")
                    ->orWhere('recorded_by', 'LIKE', "%{$keyword}%");
                });
            }

            return $query->take(100)->get();

        } catch (\Exception $e) {
            Log::error('全記録取得エラー: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getRecentRecords($clientId)
    {
        $records = CareRecord::where('client_id', $clientId)
            ->orderBy('recorded_at', 'desc')
            ->limit(3)
            ->get();
        
        foreach ($records as $r) {
            $r->formatted_date = Carbon::parse($r->recorded_at)->format('Y/m/d H:i');
        }

        return response()->json($records);
    }

    public function getVitalData($clientId)
    {
        $records = CareRecord::where('client_id', $clientId)
            ->where('recorded_at', '>=', Carbon::now()->subDays(7))
            ->orderBy('recorded_at', 'asc')
            ->get();

        return response()->json([
            'dates' => $records->map(function($r) {
                return Carbon::parse($r->recorded_at)->format('m/d');
            }),
            'temps' => $records->pluck('body_temp'),
            'highs' => $records->pluck('blood_pressure_high'),
            'lows'  => $records->pluck('blood_pressure_low'),
        ]);
    }

    public function storeRecord(Request $request)
    {
        $request->validate([
            'client_id'   => 'required',
            'recorded_at' => 'required',
            'content'     => 'nullable',
        ]);

        try {
            $record = new CareRecord();
            $record->client_id           = $request->client_id;
            
            // ★修正：空欄(空文字)で送られてきた場合は、DBエラーを避けるために明確に `null` や `空文字` に変換する
            $record->schedule_id         = empty($request->schedule_id) ? null : $request->schedule_id;
            $record->recorded_at         = $request->recorded_at;
            $record->recorded_by         = Auth::user()->name; 
            
            // contentが未入力の場合は空文字を入れる（DBのNOT NULL制約回避）
            $record->content             = $request->content ?? ''; 
            
            // 数値項目が未入力の場合は null を入れる（数字カラムへの空文字エラー回避）
            $record->body_temp           = empty($request->body_temp) ? null : $request->body_temp;
            $record->blood_pressure_high = empty($request->blood_pressure_high) ? null : $request->blood_pressure_high;
            $record->blood_pressure_low  = empty($request->blood_pressure_low) ? null : $request->blood_pressure_low;
            $record->water_intake        = empty($request->water_intake) ? null : $request->water_intake;
            $record->spo2                = empty($request->spo2) ? null : $request->spo2;

            $record->save();

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            Log::error('ケア記録保存エラー: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => '保存エラー', 'details' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $record = CareRecord::findOrFail($id);
            $record->client_id           = $request->client_id;
            
            if($request->recorded_at) {
                $record->recorded_at = $request->recorded_at;
            }
            
            $record->recorded_by         = Auth::user()->name;
            
            // ★修正：更新時も同様に空欄対策を行う
            $record->content             = $request->content ?? ''; 
            $record->body_temp           = empty($request->body_temp) ? null : $request->body_temp;
            $record->blood_pressure_high = empty($request->blood_pressure_high) ? null : $request->blood_pressure_high;
            $record->blood_pressure_low  = empty($request->blood_pressure_low) ? null : $request->blood_pressure_low;
            $record->water_intake        = empty($request->water_intake) ? null : $request->water_intake;
            $record->spo2                = empty($request->spo2) ? null : $request->spo2;
            
            $record->save();

            return response()->json(['status' => 'success', 'message' => '更新完了']);
        } catch (\Exception $e) {
            Log::error('ケア記録更新エラー: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => '更新エラー', 'details' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $record = CareRecord::find($id);
            if (!$record) {
                return response()->json(['status' => 'error', 'message' => '記録が見つかりません'], 404);
            }
            $record->delete();
            return response()->json(['status' => 'success', 'message' => '記録を削除しました']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => '削除エラー'], 500);
        }
    }

    public function askAI(Request $request)
    {
        try {
            $clientId = $request->input('clientId');
            $userQuestion = $request->input('question');
            $systemPrompt = $request->input('systemPrompt');

            $context = "";
            $vitalData = [];

            if (!empty($clientId)) {
                $startDate = $request->input('startDate');
                $endDate = $request->input('endDate');

                $query = CareRecord::where('client_id', $clientId);
                if ($startDate) $query->where('recorded_at', '>=', $startDate . ' 00:00:00');
                if ($endDate) $query->where('recorded_at', '<=', $endDate . ' 23:59:59');
                
                $records = $query->orderBy('recorded_at', 'asc')->get();

                $context = "以下は対象利用者のケア記録データです：\n";
                foreach ($records as $r) {
                    $context .= "- 日時:{$r->recorded_at}: {$r->content} (体温:{$r->body_temp}℃, 血圧:{$r->blood_pressure_high}/{$r->blood_pressure_low}, SPO2:{$r->spo2}%)\n";
                    
                    if ($r->body_temp) {
                        $vitalData[] = [
                            'date' => date('Y-m-d', strtotime($r->recorded_at)),
                            'temp' => (float)$r->body_temp,
                            'bp_high' => (int)$r->blood_pressure_high,
                            'bp_low' => (int)$r->blood_pressure_low,
                            'spo2' => (int)$r->spo2
                        ];
                    }
                }
            } else {
                $context = "【重要】特定の利用者は選択されていません。一般的な介護知識に基づいて回答してください。";
            }

            $apiKey = config('services.gemini.key') ?: env('GEMINI_API_KEY');
            
            $response = Http::withHeaders(['Content-Type' => 'application/json'])
                ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                    'contents' => [
                        [
                            'role' => 'user',
                            'parts' => [['text' => "{$systemPrompt}\n\n{$context}\n\n質問: {$userQuestion}"]]
                        ]
                    ]
                ]);

            $result = $response->json();
            
            if (isset($result['error'])) {
                return response()->json(['answer' => 'AIエラー: ' . ($result['error']['message'] ?? '不明なエラー')], 200);
            }

            $answer = $result['candidates'][0]['content']['parts'][0]['text'] ?? '回答を取得できませんでした。';

            return response()->json([
                'answer' => $answer,
                'vitalData' => $vitalData
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'サーバーエラー'], 500);
        }
    }
}
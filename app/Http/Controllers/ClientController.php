<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Client;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ClientController extends Controller
{
    /**
     * 利用者一覧の取得
     */
    public function index()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => '認証されていません。再ログインしてください。'], 401);
            }

            // 全利用者を最新順に取得
            $clients = Client::orderBy('created_at', 'desc')->get();
            return response()->json($clients);

        } catch (\Exception $e) {
            Log::error('ClientController@index Error: ' . $e->getMessage());
            return response()->json([
                'error' => 'サーバーエラーが発生しました。',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 利用者の登録・上書き更新（統合版）
     */
    public function store(Request $request)
    {
        try {
            // 💡 ポイント1: ID重複チェック(unique)を外す
            // 更新時にもこのバリデーションを通るため、unique制約があると上書きができません。
            $validated = $request->validate([
                'id'               => 'required|string', 
                'client_name'      => 'required|string|max:255',
                'postcode'         => 'nullable|string|max:7',
                'address'          => 'required|string|max:255',
                'contact_tel'      => 'required|string|max:20',
                'insurace_number'  => 'nullable|string|max:255', 
                'care_start_date'  => 'nullable|date',           
                'care_end_date'    => 'nullable|date',           
                'care_manager'     => 'required|string|max:255',
                'care_manager_tel' => 'nullable|string|max:20',  
            ]);

            // ログインユーザーの事業所IDをセット
            $officeId = Auth::user()->office_id;

            // 💡 ポイント2: updateOrCreate の使用
            // 'id' をキーにして検索し、存在すれば第2引数の内容で更新、なければ新規作成します。
            $client = Client::updateOrCreate(
                ['id' => $request->id],
                [
                    'client_name'      => $request->client_name,
                    'postcode'         => $request->postcode,
                    'address'          => $request->address,
                    'contact_tel'      => $request->contact_tel,
                    'insurace_number'  => $request->insurace_number,
                    'care_manager'     => $request->care_manager,
                    'care_start_date'  => $request->care_start_date,
                    'care_end_date'    => $request->care_end_date,
                    'care_manager_tel' => $request->care_manager_tel,
                    'office_id'        => $officeId,
                ]
            );

            return response()->json([
                'status' => 'success',
                'message' => '利用者情報を保存しました。',
                'data' => $client
            ]);

        } catch (\Illuminate\Validation\ValidationException $v) {
            return response()->json([
                'status' => 'error',
                'message' => '入力内容に不備があります。',
                'errors' => $v->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('ClientController@store Error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => '保存中にエラーが発生しました。',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
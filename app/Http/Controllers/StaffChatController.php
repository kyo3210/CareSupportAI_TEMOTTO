<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\StaffMessage;
use Illuminate\Support\Facades\Auth;

class StaffChatController extends Controller
{
    // ① 職員リスト（送信先プルダウン用）の取得
    public function getStaffList()
    {
        // 全ユーザーのIDと名前だけをサクッと取得して返します
        $users = User::select('id', 'name')->get();
        return response()->json($users);
    }

    // ② メッセージ履歴の取得（★ここが重要な門番！）
    public function getMessages()
    {
        $userId = Auth::id(); // 今ログインしている人のID

        // データベースから「自分に関係のあるメッセージだけ」を抽出します
        $messages = StaffMessage::with(['sender', 'receiver'])
            ->whereNull('receiver_id')           // パターンA：全員宛て（NULL）のもの
            ->orWhere('receiver_id', $userId)    // パターンB：自分がもらったもの
            ->orWhere('sender_id', $userId)      // パターンC：自分が送ったもの
            ->orderBy('created_at', 'asc')       // 古い順（チャット画面の上から下へ表示するため）
            ->get();

        // ★追加: 履歴を取得したタイミングで、自分宛の未読メッセージを「既読」にする
        StaffMessage::where('receiver_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json($messages);
    }

    // ③ メッセージと画像の送信・保存処理
    public function sendMessage(Request $request)
    {
        // 送られてきたデータに不正がないかチェック
        $request->validate([
            'receiver_id' => 'nullable|exists:users,id',
            'message' => 'nullable|string',
            'image' => 'nullable|image|max:2048', // 画像は2MBまで
        ]);

        $userId = Auth::id();
        $imagePath = null;

        // 画像が添付されていた場合、サーバーに保存
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('chat_images', 'public');
        }

        // メッセージも画像も空っぽの場合はエラーを返す
        if (empty($request->message) && empty($imagePath)) {
            return response()->json(['error' => 'メッセージか画像のどちらかが必要です。'], 400);
        }

        // データベースの箱に保存
        $chat = StaffMessage::create([
            'sender_id' => $userId,
            'receiver_id' => $request->receiver_id,
            'message' => $request->message,
            'image_path' => $imagePath,
            'is_read' => false,
        ]);

        return response()->json(['success' => true, 'message' => '送信完了', 'data' => $chat]);
    }

    // ④ ★新規追加: 未読メッセージ数をカウントし、さらに未読メッセージの中身も返す
    public function getUnreadCount()
    {
        $userId = Auth::id();
        
        // 自分宛ての未読メッセージを新しい順に取得
        $unreadMessages = StaffMessage::with('sender')
            ->where('receiver_id', $userId)
            ->where('is_read', false)
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'unread_count' => $unreadMessages->count(),
            'messages' => $unreadMessages
        ]);
    }
}
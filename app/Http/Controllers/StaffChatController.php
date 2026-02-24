<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\StaffMessage;
use App\Models\StaffMessageRead;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage; // ★追加: 画像ファイル削除用

class StaffChatController extends Controller
{
    // ① 職員リストの取得
    public function getStaffList()
    {
        $users = User::select('id', 'name')->get();
        return response()->json($users);
    }

    // ② メッセージ履歴の取得
    public function getMessages()
    {
        $userId = Auth::id();

        $messages = StaffMessage::with(['sender', 'receiver', 'reads'])
            ->whereNull('receiver_id')           
            ->orWhere('receiver_id', $userId)    
            ->orWhere('sender_id', $userId)      
            ->orderBy('created_at', 'asc')       
            ->get();

        // 確実な判定のため、サーバー側で「自分のメッセージか」のフラグを付与する
        $messages->each(function($msg) use ($userId) {
            $msg->is_mine = ($msg->sender_id === $userId);
        });

        return response()->json($messages);
    }

    // ③ メッセージの送信
    public function sendMessage(Request $request)
    {
        $request->validate([
            'receiver_id' => 'nullable|exists:users,id',
            'message' => 'nullable|string',
            'image' => 'nullable|image|max:2048', 
        ]);

        $userId = Auth::id();
        $imagePath = null;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('chat_images', 'public');
        }

        if (empty($request->message) && empty($imagePath)) {
            return response()->json(['error' => 'メッセージか画像のどちらかが必要です。'], 400);
        }

        $chat = StaffMessage::create([
            'sender_id' => $userId,
            'receiver_id' => $request->receiver_id,
            'message' => $request->message,
            'image_path' => $imagePath,
        ]);

        return response()->json(['success' => true, 'message' => '送信完了', 'data' => $chat]);
    }

    // ④ 未読数の取得
    public function getUnreadCount()
    {
        $userId = Auth::id();
        
        $unreadMessages = StaffMessage::with('sender')
            ->where('sender_id', '!=', $userId) 
            ->where(function($query) use ($userId) {
                $query->where('receiver_id', $userId)
                      ->orWhereNull('receiver_id'); 
            })
            ->whereDoesntHave('reads', function($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'unread_count' => $unreadMessages->count(),
            'messages' => $unreadMessages
        ]);
    }

    // ⑤ 特定のメッセージを既読にする
    public function markAsRead(Request $request)
    {
        $userId = Auth::id();
        $messageIds = $request->input('message_ids', []);

        foreach ($messageIds as $msgId) {
            StaffMessageRead::firstOrCreate([
                'message_id' => $msgId,
                'user_id' => $userId
            ]);
        }

        return response()->json(['status' => 'success']);
    }

    // ⑥ ★追加: メッセージを削除する処理
    public function deleteMessage($id)
    {
        $userId = Auth::id();
        $message = StaffMessage::find($id);

        if (!$message) {
            return response()->json(['error' => 'メッセージが見つかりません。'], 404);
        }

        // 自分が送ったメッセージ以外は削除できないようにブロック
        if ($message->sender_id !== $userId) {
            return response()->json(['error' => '削除権限がありません。'], 403);
        }

        // 画像が添付されていた場合、サーバーから画像ファイルも削除する
        if ($message->image_path) {
            Storage::disk('public')->delete($message->image_path);
        }

        // データベースからメッセージを削除（既読記録も連動して消えます）
        $message->delete();

        return response()->json(['status' => 'success']);
    }
}
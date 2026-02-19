<section id="chat-section">
    <h2 style="font-size: 1.1em; margin-bottom: 10px;">💬 AIチャット相談</h2>

    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px; font-size: 0.85em; background: #f8f9fa; padding: 10px; border-radius: 8px; border: 1px solid #eee;">
        <span style="font-weight: bold; color: #555;">🔊 AI回答の音声読み上げ</span>
        <label class="switch" style="cursor: pointer;">
            <input type="checkbox" id="voice-read-toggle" style="display: none;">
            <div id="toggle-bg" style="width: 44px; height: 22px; background: #ccc; border-radius: 11px; position: relative; transition: 0.3s;">
                <div id="toggle-circle" style="width: 18px; height: 18px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></div>
            </div>
        </label>
    </div>

    <div style="margin-bottom: 10px;">
        <select id="client-select" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ddd;">
            <option value="">利用者を選択してください</option>
        </select>
    </div>

    <div id="chat-window" style="height: 400px; overflow-y: auto; background: #fafafa; border: 1px solid #eee; padding: 15px; margin-bottom: 10px; border-radius: 6px; display: flex; flex-direction: column; gap: 10px;">
    </div>

    <div id="vital-chart-container" style="display: none; background: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <h4 style="margin: 0; font-size: 0.9em; color: #555;">📊 週間バイタル推移</h4>
            <button onclick="$('#vital-chart-container').slideUp()" style="background:#eee; border:none; border-radius:4px; padding:2px 8px; cursor:pointer;">✖</button>
        </div>
        <div style="position: relative; height: 250px; width: 100%;">
            <canvas id="chatVitalChart"></canvas>
        </div>
    </div>

    <div class="chip-container-wrapper">
        <div class="chip-container">
            <input type="radio" name="chat-mode" id="mode-analyze" value="analyze" checked>
            <label for="mode-analyze" class="chip-label analyze-theme">
                <span class="chip-icon">🤖</span> <span class="chip-text">AI相談</span>
            </label>

            <input type="radio" name="chat-mode" id="mode-record" value="record">
            <label for="mode-record" class="chip-label record-theme">
                <span class="chip-icon">📋</span> <span class="chip-text">ケア記録</span>
            </label>

            <input type="radio" name="chat-mode" id="mode-schedule" value="schedule">
            <label for="mode-schedule" class="chip-label schedule-theme">
                <span class="chip-icon">📅</span> <span class="chip-text">スケジュール</span>
            </label>

            <input type="radio" name="chat-mode" id="mode-manual" value="manual">
            <label for="mode-manual" class="chip-label new-theme">
                <span class="chip-icon">❓</span> <span class="chip-text">操作質問</span>
            </label>
        </div>
    </div>

    <div id="chat-quick-actions" class="suggestion-bar" style="display: none;">
        
        <button type="button" class="bubble-btn for-record" onclick="triggerQuickAction('input')">
            ✏️ 記録を入力する
        </button>
        <button type="button" class="bubble-btn for-record" onclick="triggerQuickAction('history')">
            📂 前々回の記録をみる
        </button>
        <button type="button" class="bubble-btn for-record" onclick="triggerQuickAction('search')">
            🔍 記録を調べる
        </button>
        <button type="button" class="bubble-btn for-record" onclick="triggerQuickAction('vital')">
            📈 バイタル分析
        </button>

        <button type="button" class="bubble-btn for-schedule" onclick="triggerQuickAction('schedule_today')" style="display: none;">
            📅 今日の予定を表示
        </button>
        <button type="button" class="bubble-btn for-schedule" onclick="triggerQuickAction('schedule_input')" style="display: none;">
            ✏️ 予定を入力する
        </button>

    </div>
    
    <form id="chat-form" style="display: flex; gap: 8px; align-items: flex-end; position: relative; z-index: 10;">
        <button type="button" id="voice-input-btn" style="background: #007bff; color: white; border: none; padding: 0 12px; border-radius: 10px; cursor: pointer; min-width: 48px; height: 48px; font-size: 1.2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">🎤</button>
        
        <textarea id="user-input" placeholder="AIに何でも相談してください" required rows="1" style="
            flex-grow: 1; 
            padding: 12px 14px; 
            border: 1px solid #ddd; 
            border-radius: 12px; 
            resize: none; 
            min-height: 48px; 
            max-height: 200px; 
            overflow-y: auto; 
            line-height: 1.5; 
            font-family: inherit; 
            background: #fff;
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.03);
            font-size: 1rem;
        "></textarea>
        
        <button type="submit" style="background: #28a745; color: white; border: none; padding: 0 20px; border-radius: 10px; cursor: pointer; font-weight: bold; height: 48px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">送信</button>
        
        <button type="button" id="chat-clear-btn" style="background: #dc3545; color: white; border: none; padding: 0 12px; border-radius: 10px; cursor: pointer; font-size: 0.8em; height: 48px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">クリア</button>
    </form>
</section>

<style>
    /* --- 基本スタイル --- */
    #chat-window::-webkit-scrollbar { width: 6px; }
    #chat-window::-webkit-scrollbar-track { background: #f1f1f1; }
    #chat-window::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
    #chat-window::-webkit-scrollbar-thumb:hover { background: #bbb; }
    .user-message, .ai-message { max-width: 85%; word-wrap: break-word; }

    /* --- モード選択チップ（カプセル型） --- */
    .chip-container-wrapper { position: relative; margin-bottom: 10px; mask-image: linear-gradient(to right, black 90%, transparent 100%); -webkit-mask-image: linear-gradient(to right, black 90%, transparent 100%); }
    .chip-container { display: flex; gap: 8px; overflow-x: auto; padding: 4px 2px; white-space: nowrap; scrollbar-width: none; -ms-overflow-style: none; }
    .chip-container::-webkit-scrollbar { display: none; }
    .chip-container input[type="radio"] { display: none; }
    .chip-label { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 50px; background: #f1f3f5; color: #495057; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; user-select: none; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    .chip-icon { font-size: 1.1em; filter: grayscale(100%); opacity: 0.7; }
    .chip-label:hover { background: #e9ecef; }
    .chip-container input:checked + .chip-label { color: white; box-shadow: 0 4px 10px rgba(0,0,0,0.2); transform: translateY(-1px); padding-right: 18px; }
    .chip-container input:checked + .chip-label .chip-icon { filter: grayscale(0%); opacity: 1; }
    
    .chip-container input:checked + .analyze-theme { background: linear-gradient(135deg, #7950f2, #5f3dc4); }
    .chip-container input:checked + .record-theme { background: linear-gradient(135deg, #228be6, #1864ab); }
    .chip-container input:checked + .schedule-theme { background: linear-gradient(135deg, #40c057, #2b8a3e); }
    .chip-container input:checked + .new-theme { background: linear-gradient(135deg, #fd7e14, #d9480f); }

    /* --- クイックアクション：吹き出しサジェストバー --- */
    .suggestion-bar {
        display: flex;
        gap: 12px;
        overflow-x: auto;
        white-space: nowrap;
        padding: 5px 4px 12px 4px; /* しっぽ用の下余白 */
        margin-bottom: -4px;      /* 入力欄に近づける */
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
        mask-image: linear-gradient(to right, black 90%, transparent 100%);
        -webkit-mask-image: linear-gradient(to right, black 90%, transparent 100%);
    }
    .suggestion-bar::-webkit-scrollbar {
        display: none;
    }

    /* 吹き出しボタン（バブル）のデザイン */
    .bubble-btn {
        position: relative;
        background: #fff;
        color: #333;
        border: 1px solid #ccc; 
        border-radius: 8px; /* 角丸四角 */
        padding: 8px 14px;
        font-size: 0.85rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
        margin-bottom: 5px;
    }

    .bubble-btn:hover {
        background: #f8f9fa;
        border-color: #999;
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    /* 吹き出しのしっぽ */
    .bubble-btn::before {
        content: '';
        position: absolute;
        bottom: -6px; 
        left: 50%;
        transform: translateX(-50%);
        border-width: 6px 6px 0;
        border-style: solid;
        border-color: #ccc transparent transparent transparent; /* 枠線 */
        transition: border-color 0.2s;
    }

    .bubble-btn::after {
        content: '';
        position: absolute;
        bottom: -4px; 
        left: 50%;
        transform: translateX(-50%);
        border-width: 5px 5px 0;
        border-style: solid;
        border-color: #fff transparent transparent transparent; /* 背景 */
        transition: border-color 0.2s;
    }

    .bubble-btn:hover::before {
        border-color: #999 transparent transparent transparent;
    }
    .bubble-btn:hover::after {
        border-color: #f8f9fa transparent transparent transparent;
    }
</style>
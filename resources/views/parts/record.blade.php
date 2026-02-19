<section id="record-register-section" style="background: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
    
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="font-size: 1.2em; margin: 0; color: #333; font-weight: bold;">📝 ケア記録入力</h2>
        <button type="button" id="open-record-modal" class="history-btn">
            📂 過去記録
        </button>
    </div>

    <form id="record-add-form">
        {{-- 隠しフィールド --}}
        <input type="hidden" id="record-schedule-id" name="schedule_id">
        <input type="hidden" id="edit-record-id">

        <div class="input-grid">
            
            <div class="form-group full-width">
                <label>利用者</label>
                <select id="record-client-select" required class="form-control big-select"></select>
            </div>

            <div class="form-group">
                <label>日付</label>
                <input type="date" id="record-date" required class="form-control">
            </div>
            <div class="form-group">
                <label>時間</label>
                <input type="time" id="record-time" required class="form-control">
            </div>

            <div class="form-group">
                <label>体温 (℃)</label>
                <input type="number" id="record-temp" step="0.1" placeholder="36.5" class="form-control" inputmode="decimal">
            </div>
            <div class="form-group">
                <label>SPO2 (%)</label>
                <input type="number" id="record-spo2" placeholder="98" class="form-control" inputmode="numeric">
            </div>

            <div class="form-group">
                <label>血圧 (上)</label>
                <input type="number" id="record-bp-high" placeholder="120" class="form-control" inputmode="numeric">
            </div>
            <div class="form-group">
                <label>血圧 (下)</label>
                <input type="number" id="record-bp-low" placeholder="80" class="form-control" inputmode="numeric">
            </div>

            <div class="form-group full-width">
                <label>水分摂取 (ml)</label>
                <input type="number" id="record-water" placeholder="200" class="form-control" inputmode="numeric">
            </div>

            <div style="display:none;"></div> 

            <div class="form-group full-width">
                <label>ケア内容・特記事項</label>
                <textarea id="record-content" class="form-control" placeholder="例: 入浴介助を行いました。皮膚状態に異常なし。" style="height: 100px;"></textarea>
            </div>
        </div>

        <div class="button-area">
            {{-- 削除ボタン --}}
            <button type="button" id="record-delete-btn" class="btn-delete" style="display: none;">
                🗑️ 削除
            </button>

            {{-- リセットボタン --}}
            <button type="button" id="record-reset-btn" class="btn-secondary" style="display: none;">
                キャンセル
            </button>

            {{-- 保存ボタン --}}
            <button type="submit" id="record-submit-btn" class="btn-primary">
                記録を保存
            </button>
        </div>
    </form>
</section>

<style>
    /* === ベーススタイル === */
    .input-grid {
        display: grid;
        grid-template-columns: 1fr 1fr; /* PCは2列 */
        gap: 15px;
        margin-bottom: 20px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .form-group label {
        font-size: 0.85rem;
        color: #666;
        font-weight: bold;
    }

    /* 全幅指定クラス */
    .full-width {
        grid-column: span 2;
    }

    /* === 入力フォーム共通スタイル === */
    .form-control {
        width: 100%;
        padding: 12px;     /* タップしやすい広さ */
        border: 1px solid #ccc;
        border-radius: 6px;
        font-size: 16px;   /* ★重要: iPhoneでズームしないサイズ */
        box-sizing: border-box;
        background-color: #f9f9f9;
        transition: border-color 0.2s;
    }

    .form-control:focus {
        border-color: #007bff;
        background-color: #fff;
        outline: none;
    }

    /* テキストエリア */
    textarea.form-control {
        line-height: 1.5;
        resize: vertical;
    }

    /* 履歴ボタン */
    .history-btn {
        background: #6c757d;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 20px; /* 丸みをつける */
        cursor: pointer;
        font-size: 0.9rem;
    }

    /* === ボタンエリア === */
    .button-area {
        display: flex;
        gap: 10px;
        justify-content: flex-end; /* 右寄せ */
        flex-wrap: wrap; /* スマホでボタンが多い時に折り返す */
    }

    .btn-primary, .btn-secondary, .btn-delete {
        padding: 12px 24px;
        border-radius: 6px;
        border: none;
        font-size: 1rem;
        font-weight: bold;
        cursor: pointer;
        flex-grow: 1; /* スマホで幅いっぱいに広がる */
        text-align: center;
        max-width: 200px; /* PCでは広がりすぎないように */
    }

    /* スマホの場合はボタンを最大幅にする */
    @media screen and (max-width: 768px) {
        .btn-primary, .btn-secondary, .btn-delete {
            max-width: none;
            width: 100%;
            margin-bottom: 5px;
        }
        
        .button-area {
            flex-direction: column-reverse; /* 保存ボタンを一番上に */
        }
        
        /* 保存ボタンを目立たせる */
        #record-submit-btn {
            order: 1; 
        }
        #record-reset-btn {
            order: 2;
        }
        #record-delete-btn {
            order: 3;
        }
    }

    .btn-primary {
        background-color: #007bff;
        color: white;
    }
    
    .btn-secondary {
        background-color: #6c757d;
        color: white;
    }

    .btn-delete {
        background-color: #dc3545;
        color: white;
    }

</style>
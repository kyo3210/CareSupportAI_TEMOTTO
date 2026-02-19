<div id="record-history-modal" class="modal" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.4);">
    <div class="modal-content mobile-friendly-modal">
        <span class="close-modal" style="color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer;">&times;</span>
        <h3 style="margin-top: 0; border-bottom: 2px solid #007bff; padding-bottom: 10px;">📋 過去記録・バイタル一覧</h3>

        <div class="filter-row" style="margin: 15px 0; display: flex; gap: 10px; flex-wrap: wrap;">
            <input type="date" id="filter-date-start" class="form-control" style="padding: 5px;">
            <span>～</span>
            <input type="date" id="filter-date-end" class="form-control" style="padding: 5px;">
            <input type="text" id="filter-keyword" placeholder="氏名・内容・記録者で検索..." style="padding: 5px; flex-grow: 1;">
            <button type="button" onclick="loadRecordHistory()" style="background: #007bff; color: white; border: none; padding: 5px 15px; border-radius: 4px; cursor: pointer;">検索</button>
            <button type="button" id="clear-filter-btn" style="background: #6c757d; color: white; border: none; padding: 5px 15px; border-radius: 4px; cursor: pointer;">クリア</button>
        </div>

        <div style="overflow-x: auto;">
            <table class="table" id="record-history-table" style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead style="background: #f8f9fa; border-bottom: 2px solid #ddd;">
                    <tr>
                        <th style="padding: 10px; text-align: left;">日時</th>
                        <th style="padding: 10px; text-align: left;">利用者</th>
                        <th style="padding: 10px; text-align: left;">記録者</th>
                        <th style="padding: 10px; text-align: left;">体温</th>
                        <th style="padding: 10px; text-align: left;">血圧(上/下)</th>
                        <th style="padding: 10px; text-align: left;">水分</th>
                        <th style="padding: 10px; text-align: left;">SPO2</th>
                        <th style="padding: 10px; text-align: left;">内容</th>
                        <th style="padding: 10px; text-align: center;">操作</th>
                    </tr>
                </thead>
                <tbody id="record-history-list">
                </tbody>
            </table>
        </div>
    </div>
</div>

<div id="edit-schedule-modal" class="modal" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.4);">
    <div class="modal-content mobile-friendly-modal">
        <span class="close-modal close-edit-modal" style="color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer;">&times;</span>
        <h3 style="margin-top: 0; border-bottom: 2px solid #007bff; padding-bottom: 10px;">✏️ 予定の編集</h3>
        
        <form id="edit-schedule-form">
            <input type="hidden" id="edit-sch-id">
            
            <div class="form-group-mobile">
                <label>内容</label>
                <input type="text" id="edit-sch-content" class="form-control-mobile">
            </div>
            
            <div class="datetime-grid-mobile">
                <div class="form-group-mobile">
                    <label>開始</label>
                    <input type="datetime-local" id="edit-sch-start" class="form-control-mobile">
                </div>
                <div class="form-group-mobile">
                    <label>終了</label>
                    <input type="datetime-local" id="edit-sch-end" class="form-control-mobile">
                </div>
            </div>

            <div class="task-toggle-container">
                <label class="task-toggle-label">
                    <input type="checkbox" id="edit-sch-is-task">
                    <span class="task-toggle-text">タスク管理対象にする</span>
                </label>
            </div>

            <div class="modal-footer-mobile" style="flex-direction: column; gap: 10px;">
                <div style="display: flex; gap: 10px; width: 100%;">
                    <button type="button" id="delete-schedule-btn" class="btn-delete-mobile" style="flex: 1;">削除</button>
                    <button type="submit" class="btn-primary-mobile" style="flex: 2;">更新する</button>
                </div>
                
                <hr style="width: 100%; border: 0; border-top: 1px solid #eee; margin: 10px 0;">
                
                <button type="button" id="go-to-record-btn" class="btn-record-mobile" style="display: none;">
                    📝 この予定のケア記録を入力する
                </button>
            </div>
        </form>
    </div>
</div>

<div id="schedule-modal" class="modal" style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.4);">
    <div class="modal-content mobile-friendly-modal">
        <span class="close-modal" id="close-schedule-modal" style="color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer;">&times;</span>
        <h3 style="margin-top: 0; border-bottom: 2px solid #007bff; padding-bottom: 10px;">📅 予定を追加</h3>
        
        <form id="schedule-form">
            <div class="form-group-mobile">
                <label>種類</label>
                <select id="schedule-type" class="form-control-mobile">
                    <option value="care">利用者ケア</option>
                    <option value="work">業務・会議</option>
                </select>
            </div>

            <div id="care-fields">
                <div class="form-group-mobile">
                    <label>利用者</label>
                    <select id="sch-client-select" class="form-control-mobile"></select>
                </div>
                <div class="form-group-mobile">
                    <label>ケア内容</label>
                    <input type="text" id="sch-content" placeholder="入浴介助、通院同行など" class="form-control-mobile">
                </div>
            </div>

            <div id="work-fields" style="display: none;">
                <div class="form-group-mobile">
                    <label>予定名</label>
                    <input type="text" id="sch-title" placeholder="会議、事務作業など" class="form-control-mobile">
                </div>
            </div>

            <div class="datetime-grid-mobile">
                <div class="form-group-mobile">
                    <label>開始日時</label>
                    <input type="datetime-local" id="sch-start" required class="form-control-mobile">
                </div>
                <div class="form-group-mobile">
                    <label>終了日時</label>
                    <input type="datetime-local" id="sch-end" required class="form-control-mobile">
                </div>
            </div>

            <div class="task-toggle-container">
                <label class="task-toggle-label">
                    <input type="checkbox" id="sch-is-task" checked>
                    <span class="task-toggle-text">この予定をタスク管理する</span>
                </label>
            </div>

            <div class="modal-footer-mobile">
                <button type="submit" class="btn-primary-mobile">登録する</button>
            </div>
        </form>
    </div>
</div>

<div id="client-search-modal" class="modal" style="display: none; position: fixed; z-index: 2000; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.4);">
    <div class="modal-content mobile-friendly-modal">
        <span class="close-modal" style="color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer;">&times;</span>
        <h3 style="margin-top: 0; border-bottom: 2px solid #007bff; padding-bottom: 10px;">🔍 利用者を選択</h3>
        
        <div style="max-height: 400px; overflow-y: auto; margin-top: 10px;">
            <table class="table" id="client-search-table" style="width: 100%; border-collapse: collapse;">
                <thead style="background: #f8f9fa;">
                    <tr>
                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">ID</th>
                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">氏名</th>
                        <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">選択</th>
                    </tr>
                </thead>
                <tbody id="client-search-list">
                </tbody>
            </table>
        </div>
        <div style="margin-top: 15px; text-align: right;">
            <button type="button" class="close-modal" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">閉じる</button>
        </div>
    </div>
</div>

<style>
    /* === モーダル・スマホ最適化スタイル === */
    .mobile-friendly-modal {
        background-color: #fefefe;
        margin: 5% auto;
        padding: 20px;
        border: 1px solid #888;
        width: 90%; 
        max-width: 800px;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }

    #schedule-modal .mobile-friendly-modal,
    #edit-schedule-modal .mobile-friendly-modal {
        max-width: 500px;
    }

    .form-group-mobile {
        margin-bottom: 15px;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    .form-group-mobile label {
        font-weight: bold;
        color: #555;
        font-size: 0.9rem;
    }

    .form-control-mobile {
        width: 100%;
        padding: 12px;
        border: 1px solid #ccc;
        border-radius: 6px;
        font-size: 16px;
        box-sizing: border-box;
        background: #fdfdfd;
    }

    .datetime-grid-mobile {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
    }

    /* ★タスク管理トグルエリアの修正（画像のような左寄りを防ぐ） */
    .task-toggle-container {
        margin: 10px 0 20px 0;
    }

    .task-toggle-label {
        display: flex !important;
        align-items: center;
        justify-content: flex-start; /* 左寄せ */
        gap: 12px;
        background: #f1f8ff;
        padding: 16px;
        border-radius: 8px;
        cursor: pointer;
        border: 1px solid #d1e3f8;
        transition: background 0.2s;
        user-select: none;
    }

    .task-toggle-label:active {
        background: #e1f0ff;
    }

    .task-toggle-label input[type="checkbox"] {
        width: 22px;
        height: 22px;
        margin: 0;
        cursor: pointer;
        flex-shrink: 0;
    }

    .task-toggle-text {
        font-size: 0.95rem;
        font-weight: bold;
        color: #333;
        white-space: nowrap;
    }

    .modal-footer-mobile {
        margin-top: 20px;
        text-align: right;
        display: flex;
        justify-content: flex-end;
    }

    .btn-primary-mobile {
        background: #007bff; color: white; border: none; 
        padding: 12px 20px; border-radius: 6px; 
        font-size: 1rem; cursor: pointer; font-weight: bold;
        width: 100%;
    }
    .btn-delete-mobile {
        background: #dc3545; color: white; border: none;
        padding: 12px; border-radius: 6px; cursor: pointer; font-weight: bold;
    }
    .btn-record-mobile {
        width: 100%; background: #17a2b8; color: white; border: none;
        padding: 12px; border-radius: 6px; cursor: pointer; font-weight: bold;
    }

    @media screen and (max-width: 768px) {
        .datetime-grid-mobile {
            grid-template-columns: 1fr;
        }
        .mobile-friendly-modal {
            margin: 10% auto;
            width: 94%;
            padding: 15px;
        }

        #record-history-table, #record-history-table tbody, #record-history-table th, #record-history-table td, #record-history-table tr { display: block; }
        #record-history-table thead { display: none; }
        #record-history-table tr {
            display: flex; flex-wrap: wrap; background: #fff;
            border: 1px solid #ddd; border-radius: 8px; margin-bottom: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05); padding: 8px;
        }
        #record-history-table td { border: none; padding: 4px; font-size: 0.95rem; width: 100%; }
        #record-history-table td:nth-of-type(1) { order: 1; border-bottom: 1px solid #eee; margin-bottom: 5px; color: #007bff; font-weight: bold; }
        #record-history-table td:nth-of-type(2) { order: 2; font-size: 1.1em; font-weight: bold; }
        #record-history-table td:nth-of-type(8) { order: 3; background: #f9f9f9; padding: 8px; border-radius: 4px; margin: 5px 0; }
        #record-history-table td:nth-of-type(9) { order: 4; }

        #client-search-table thead { display: none; }
        #client-search-table tr {
            display: flex; align-items: center; justify-content: space-between;
            background: #fff; border-bottom: 1px solid #eee; padding: 12px 5px;
        }
        #client-search-table td { display: block; border: none; padding: 0 5px !important; }
        #client-search-table td:nth-child(1) { width: 60px; font-size: 0.85em; color: #666; }
        #client-search-table td:nth-child(2) { flex: 1; font-weight: bold; font-size: 1rem; text-align: left !important; }
        #client-search-table td:nth-child(3) { width: 80px; text-align: right !important; }
    }
</style>
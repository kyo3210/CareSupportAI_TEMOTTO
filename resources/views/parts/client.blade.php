<section id="client-register-section" style="background: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
    
    <div style="margin-bottom: 20px; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
        <h2 style="font-size: 1.2em; margin: 0; color: #333; font-weight: bold;">👤 利用者 登録/編集</h2>
    </div>

    <form id="client-register-form">
        <div class="input-grid">
            
            <div class="section-title full-width title-group">
                <span>基本情報</span>
                <button type="button" id="open-client-search-modal" class="btn-secondary search-btn-header">
                    🔍 一覧検索
                </button>
            </div>

            <div class="form-group full-width">
                <label>利用者ID</label>
                <input type="text" id="client-id" name="id" class="form-control" placeholder="">
            </div>

            <div class="form-group full-width">
                <label>利用者氏名</label>
                <input type="text" id="client-name" name="client_name" class="form-control">
            </div>

            <div class="form-group">
                <label>郵便番号</label>
                <div style="display: flex; gap: 5px;">
                    <input type="text" id="client-postcode" name="postcode" class="form-control" placeholder="123-4567" inputmode="numeric">
                    <button type="button" id="search-zipcode-btn" class="btn-search">住所検索</button>
                </div>
            </div>

            <div class="form-group">
                <label>連絡先電話番号</label>
                <input type="tel" id="client-tel" name="contact_tel" class="form-control" inputmode="tel">
            </div>

            <div class="form-group full-width">
                <label>住所</label>
                <input type="text" id="client-address" name="address" class="form-control">
            </div>

            <div class="section-title full-width" style="margin-top: 15px;">介護・保険情報</div>

            <div class="form-group full-width">
                <label>介護保険番号</label>
                <input type="text" id="client-insurance-no" name="insurace_number" class="form-control" inputmode="numeric">
            </div>

            <div class="form-group full-width">
                <label>ケアマネジャー名</label>
                <input type="text" id="client-care-manager" name="care_manager" class="form-control">
            </div>

            <div class="form-group">
                <label>認定有効開始日</label>
                <input type="date" id="client-care-start" name="care_start_date" class="form-control">
            </div>
            <div class="form-group">
                <label>認定有効終了日</label>
                <input type="date" id="client-care-end" name="care_end_date" class="form-control">
            </div>

            <div class="form-group full-width">
                <label>ケアマネ連絡先</label>
                <input type="tel" id="client-manager-tel" name="care_manager_tel" class="form-control" inputmode="tel">
            </div>
        </div>

        <div class="button-area">
            <button type="button" id="client-delete-btn" class="btn-delete" style="display: none;">削除する</button>
            <button type="button" id="client-clear-btn" class="btn-secondary">クリア</button>
            <button type="submit" id="client-submit-btn" class="btn-primary">情報を保存する</button>
        </div>
    </form>
</section>

<style>
    /* === レイアウト共通スタイル === */
    .input-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
    }
    .full-width {
        grid-column: span 2;
    }
    
    /* 見出しエリアの基本設定 */
    .section-title {
        font-weight: bold;
        color: #0056b3;
        border-bottom: 1px solid #eee;
        padding-bottom: 5px;
        margin-bottom: 5px;
        min-height: 35px;
    }

    /* ★追加：見出しとボタンのグループ化（PC用：横並び） */
    .title-group {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .search-btn-header {
        font-size: 0.85rem;
        padding: 5px 10px;
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
    
    /* 入力フォーム */
    .form-control {
        width: 100%;
        padding: 12px;
        border: 1px solid #ccc;
        border-radius: 6px;
        font-size: 16px;
        box-sizing: border-box;
        background: #f9f9f9;
    }
    .form-control:focus {
        border-color: #007bff;
        background: #fff;
        outline: none;
    }

    /* ボタン類 */
    .btn-search {
        background: #f8f9fa;
        border: 1px solid #ccc;
        padding: 0 15px;
        border-radius: 6px;
        cursor: pointer;
        white-space: nowrap;
        font-size: 0.9rem;
    }

    .button-area {
        margin-top: 25px;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }
    .btn-primary, .btn-secondary, .btn-delete {
        padding: 12px 24px;
        border-radius: 6px;
        border: none;
        font-size: 1rem;
        font-weight: bold;
        cursor: pointer;
        text-align: center;
    }
    .btn-primary { background-color: #28a745; color: white; }
    .btn-secondary { background-color: #6c757d; color: white; }
    .btn-delete { background-color: #dc3545; color: white; }

    /* エラー表示 */
    .error-message { color: #dc3545; font-size: 0.85rem; font-weight: bold; margin-top: 4px; display: block; }
    .input-error { border-color: #dc3545 !important; background-color: #fff8f8 !important; }

    /* スマホ対応 */
    @media screen and (max-width: 768px) {
        .button-area {
            flex-direction: column-reverse;
        }
        .btn-primary, .btn-secondary, .btn-delete {
            width: 100%;
        }

        /* ★追加：スマホ画面では見出しとボタンを縦並びにする */
        .title-group {
            flex-direction: column; /* 縦並び */
            align-items: flex-start; /* 左寄せ */
            gap: 10px; /* 余白を開ける */
            padding-bottom: 10px; /* 下線との距離 */
        }
        
        /* ボタンを横幅いっぱいにして押しやすく */
        .search-btn-header {
            width: 100%;
            padding: 10px;
        }
    }
</style>
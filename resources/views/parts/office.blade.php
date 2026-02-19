<section id="provider-register-section">
    <h2 style="font-size: 1.1em; margin-top: 0; margin-bottom: 15px; color: #333;">🏢 自事業者（自社）情報</h2>
    <form id="provider-register-form">
        <input type="hidden" id="prov-id" value="1">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="grid-column: span 2;"><label>事業者名</label><input type="text" id="prov-name" name="name" required></div>
            <div><label>郵便番号</label><input type="text" id="prov-postcode" name="postcode" maxlength="7" required></div>
            <div><label>代表電話番号</label><input type="text" id="prov-tel" name="tel" required></div>
            <div style="grid-column: span 2;"><label>住所</label><input type="text" id="prov-address" name="address" required></div>
        </div>
        <div style="margin-top: 10px; text-align: right;">
            <button type="submit" style="background: #0056b3; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">事業者情報を更新</button>
        </div>
    </form>

    <div style="margin-top: 25px; border-top: 2px dashed #eee; padding-top: 20px;">
        <h3 style="font-size: 1em; color: #555; margin-bottom: 15px;">👥 職員アカウント作成</h3>
        <form id="staff-register-form">
            <input type="hidden" id="target-office-id">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                <div><label>職員氏名</label><input type="text" id="staff-name" placeholder="例: 山田 太郎" required></div>
                <div><label>メールアドレス</label><input type="email" id="staff-email" placeholder="staff@example.com" required></div>
                <div>
                    <label>初期パスワード</label>
                    <div style="position: relative;">
                        <input type="password" id="staff-password" placeholder="8文字以上" required style="width: 100%; padding-right: 65px;">
                        <span class="password-toggle-icon" data-target="#staff-password" id="toggle-staff-password" 
                            style="position: absolute; right: 5px; top: 50%; transform: translateY(-50%); 
                                    cursor: pointer; user-select: none; font-size: 11px; 
                                    background: #f0f0f0; padding: 4px 8px; border: 1px solid #ccc; 
                                    border-radius: 4px; color: #666; font-weight: bold; line-height: 1;">
                            表示
                        </span>
                    </div>
                </div>
            </div>
            <div style="margin-top: 10px; text-align: right;">
                <button type="submit" style="background: #17a2b8; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">職員を登録する</button>
            </div>
        </form>
    </div>
    <div style="margin-top: 20px;">
        <label>👨‍⚕️ 所属職員一覧</label>
        <div id="staff-list" style="background: #f9f9f9; border: 1px solid #eee; border-radius: 4px; margin-top: 5px; max-height: 150px; overflow-y: auto;">
            <p style="padding: 10px; color: #999; font-size: 0.9em;">読み込み中...</p>
        </div>
    </div>
</section>
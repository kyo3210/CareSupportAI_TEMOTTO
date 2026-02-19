// =======================================================
// 利用者・事業所・職員管理ロジック
// =======================================================

// --- 共通ヘルパー関数: エラー表示 ---
function showError(selector, message) {
    const $input = $(selector);
    $input.addClass('input-error');
    $input.after(`<span class="error-message">⚠️ ${message}</span>`);
}

function clearErrors() {
    $('.error-message').remove();
    $('.input-error').removeClass('input-error');
}

/**
 * 利用者リストの取得とセレクトボックス更新
 */
async function fetchClients() {
    try {
        const response = await axios.get('/web-api/clients');
        console.log(`利用者リスト取得: ${response.data.length}件`); 

        // ダッシュボードの更新対象者リストを表示
        renderExpiryAlertList(response.data);

        // 各画面のプルダウンを更新
        ['#client-select', '#record-client-select', '#sch-client-select', '#edit-sch-client-select'].forEach(id => {
            const $el = $(id);
            if ($el.length > 0) {
                $el.empty().append('<option value="">利用者を選択してください</option>');
                response.data.forEach(c => {
                    $el.append(`<option value="${c.id}">${c.id}: ${c.client_name}</option>`);
                });
                console.log(`プルダウン更新完了: ${id}`);
            } else {
                // 警告は出るが、その画面にいないだけなので無視してOK
                // console.warn(`プルダウンが見つかりません: ${id}`);
            }
        });
    } catch (e) { 
        console.error("利用者リスト取得エラー:", e); 
    }
}

/**
 * 未完了タスク（未記録＆TODO）のアラート表示
 */
async function fetchUnfinishedTasks() {
    try {
        const response = await axios.get('/web-api/dashboard/unfinished-tasks');
        const tasks = response.data;
        const count = tasks.length;

        $('#count-todo-alert').text(count);
        const $tbody = $('#list-todo-alert');
        $tbody.empty();

        if (count > 0) {
            $('#btn-todo-alert').css('opacity', '1.0');

            tasks.forEach(t => {
                const time = t.start.substring(11, 16);
                let badge = "";
                let content = "";
                let actionBtn = "";

                if (t.alert_type === 'missing_record') {
                    const clientName = (t.client && t.client.client_name) ? t.client.client_name : '利用者不明';
                    badge = `<span style="background:#ffc107; color:#333; font-size:0.7em; padding:2px 6px; border-radius:4px; margin-right:5px;">未記録</span>`;
                    content = `<strong>${clientName}</strong> 様`;

                    const dateStr = t.start.substring(0, 10);
                    
                    // ★重要修正ポイント：
                    // client_id を parseInt() せず、文字列としてシングルクォートで囲んで渡す
                    // これにより "A001" 等のIDでも NaN にならず正しく渡ります
                    actionBtn = `<button type="button" onclick="goToRecordTab(${t.id}, '${t.client_id}', '${dateStr}', '${time}')" style="border:1px solid #17a2b8; background:#17a2b8; color:white; font-size:0.8em; padding:2px 8px; border-radius:4px; cursor:pointer;">記録入力</button>`;
                } else {
                    badge = `<span style="background:#17a2b8; color:#fff; font-size:0.7em; padding:2px 6px; border-radius:4px; margin-right:5px;">業務</span>`;
                    content = `${t.title}`;
                    
                    // スケジュールIDは数値なので parseInt してもOKだが、そのまま渡してもOK
                    actionBtn = `<button type="button" onclick="confirmWorkTask(${t.id})" style="border:1px solid #28a745; background:#28a745; color:white; font-size:0.8em; padding:2px 8px; border-radius:4px; cursor:pointer;">確認済</button>`;
                }

                $tbody.append(`
                    <li style="display: flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                        <span style="font-weight:bold; color:#555; margin-right:10px; min-width:45px;">${time}</span>
                        <div style="flex:1;">${badge} ${content}</div>
                        <div style="display:flex; gap:5px;">${actionBtn}</div>
                    </li>
                `);
            });
        } else {
            $tbody.append('<li class="empty-msg">本日のタスクは全て完了しています。</li>');
            $('#btn-todo-alert').css('opacity', '0.6');
        }
    } catch (e) {
        console.error("タスク取得エラー:", e);
    }
}

window.confirmWorkTask = async function(id) {
    if (!confirm('この業務を「確認済」としてアラートから消去しますか？')) return;
    try {
        await axios.patch(`/web-api/schedules/${id}/confirm`);
        fetchUnfinishedTasks();
    } catch (e) {
        alert("更新に失敗しました。");
    }
};

/**
 * ケア記録入力画面へ遷移し、値をセットする
 */
window.goToRecordTab = function(schId, clientId, date, time) {
    // 1. タブ切り替え
    if (typeof showTab === 'function') {
        showTab('record');
    } else {
        $(`.menu-item[data-tab="record"]`).click();
    }

    // 2. フォームセット用関数（リトライ機能付き）
    const setFormValues = (retryCount = 0) => {
        const $select = $('#record-client-select');
        
        // セレクトボックス自体がない場合
        if ($select.length === 0) {
            console.error("エラー: #record-client-select が見つかりません");
            return;
        }

        // オプションがまだ読み込まれていない場合（初期状態のみ）
        // ※ fetchClients の完了を待つ
        if ($select.children('option').length <= 1) {
            if (retryCount < 20) { // 最大2秒待つ (0.1s * 20)
                // console.log(`プルダウン準備中... (${retryCount + 1}/20)`);
                setTimeout(() => setFormValues(retryCount + 1), 100);
            } else {
                console.error("タイムアウト: 利用者リストが読み込めませんでした");
                // 非常手段：リストになくても値を入れようと試みる
                $select.append(`<option value="${clientId}" selected>${clientId}</option>`);
                $select.val(clientId).trigger('change');
            }
            return;
        }

        // 正常にセット
        $select.val(clientId).trigger('change'); // jQueryのchangeイベント発火
        $('#record-schedule-id').val(schId);
        $('#record-date').val(date);
        $('#record-time').val(time);
        
        // 入力欄リセット
        $('#record-content').val('');
        $('#record-temp, #record-spo2, #record-bp-high, #record-bp-low, #record-water').val('');

        console.log(`セット完了: ClientID=${clientId}, SchID=${schId}`);
    };

    // 処理開始
    setFormValues();
    
    // 3. スクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function renderExpiryAlertList(clients) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const limitDate = new Date(); limitDate.setDate(today.getDate() + 60);
    const alertList = clients.filter(c => {
        if (!c.care_end_date) return false;
        const endDate = new Date(c.care_end_date);
        return endDate <= limitDate;
    }).sort((a, b) => new Date(a.care_end_date) - new Date(b.care_end_date));

    $('#count-renewal-alert').text(alertList.length);
    const $tbody = $('#list-renewal-alert'); $tbody.empty();

    if (alertList.length > 0) {
        $('#btn-renewal-alert').css('opacity', '1.0');
        alertList.forEach(c => {
            const endDate = new Date(c.care_end_date);
            const isExpired = endDate < today;
            const statusStyle = isExpired ? 'color: #d9534f; font-weight: bold;' : 'color: #f0ad4e; font-weight: bold;';
            $tbody.append(`
                <li style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                    <div><strong>${c.client_name}</strong><div style="font-size: 0.85em; color: #666;">有効期限: ${c.care_end_date.replace(/-/g, '/')}</div></div>
                    <span style="${statusStyle}">${isExpired ? '⚠️ 期限切れ' : '⏳ 60日以内'}</span>
                </li>
            `);
        });
    } else {
        $tbody.append('<li class="empty-msg">現在、更新対象者はいません。</li>');
        $('#btn-renewal-alert').css('opacity', '0.6');
    }
}

async function fetchOfficeInfo() {
    try {
        const response = await axios.get('/web-api/offices');
        if (response.data.length > 0) {
            const office = response.data[0];
            $('#prov-id').val(office.id); $('#prov-name').val(office.name); $('#target-office-id').val(office.id);
        }
    } catch (e) { console.error(e); }
}

async function fetchStaffList() {
    try {
        const res = await axios.get('/web-api/staff');
        const $list = $('#staff-list');
        if (res.data.length === 0) {
            $list.html('<p style="padding: 10px; color: #999;">登録された職員はいません</p>');
            return;
        }
        $list.html(res.data.map(s => `<div style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${s.name}</strong></div>`).join(''));
    } catch (e) { console.error(e); }
}

function saveStartPageSetting(value) { localStorage.setItem('care_ai_start_page', value); }
function applyStartPage() {
    const startPage = localStorage.getItem('care_ai_start_page') || 'dashboard';
    if (typeof showTab === 'function') showTab(startPage);
}

$(document).ready(function() {
    // 依存関係を考慮して実行
    fetchClients(); 
    fetchOfficeInfo(); 
    fetchStaffList(); 
    applyStartPage();
    fetchUnfinishedTasks();
    
    $('#add-schedule-btn').on('click', () => $('#schedule-modal').fadeIn(200));
    $('.close-edit-modal, .modal .close-modal').on('click', () => $('.modal').fadeOut(200));
});
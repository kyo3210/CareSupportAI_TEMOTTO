/**
 * ai-chat.js - AI音声入力＆ケア記録・スケジュール連携システム
 * 【Gold Master v8.2】
 * - 修正: 操作質問で要約表示、複数提案、コンパクトな縦レイアウトに対応
 * - 修正: 該当なしの場合にFAQサイトへのリンクを案内
 * - 維持: 過去記録、バイタル分析、スケジュール連携等の全機能
 * - 追加: 職員チャット機能（メッセージ履歴取得・送信・画像添付API連携）
 * - 修正: 職員リストのプルダウン選択に応じて表示するチャット履歴を切り替え（フィルタリング機能）
 * - 修正: 送信済みメッセージの「▶ 〇〇宛て」ヘッダーを削除しスッキリしたUIに変更
 * - 修正: モード（AI相談、ケア記録など）を切り替えた瞬間に、チャット画面を無言でクリアする機能を追加
 * - 追加: バイタルとチャット未読アラートの連動更新機能を追加
 * - 修正: 今日の予定表示で、スケジュールタイトルと利用者名が重複している場合はカッコ書きを省略する
 * - 修正: チャットアラートの各行に「開く」ボタンを設置し、特定職員とのチャットに直接遷移できるように変更
 * - 修正: バイタルアラートの異常値テキストを赤文字に戻す
 * - 修正: チャットアラートパネル下部の不要な「チャット画面を開く」青ボタンを完全撤去
 * - 修正: 左メニューのAIチャット削除に伴い、アラートから開く際の画面遷移をダッシュボード専用に最適化
 * - 修正: クイックアクション「記録を入力する」でメッセージと「ケア記録表示」ボタンを表示
 * - 修正: AIが体温・血圧(上下)・SPO2・水分量を全て認識し、ケア記録フォームに自動セットする機能を強化
 * - 修正: 「ケア記録表示」ボタン押下時、選択中の利用者をケア記録画面へ自動で引き継ぐように変更
 * - 修正: ケア記録入力中のローディングメッセージを「確認中...」から「ケア記録作成中...」に変更
 * - 修正: ユーザーとAIのメッセージ幅を85%に制限し、LINE風の吹き出しデザイン（左右の余白としっぽ）を適用
 * - 修正: 既存CSSの干渉（右側の見えない壁）を完全に断ち切るためクラス名を変更し、最強の右寄せルールを適用
 * - 修正: ケア記録モードで「記録を調べる」実行時に、記録作成ではなく検索としてAIに処理させるフラグ制御を追加
 * - 修正: 直近のアクションを引き継ぐよう修正。未選択時は入力テキストから提案を行う処理を追加
 * - 修正: AI相談モードの際は利用者IDを送信せず、一般的なGeminiとして回答するように変更
 * - 修正: チャット送信時の自動リロードを防止（ネットワーク監視処理からチャットAPIを除外）
 * - 修正: 未入力データの推測・捏造を防止し、入力がない項目は空にする処理を追加
 * - 修正: AIの不要な前置き（「主任として〜」等）を排除し、画面遷移とメッセージの表示順序を最適化
 * - 修正: 手動でケア記録入力画面を開いた場合は保存後も画面を維持し、AI経由時のみチャットへ戻るよう制御
 * - 修正: 保存してAIチャットへ戻った際、チャットの履歴と状態を完全に復元する処理を追加
 * - 修正: 記録を調べる際、回答を「です・ます調」にし、該当記録の簡潔なまとめを返すよう指示を付与
 * - 修正: 記録作成時のメッセージを「ケア記録作成中...〜」に変更し、結果取得後も削除せずそのまま維持するよう変更
 * - 修正: 未入力（血圧、水分等）の判定をさらに強化（「なし」「特記事項なし」等も除外対象に追加）
 * - 修正: 記録保存後にAIチャットへ戻った際、完了報告メッセージ「記録の作成を完了しました。」を追加表示
 * - 修正: AI相談のシステムプロンプトから不要な制限を外し、一般的なGeminiとして自然に回答するよう変更
 * - 修正: AIによる未入力項目の捏造防止をさらに強化し、送信テキストに存在しない数値や文章をフロントエンド側で強制的に除外・クリアする処理を追加
 * - 修正: 血圧の入力値の大小を自動判別し、大きい方を「上」、小さい方を「下」に正しくセットする処理を追加
 * - 修正: 血圧の区切り文字としてハイフン(-)等も許容するように抽出ロジックを強化
 * - 修正: AI相談時、現在の日付をプロンプトに動的に付与して時制を正しく認識させ、不要な挨拶文を禁止
 * - ★修正: チャットアラートで「全員宛て」メッセージの表示と遷移（開く）を正しく行えるよう対応（今回）
 * - ★追加: 「メッセージ」モード時に、ワンクリックで返信できる定型文・リアクションのクイックアクションボタンを追加（今回）
 */

// =======================================================
// 1. 初期設定・通信設定
// =======================================================
axios.defaults.withCredentials = true;

function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
}
const initialToken = getCsrfToken();
if (initialToken) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = initialToken;
}

let isAwaitingConfirmation = false;
let clientMap = {}; 
let isRestoring = false; 
let cachedManualGuide = ""; 
let activeQuickAction = null; 

// =======================================================
// 2. アラート通知の更新（バイタル・チャット未読）
// =======================================================
async function updateAlertCounts() {
    try {
        const resVital = await axios.get('/web-api/dashboard/vital-alerts');
        const vitalCount = resVital.data.length;
        $('#count-vital-alert').text(vitalCount);
        
        let vitalHtml = '';
        if (vitalCount === 0) {
            vitalHtml = '<li class="empty-msg">現在、異常値の報告はありません。</li>';
        } else {
            resVital.data.forEach(v => {
                const temp = v.body_temp ? `${v.body_temp}℃` : '--';
                const bp = v.blood_pressure_high ? `${v.blood_pressure_high}/${v.blood_pressure_low}` : '--';
                vitalHtml += `<li style="color: #c62828; padding: 6px 0; border-bottom: 1px solid #f0f0f0;"><strong>${v.client.client_name}</strong>: ${temp} / ${bp}</li>`;
            });
        }
        $('#list-vital-alert').html(vitalHtml);

        const resChat = await axios.get('/web-api/staff-chat/unread-count');
        const unreadCount = resChat.data.unread_count;
        const unreadMsgs = resChat.data.messages;
        const $chatBadge = $('#count-chat-unread');
        
        $chatBadge.text(unreadCount);
        if (unreadCount > 0) {
            $chatBadge.show();
        } else {
            $chatBadge.hide();
        }

        let chatHtml = '';
        if (unreadCount === 0) {
            chatHtml = '<li class="empty-msg">現在、未読のメッセージはありません。</li>';
        } else {
            unreadMsgs.forEach(msg => {
                let textPreview = msg.message ? msg.message : '';
                if (textPreview.length > 15) textPreview = textPreview.substring(0, 15) + '...';
                if (msg.image_path) textPreview = '📷 ' + (textPreview ? textPreview : '画像');
                
                // ★修正: メッセージが全員宛て（receiver_idがnull）の場合の表示と遷移先IDを分ける
                const isBroadcast = msg.receiver_id === null;
                const targetId = isBroadcast ? '' : msg.sender_id;
                const senderNameDisplay = isBroadcast ? `📢 ${msg.sender.name} (全員宛て)` : `👤 ${msg.sender.name}`;
                
                chatHtml += `<li style="padding: 8px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1; overflow: hidden;">
                        <div style="font-weight:bold; color:#0056b3; font-size:0.9em;">${senderNameDisplay}</div>
                        <div style="font-size:0.85em; color:#555; margin-top:2px; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${textPreview}</div>
                    </div>
                    <button type="button" onclick="openSpecificStaffChat('${targetId}')" style="background: #28a745; color: #fff; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85em; margin-left: 10px; font-weight: bold; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">開く</button>
                </li>`;
            });
        }
        $('#list-staff-chat-alert').html(chatHtml);

    } catch (e) {
        console.error("アラート更新失敗", e);
    }
}

// =======================================================
// 3. 個人情報秘匿化ロジック
// =======================================================
function updateClientMap() {
    clientMap = {};
    $('#client-select option').each(function(index) {
        const realName = $(this).text().replace(/[\s　]/g, ''); 
        if (realName && realName !== '利用者選択' && realName !== '利用者を選択してください') {
            const placeholder = `利用者${String.fromCharCode(65 + (index % 26))}`; 
            clientMap[realName] = placeholder;
            clientMap[placeholder] = realName;
        }
    });
}

function maskRealNames(text) {
    let maskedText = text;
    Object.keys(clientMap).forEach(name => {
        if (!name.startsWith('利用者')) {
            maskedText = maskedText.split(name).join(clientMap[name]);
        }
    });
    return maskedText;
}

function unmaskRealNames(text) {
    if (!text) return text;
    let unmaskedText = text;
    Object.keys(clientMap).forEach(placeholder => {
        if (placeholder.startsWith('利用者')) {
            unmaskedText = unmaskedText.split(placeholder).join(clientMap[placeholder]);
        }
    });
    return unmaskedText;
}

// =======================================================
// 4. UI表示制御 & 状態保存・復元
// =======================================================
function appendMessage(sender, message) {
    const chatWindow = $('#chat-window');
    const messageClass = sender === 'user' ? 'user-message' : 'ai-message';
    
    let formattedMessage = message;
    if (typeof message === 'string') {
        if (!message.includes('<div') && !message.includes('<img') && !message.includes('<button')) {
            formattedMessage = message.replace(/\n/g, '<br>');
        } else {
            formattedMessage = message.replace(/\n/g, '<br>').replace(/<br>\s*<div/g, '<div').replace(/<\/div>\s*<br>/g, '</div>');
        }
    }

    let html = '';
    
    if (sender === 'ai') {
        html = `<div class="${messageClass}" style="display: flex; flex-direction: column; align-items: flex-start; width: 100%; margin: 0 0 15px 0 !important; padding: 0 !important;"> 
                <div style="background: #eef4ff; padding: 12px 15px; border-radius: 0 15px 15px 15px; color: #0056b3; line-height: 1.5; border: 1px solid #d1e3f8; max-width: 90%; text-align: left; word-wrap: break-word; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                    ${formattedMessage}
                </div>
            </div>`;
    } else if (sender === 'staff') {
        html = `<div class="${messageClass}" style="display: flex; flex-direction: column; align-items: flex-start; width: 100%; margin: 0 0 15px 0 !important; padding: 0 !important;"> 
                <div style="background: #e8f4f8; padding: 10px 14px; border-radius: 0 15px 15px 15px; color: #0056b3; max-width: 90%; text-align: left; word-wrap: break-word; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                    ${formattedMessage}
                </div>
            </div>`;
    } else {
        html = `<div class="user-chat-bubble" style="display: flex; flex-direction: column; align-items: flex-end; width: 100%; margin: 0 0 15px 0 !important; padding: 0 !important;">
                <div style="background: #f0f0f0; border: 1px solid #ddd; padding: 12px 15px; border-radius: 15px 0 15px 15px; color: #333; max-width: 90%; text-align: left; line-height: 1.5; word-wrap: break-word; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                    ${formattedMessage}
                </div>
            </div>`;
    }
    chatWindow.append(html);
    chatWindow.scrollTop(chatWindow[0].scrollHeight);
    
    if (!isRestoring) saveChatState();
}

function saveChatState() {
    if (isRestoring) return; 
    const currentHtml = $('#chat-window').html();
    const currentClient = $('#client-select').val();
    const currentMode = $('input[name="chat-mode"]:checked').val();

    if (currentHtml && currentHtml.trim().length > 0) {
        sessionStorage.setItem('ai_chat_history_html', currentHtml);
    }
    if (currentClient) sessionStorage.setItem('ai_chat_selected_client', currentClient);
    if (currentMode) sessionStorage.setItem('ai_chat_selected_mode', currentMode);
}

function restoreChatState(force = false) {
    isRestoring = true;
    const savedHtml = sessionStorage.getItem('ai_chat_history_html');
    const savedClient = sessionStorage.getItem('ai_chat_selected_client');
    const savedMode = sessionStorage.getItem('ai_chat_selected_mode');

    if (savedMode) {
        $(`input[name="chat-mode"][value="${savedMode}"]`).prop('checked', true).trigger('change');
    }

    if (savedHtml) {
        if (force || $('#chat-window').html().trim() === "") {
            $('#chat-window').html(savedHtml);
            setTimeout(() => { $('#chat-window').scrollTop($('#chat-window')[0].scrollHeight); }, 100);
        }
    }

    if (savedClient) {
        let retryCount = 0;
        const setClientInterval = setInterval(() => {
            retryCount++;
            if ($('#client-select option').length > 1) {
                if ($('#client-select').val() !== savedClient) {
                    $('#client-select').val(savedClient).trigger('change');
                }
                clearInterval(setClientInterval);
                setTimeout(() => { isRestoring = false; }, 500);
            } else if (retryCount > 25) {
                clearInterval(setClientInterval);
                isRestoring = false;
            }
        }, 200); 
    } else {
        setTimeout(() => { isRestoring = false; }, 500);
    }
}

// =======================================================
// 5. クイックアクション＆グラフ機能
// =======================================================
window.triggerQuickAction = async function(action) {
    const clientId = $('#client-select').val();
    
    if (['input', 'history', 'search', 'vital'].includes(action) && !clientId) {
        alert("利用者を選択してください");
        return;
    }

    activeQuickAction = action; 

    switch (action) {
        case 'input':
            const msgHtml = `記録を入力してください。<div style="margin-top: 8px;"><button type="button" onclick="openRecordTabWithClient()" style="background: #28a745; color: #fff; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 0.85em; font-weight: bold; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">📝 ケア記録表示</button></div>`;
            appendMessage('ai', msgHtml);
            $('#user-input').focus();
            speakText("記録内容を入力、または音声でお話しください。");
            break;
        case 'history':
            appendMessage('user', '過去３回分の記録です');
            appendMessage('ai', '読み込んでいます...');
            try {
                const res = await axios.get(`/web-api/records/recent/${clientId}`);
                $('.ai-message').last().remove();
                if (res.data.length === 0) {
                    const msg = '過去の記録はありません。';
                    appendMessage('ai', msg); speakText(msg);
                } else {
                    let html = `<div style="font-weight:bold; margin-bottom:5px; color:#555; font-size:0.9em; border-left:3px solid #0056b3; padding-left:6px;">📅 直近3件</div>`;
                    res.data.forEach(r => {
                        const vitalStr = `${r.body_temp ? '🌡'+r.body_temp+'℃' : ''} ${r.blood_pressure_high ? '🩺'+r.blood_pressure_high+'/'+r.blood_pressure_low : ''}`;
                        html += `
                        <div style="background: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 6px 10px; margin-bottom: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                            <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #f0f0f0; margin-bottom: 2px; padding-bottom: 2px;">
                                <span style="font-size: 0.95em; font-weight: bold; color: #333;">${r.formatted_date}</span>
                                <span style="font-weight: bold; color: #0056b3; font-size: 0.85em;">${vitalStr}</span>
                            </div>
                            <div style="font-size: 0.85em; color: #444; line-height: 1.3;">${unmaskRealNames(r.content)}</div>
                        </div>`;
                    });
                    appendMessage('ai', html); speakText("記録を表示しました。");
                }
            } catch (e) {
                $('.ai-message').last().remove(); appendMessage('ai', '取得に失敗しました。');
            }
            break;
        case 'search':
            const msg = '調べたいことを入力してください。';
            appendMessage('ai', msg); speakText("調べたいことを入力してください。");
            $('#user-input').attr('placeholder', '例：インフルエンザはいつ？').focus();
            break;
        case 'vital':
            appendMessage('user', '１週間分のバイタルを表示します');
            $('#vital-chart-container').slideDown();
            renderVitalChart(clientId); speakText("週間バイタルを表示します。");
            break;
        case 'schedule_today':
            appendMessage('user', '今日の予定を表示します');
            appendMessage('ai', '確認中...');
            try {
                const res = await axios.get('/web-api/schedules/today');
                $('.ai-message').last().remove();
                if (res.data.length === 0) {
                    const msg = "予定はありません。";
                    appendMessage('ai', msg); speakText(msg);
                } else {
                    let html = `<div style="font-weight:bold; margin-bottom:5px; color:#555; border-left:3px solid #28a745; padding-left:6px; font-size:0.9em;">📅 本日</div>`;
                    res.data.forEach(s => {
                        const time = s.start.substring(11, 16);
                        
                        let clientNameSuffix = '';
                        if (s.client && s.client.client_name) {
                            const cleanTitle = (s.title || "").replace(/[\s　]/g, '');
                            const cleanClient = s.client.client_name.replace(/[\s　]/g, '');
                            if (!cleanTitle.includes(cleanClient)) {
                                clientNameSuffix = ` <small style="color:#888;">(${s.client.client_name})</small>`;
                            }
                        }

                        html += `
                        <div style="background:#fff; border:1px solid #eee; border-radius:5px; margin-bottom:4px; padding:6px 10px; display:flex; align-items:center; gap:8px;">
                            <span style="font-weight:bold; color:#28a745; font-size:0.85em;">${time}</span>
                            <span style="font-size:0.85em; color:#333;">${s.title}${clientNameSuffix}</span>
                        </div>`;
                    });
                    appendMessage('ai', html); speakText(`予定は${res.data.length}件です。`);
                }
            } catch (e) {
                $('.ai-message').last().remove(); appendMessage('ai', '失敗しました。');
            }
            break;
        case 'schedule_input':
            if ($('#schedule-modal').length > 0) {
                $('#schedule-modal').fadeIn(200); speakText("予定追加画面です。");
            } else {
                alert("画面を開けませんでした。");
            }
            break;
    }
};

async function renderVitalChart(clientId) {
    try {
        const res = await axios.get(`/web-api/records/vitals/${clientId}`);
        const data = res.data; 
        const ctx = document.getElementById('chatVitalChart').getContext('2d');
        if (window.myChatVitalChart) window.myChatVitalChart.destroy();
        window.myChatVitalChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.dates,
                datasets: [
                    { label: '体温', data: data.temps, borderColor: '#ff6384', backgroundColor: '#ff6384', yAxisID: 'y', tension: 0.1 },
                    { label: '血圧(上)', data: data.highs, borderColor: '#36a2eb', backgroundColor: '#36a2eb', yAxisID: 'y1', tension: 0.1 },
                    { label: '血圧(下)', data: data.lows, borderColor: '#9966ff', backgroundColor: '#9966ff', yAxisID: 'y1', tension: 0.1 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
                scales: {
                    y: { type: 'linear', display: true, position: 'left', min: 34, max: 40, title: {display:false} },
                    y1: { type: 'linear', display: true, position: 'right', min: 40, max: 200, grid: { drawOnChartArea: false }, title: {display:false} }
                },
                plugins: { legend: { labels: { boxWidth: 10, font: { size: 10 } } } }
            }
        });
    } catch (e) {
        console.error(e); appendMessage('ai', 'エラーが発生しました。');
    }
}

// =======================================================
// 6. アクション実行エンジン
// =======================================================
async function executeChatAction(actionStr) {
    const rawContent = actionStr.replace('[[ACTION:', '').replace(']]', '');
    const sepIdx = rawContent.indexOf(','); if (sepIdx === -1) return;
    const command = rawContent.substring(0, sepIdx).trim();
    const args = rawContent.substring(sepIdx + 1).split(',').map(s => s.trim());

    switch (command) {
        case 'record': await handleRecordAction(args); break;
        case 'analyze': await handleAnalyzeAction(args); break;
        case 'schedule': await handleScheduleAction(args); break;
        case 'client_new': await handleClientNewAction(args); break;
    }
}

async function handleRecordAction(args) {
    const [name, vitals, content] = args; 
    saveChatState(); 
    sessionStorage.setItem('ai_chat_mode', 'active');
    
    const confirmMsg = "ケア記録作成中...この後に表示される記録入力画面で内容を確認後に保存してください";
    speakText(confirmMsg, () => { if (recognition) recognition.start(); }); 
    isAwaitingConfirmation = true;

    window.isAiChatAutoClick = true;

    if (typeof showTab === 'function') showTab('record');
    else $('a[href="#record"], button[data-tab="record"]').trigger('click');
    
    setTimeout(() => { window.isAiChatAutoClick = false; }, 500);

    $('#record-temp, #record-bp-high, #record-bp-low, #record-spo2, #record-water').val('');
    
    $('#record-client-select').val($('#client-select').val()).trigger('change');
    $('#record-date').val(new Date().toISOString().split('T')[0]);
    $('#record-time').val(new Date().toTimeString().slice(0, 5));
    
    const lastInput = sessionStorage.getItem('ai_chat_last_input') || "";
    
    const isNoContent = !content || ['無し', 'なし', '特記事項無し', '特記事項なし', '特になし'].includes(content.trim());
    let cleanContent = isNoContent ? '' : unmaskRealNames(content);
    
    let textWithoutVitals = lastInput.replace(/体温|熱|度|℃|血圧|上|下|spo2|サチュレーション|水分|量|ミリ|ml|cc/gi, '').replace(/[0-9０-９.\/]/g, '').trim();
    if (textWithoutVitals.length <= 5 && lastInput.length <= 20) {
        cleanContent = '';
    }
    
    $('#record-content').val(cleanContent);
    
    if (vitals && vitals !== "無し" && vitals !== "なし") {
        let temp = extractValue(vitals, '体温'); 
        let bph = extractValue(vitals, '血圧', 0); 
        let bpl = extractValue(vitals, '血圧', 1);
        let spo2 = extractValue(vitals, 'SPO2', 0) || extractValue(vitals, 'SpO2', 0) || extractValue(vitals, 'spo2', 0);
        let water = extractValue(vitals, '水分');

        if (bph !== null && bpl !== null) {
            let numH = parseFloat(bph);
            let numL = parseFloat(bpl);
            if (numH < numL) {
                bph = numL.toString();
                bpl = numH.toString();
            }
        }

        if (temp && !lastInput.includes(temp)) temp = null;
        if (bph && !lastInput.includes(bph)) bph = null;
        if (bpl && !lastInput.includes(bpl)) bpl = null;
        if (spo2 && !lastInput.includes(spo2)) spo2 = null;
        if (water && !lastInput.includes(water)) water = null;

        if (temp) $('#record-temp').val(temp); 
        if (bph) $('#record-bp-high').val(bph);
        if (bpl) $('#record-bp-low').val(bpl);
        if (spo2) $('#record-spo2').val(spo2);
        if (water && water !== "無し" && water !== "なし") $('#record-water').val(water);
    }
}

async function handleAnalyzeAction(args) {
    const [name, cat, query] = args; const msg = `${unmaskRealNames(name)}さんの${cat}を検索します...`;
    appendMessage('ai', msg); speakText(msg);
}

async function handleScheduleAction(args) {
    const [name, date, time, title] = args; saveChatState();
    if (typeof showTab === 'function') showTab('schedule');
    else $('a[href="#schedule"], button[data-tab="schedule"]').trigger('click');
    const msg = `${date} ${time}に予定を入力しました。`;
    appendMessage('ai', msg); speakText(msg);
}

async function handleClientNewAction(args) {
    const [nameKanji] = args; saveChatState();
    if (typeof showTab === 'function') showTab('client');
    else $('a[href="#client"], button[data-tab="client"]').trigger('click');
    const msg = `${unmaskRealNames(nameKanji)} さんの登録画面です。`;
    appendMessage('ai', msg); speakText(msg);
}

// =======================================================
// 7. システムプロンプト設定
// =======================================================
function getSystemPrompt(mode) {
    const nursingPersona = "あなたは介護現場の主任です。丁寧な『です・ます』調で回答してください。";
    let manualInstruction = "";
    if (!cachedManualGuide || cachedManualGuide === "FILE_NOT_FOUND") {
        manualInstruction = "【絶対ルール】マニュアル索引データが読み込めていません。ユーザーには必ず「該当するマニュアルが見つかりませんでした。<br><a href=\"https://emsystems.co.jp/faq/\" target=\"_blank\" style=\"color:#0056b3; font-weight:bold; text-decoration:underline;\">FAQサイト</a>をご確認ください。」と回答してください。絶対に推測で回答しないでください。";
    } else {
        manualInstruction = [
            "あなたはシステムの操作方法を案内する担当です。",
            "以下の【PDF索引リスト】(JSON形式)を参照し、ユーザーの質問に関連するマニュアルを提案してください。",
            "【重要ルール】",
            "1. 質問に該当するマニュアルが見つかった場合：",
            "   ・関連するものを最大3つまで選び、それぞれの手順の【要約】を簡潔に（箇条書きなどで）記載してください。",
            "   ・要約の直後に必ず [[ACTION:open_pdf,ファイル名,タイトル]] を出力してください。",
            "2. 該当するマニュアルが見つからなかった場合：",
            "   ・「該当するマニュアルが見つかりませんでした。<br><a href=\"https://emsystems.co.jp/faq/\" target=\"_blank\" style=\"color:#0056b3; font-weight:bold; text-decoration:underline;\">FAQサイト</a>をご確認ください。」と回答してください。",
            "【PDF索引リスト】",
            cachedManualGuide
        ].join('\n');
    }
    
    const today = new Date();
    const currentDateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

    const prompts = {
        analyze: [
            "あなたは親切で有能なAIアシスタントです。一般的な質問に対して、自然な言葉遣いで丁寧に回答してください。",
            `現在の日付は ${currentDateStr} です。この日付を基準に時制（過去・現在・未来）を正確に判断して回答してください。`,
            "※「お問い合わせいただきありがとうございます」などの挨拶や前置きは一切不要です。直接回答から始めてください。"
        ].join('\n'),
        record: [
            "【役割】スタッフの報告を『介護記録』に整えます。",
            "【出力】[[ACTION:record,仮名,体温:〇;血圧:〇/〇;SPO2:〇;水分:〇,整えた文章]]。",
            "※必ず上記のアクションタグのみを出力してください。挨拶や前置き（「主任として〜」等）は一切不要です。",
            "※ユーザーが発言していない項目（数値やケア内容の文章）は絶対に推測や捏造をせず、必ず「無し」としてください。"
        ].join('\n'),
        schedule: [nursingPersona, "【役割】スケジュール入力を受け付けます。","【出力】[[ACTION:schedule,仮名,YYYY-MM-DD,HH:MM,タイトル]]"].join('\n'),
        manual: [nursingPersona, manualInstruction].join('\n'),
        client_new: [nursingPersona, "新規登録を行います。","【出力】[[ACTION:client_new,氏名,カナ,性別,年齢]]"].join('\n')
    };
    return prompts[mode] || prompts['analyze'];
}

// =======================================================
// 8. 音声機能
// =======================================================
function speakText(text, onEndCallback = null) {
    if (!$('#voice-read-toggle').prop('checked')) { if (onEndCallback) onEndCallback(); return; }
    let cleanText = text.replace(/<[^>]*>/g, '').replace(/\[\[.*?\]\]/g, '').replace(/[＊\*・■□▲△▼▽：｜｜]/g, ' ');
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ja-JP'; utterance.rate = 0.95; utterance.pitch = 0.85; 
    if (onEndCallback) utterance.onend = onEndCallback;
    window.speechSynthesis.speak(utterance);
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.onstart = () => { $('#voice-input-btn').css('background', '#dc3545').text('●'); };
    recognition.onresult = (e) => { 
        const transcript = e.results[0][0].transcript;
        if (isAwaitingConfirmation) { handleVoiceConfirmation(transcript); return; }
        if (handleVoiceCommand(transcript)) { return; }
        $('#user-input').val(transcript).trigger('input'); 
    };
    recognition.onend = () => { $('#voice-input-btn').css('background', '#007bff').text('🎤'); };
}

function handleVoiceCommand(text) {
    let targetValue = ""; let modeName = "";
    if (text.includes("相談") || text.includes("質問")) { targetValue = "analyze"; modeName = "AI相談"; }
    else if (text.includes("記録")) { targetValue = "record"; modeName = "ケア記録"; }
    else if (text.includes("予定") || text.includes("スケジュール")) { targetValue = "schedule"; modeName = "スケジュール"; }
    else if (text.includes("操作")) { targetValue = "manual"; modeName = "操作質問"; }
    if (targetValue) {
        $(`input[name="chat-mode"][value="${targetValue}"]`).prop('checked', true).trigger('change'); 
        speakText(`${modeName}モードにしました。`, () => { if (recognition) recognition.start(); });
        return true; 
    }
    return false; 
}

function handleVoiceConfirmation(transcript) {
    if (transcript.includes("はい") || transcript.includes("お願い")) {
        if ($('#record-add-form').is(':visible')) { $('#record-add-form').submit(); } else { speakText("処理を実行します。"); }
        return;
    }
    if ($('#record-add-form').is(':visible')) {
        const temp = extractValue(transcript, '体温'); 
        const bph = extractValue(transcript, '血圧', 0);
        const bpl = extractValue(transcript, '血圧', 1);
        const spo2 = extractValue(transcript, 'SPO2', 0) || extractValue(transcript, 'SpO2', 0) || extractValue(transcript, 'spo2', 0);
        const water = extractValue(transcript, '水分');

        let updateMsg = "";
        if (temp) { $('#record-temp').val(temp); updateMsg += `体温を${temp}度に。`; }
        if (bph) { $('#record-bp-high').val(bph); updateMsg += `血圧上を${bph}に。`; }
        if (bpl) { $('#record-bp-low').val(bpl); updateMsg += `血圧下を${bpl}に。`; }
        if (spo2) { $('#record-spo2').val(spo2); updateMsg += `SPO2を${spo2}に。`; }
        if (water) { $('#record-water').val(water); updateMsg += `水分を${water}に。`; }

        if (updateMsg) { speakText(updateMsg + "よろしいですか？", () => { if (recognition) recognition.start(); }); }
        else { isAwaitingConfirmation = false; speakText("保留しました。"); }
    }
}

function extractValue(str, key, index = 0) {
    const regex = new RegExp(`${key}([:：\\s]*)(\\d+\\.?\\d*)([\\/\\-ー〜~\\s]+)?(\\d+)?`);
    const match = str.match(regex);
    if (!match) return null;
    return index === 0 ? match[2] : (match[4] || null);
}

function forceReturnToChat() {
    if (window.isReturning) return; window.isReturning = true;
    speakText("保存しました。");
    sessionStorage.setItem('ai_is_returning_from_save', 'true');
    sessionStorage.removeItem('ai_chat_mode');
    
    sessionStorage.setItem('ai_chat_selected_mode', 'record');

    setTimeout(() => { 
        const url = new URL(window.location.href); url.searchParams.set('tab', 'chat'); window.location.href = url.toString();
    }, 1200);
}

function monitorNetworkRequests() {
    const originalOpen = XMLHttpRequest.prototype.open; const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(m, url) { 
        this._method = m; 
        this._url = url; 
        return originalOpen.apply(this, arguments); 
    };
    XMLHttpRequest.prototype.send = function() {
        this.addEventListener('load', function() {
            if (this._url && (this._url.includes('/web-api/ask-ai') || this._url.includes('/web-api/staff-chat/'))) {
                return;
            }
            if ((this._method === 'POST' || this._method === 'PUT') && this.status >= 200 && this.status < 300) {
                if (sessionStorage.getItem('ai_chat_mode') === 'active') forceReturnToChat();
            }
        });
        return originalSend.apply(this, arguments);
    };
}

// =======================================================
// 9. 職員チャット連携機能
// =======================================================

async function loadStaffList() {
    try {
        const res = await axios.get('/web-api/staff-chat/users');
        const users = res.data;
        const myName = typeof getCurrentUserName === 'function' ? getCurrentUserName() : '';
        
        let optionsHtml = '<option value="">🏢 全員に送信</option>';
        users.forEach(u => {
            if (u.name !== myName) {
                optionsHtml += `<option value="${u.id}">👤 ${u.name}</option>`;
            }
        });
        $('#staff-select').html(optionsHtml);
    } catch (e) {
        console.error("職員リスト取得失敗", e);
    }
}

async function loadChatHistory() {
    $('#chat-window').empty(); 
    
    try {
        const res = await axios.get('/web-api/staff-chat/messages');
        const allMessages = res.data;
        const myName = typeof getCurrentUserName === 'function' ? getCurrentUserName() : '';
        const selectedStaffId = $('#staff-select').val();

        const messages = allMessages.filter(msg => {
            if (!selectedStaffId) {
                return msg.receiver_id === null;
            } else {
                return String(msg.receiver_id) === String(selectedStaffId) || String(msg.sender_id) === String(selectedStaffId);
            }
        });

        $('#chat-window').empty();
        
        if (!messages || messages.length === 0) {
            updateAlertCounts(); 
            return; 
        }

        messages.forEach(msg => {
            const isMine = msg.sender.name === myName;
            
            let contentHtml = '';
            if (msg.image_path) {
                contentHtml += `<img src="/storage/${msg.image_path}" style="max-width: 100%; border-radius: 8px; margin-bottom: 5px;">`;
            }
            if (msg.message) {
                contentHtml += `<div>${msg.message.replace(/\n/g, '<br>')}</div>`;
            }

            if (isMine) {
                appendMessage('user', contentHtml);
            } else {
                const header = `<div style="font-size: 0.8em; font-weight: bold; margin-bottom: 2px;">👤 ${msg.sender.name}</div>`;
                appendMessage('staff', header + contentHtml);
            }
        });
        setTimeout(() => { $('#chat-window').scrollTop($('#chat-window')[0].scrollHeight); }, 100);

        updateAlertCounts();

    } catch (e) {
        $('#chat-window').empty();
    }
}

// ★メッセージ送信機能はそのまま再利用し、ボタンからも呼び出せるように公開(windowに紐付けないが、スコープ内なので使用可能)
async function sendStaffMessage(messageText, imageFile = null) {
    const receiverId = $('#staff-select').val(); 
    
    const formData = new FormData();
    if (receiverId) formData.append('receiver_id', receiverId);
    if (messageText) formData.append('message', messageText);
    if (imageFile) formData.append('image', imageFile);

    try {
        await axios.post('/web-api/staff-chat/send', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        let contentHtml = '';
        if (imageFile) {
            contentHtml += `<div style="color: #0056b3; font-size: 0.85em;">📷 ${imageFile.name}</div>`;
        }
        if (messageText) {
            contentHtml += `<div>${messageText.replace(/\n/g, '<br>')}</div>`;
        }
        
        appendMessage('user', contentHtml);
        $('#user-input').val('').css('height', 'auto');
        
    } catch (e) {
        let errorMsg = '送信に失敗しました。';
        if (e.response && e.response.data && e.response.data.message) {
            errorMsg += '\n【原因】 ' + e.response.data.message;
        }
        alert(errorMsg);
        console.error("送信エラー詳細:", e.response || e);
    }
}
// 定型文ボタン用に関数をグローバルに公開
window.sendStaffMessage = sendStaffMessage;


// =======================================================
// 10. メインイベント
// =======================================================
$(document).ready(function() {
    updateClientMap(); monitorNetworkRequests();
    
    if (sessionStorage.getItem('ai_is_returning_from_save') === 'true') {
        sessionStorage.removeItem('ai_is_returning_from_save');
        setTimeout(() => {
            restoreChatState(true);
            setTimeout(() => {
                appendMessage('ai', '記録の作成を完了しました。');
            }, 300);
        }, 100); 
    }

    updateAlertCounts();
    setInterval(updateAlertCounts, 30000);

    const $input = $('#user-input');

    axios.get('/web-api/manual-guide').then(res => { cachedManualGuide = res.data.content; }).catch(err => { cachedManualGuide = "FILE_NOT_FOUND"; });
    
    function updateModeUI(mode) {
        activeQuickAction = null;
        
        const placeholders = {
            analyze: "AIに何でも相談してください", record: "例：田中さんの今日の体温は36.5度でした...",
            schedule: "例：明日の10時に会議の予定を入れて...", manual: "システム操作を案内します",
            staff_chat: "職員にメッセージを送信" 
        };
        $input.attr('placeholder', placeholders[mode] || "");
        
        const $clientArea = $('#client-select').closest('div');
        
        if ($('#staff-select-container').length === 0) {
            $clientArea.after(`
                <div id="staff-select-container" style="display: none; margin-bottom: 10px;">
                    <select id="staff-select" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #ddd; background-color: #e8f4f8; color: #0056b3; font-weight: bold;">
                        <option value="">🏢 全員に送信</option>
                    </select>
                </div>
            `);
            loadStaffList();
        }

        if (mode === 'staff_chat') {
            $clientArea.slideUp(150);
            $('#staff-select-container').slideDown(150);
            loadChatHistory(); 
        } else if (mode === 'record') {
            $('#staff-select-container').slideUp(150);
            $clientArea.slideDown(150);
        } else {
            $clientArea.slideUp(150);
            $('#staff-select-container').slideUp(150);
        }

        if (mode === 'staff_chat') {
            $('#voice-input-btn').hide();
            $('#chat-attach-btn').show();
        } else {
            $('#voice-input-btn').show();
            $('#chat-attach-btn').hide();
        }

        const $qa = $('#chat-quick-actions');
        
        // ★追加: スタッフチャット用の定型文クイックアクションを生成
        if ($qa.find('.for-staff_chat').length === 0) {
            const quickReplies = ['了解です', 'ありがとう💓', '良かったです✨', '対応します', '👍', '🙇‍♀️', '👌', '🙇‍♂️'];
            let btnsHtml = '<div class="for-staff_chat" style="display:none; gap:6px; overflow-x:auto; padding: 4px 0; width:100%; white-space:nowrap;">';
            quickReplies.forEach(text => {
                btnsHtml += `<button type="button" onclick="window.sendStaffMessage('${text}')" style="background:#fff; border:1px solid #0056b3; color:#0056b3; border-radius:15px; padding:4px 12px; font-size:0.85em; cursor:pointer; font-weight:bold; box-shadow:0 1px 2px rgba(0,0,0,0.05); transition:background 0.2s;">${text}</button>`;
            });
            btnsHtml += '</div>';
            $qa.append(btnsHtml);
            
            $qa.find('.for-staff_chat button').hover(
                function() { $(this).css('background', '#e8f4f8'); },
                function() { $(this).css('background', '#fff'); }
            );
        }

        if (mode === 'record') {
            $qa.find('.for-schedule, .for-staff_chat').hide(); $qa.find('.for-record').show();
            $qa.css('display', 'flex').hide().fadeIn(250);
        } else if (mode === 'schedule') {
            $qa.find('.for-record, .for-staff_chat').hide(); $qa.find('.for-schedule').show();
            $qa.css('display', 'flex').hide().fadeIn(250);
        } else if (mode === 'staff_chat') {
            // ★追加: スタッフチャット時に定型文ボタンを表示
            $qa.find('.for-record, .for-schedule').hide(); $qa.find('.for-staff_chat').css({ 'display': 'flex', 'overflow-x': 'auto', 'width': '100%' });
            $qa.css('display', 'flex').hide().fadeIn(250);
        } else { 
            $qa.hide(); $('#vital-chart-container').hide(); 
        }
    }

    window.updateChatMode = function(mode) {
        $(`input[name="chat-mode"][value="${mode}"]`).prop('checked', true);
        if (!isRestoring) {
            $('#chat-window').empty();
            sessionStorage.removeItem('ai_chat_history_html');
        }
        updateModeUI(mode);
    };
    
    updateModeUI($('input[name="chat-mode"]:checked').val() || 'analyze');
    
    $input.on('input', function() { this.style.height = 'auto'; this.style.height = (this.scrollHeight) + 'px'; });
    $input.on('keydown', function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#chat-form').submit(); } });
    
    $('input[name="chat-mode"]').on('change', function() { 
        if (!isRestoring) {
            $('#chat-window').empty();
            sessionStorage.removeItem('ai_chat_history_html');
        }
        updateModeUI($(this).val()); 
        if (!isRestoring) saveChatState(); 
    });

    $('#client-select').on('change', function() { updateClientMap(); if (!isRestoring) saveChatState(); });
    $('#voice-input-btn').on('click', function() { if (recognition) recognition.start(); });
    
    $(document).on('click', '[data-tab], a[href^="#"], .menu-item, .nav-link', function() {
        if (!window.isAiChatAutoClick) {
            sessionStorage.removeItem('ai_chat_mode');
        }
    });

    $(document).on('change', '#staff-select', function() {
        loadChatHistory();
    });
    
    $('#chat-attach-btn').on('click', function() { $('#chat-image-input').click(); });
    $('#chat-image-input').on('change', function() {
        const file = this.files[0];
        if (file) {
            sendStaffMessage("", file); 
            $(this).val(''); 
        }
    });

    $(document).on('change', '#voice-read-toggle', function() {
        if ($(this).prop('checked')) { $('#toggle-bg').css('background-color', '#28a745'); $('#toggle-circle').css('transform', 'translateX(22px)'); }
        else { window.speechSynthesis.cancel(); $('#toggle-bg').css('background-color', '#ccc'); $('#toggle-circle').css('transform', 'translateX(0px)'); }
    });

    $('#chat-clear-btn').on('click', function() {
        $('#chat-window').empty(); sessionStorage.removeItem('ai_chat_history_html');
        appendMessage('ai', "チャットをクリアしました。");
    });

    $('#chat-form').on('submit', async function(e) {
        e.preventDefault(); const inputVal = $('#user-input').val(); if (!inputVal.trim()) return;
        
        sessionStorage.setItem('ai_chat_last_input', inputVal);
        
        const curToken = getCsrfToken(); if (curToken) axios.defaults.headers.common['X-CSRF-TOKEN'] = curToken;
        const selectedMode = $('input[name="chat-mode"]:checked').val() || 'analyze';
        
        if (selectedMode === 'staff_chat') {
            await sendStaffMessage(inputVal);
            return;
        }

        if (selectedMode === 'record' && !activeQuickAction) {
            appendMessage('user', inputVal); 
            $('#user-input').val('').css('height', 'auto');
            
            const isQuestion = /いつ|どこ|だれ|誰|何|どう|様子|教え|調べ|確認|過去|履歴|？|\?|インフルエンザ|病状|症状/.test(inputVal);
            const suggestedBtn = isQuestion ? '「🔍 記録を調べる」' : '「📝 記録を入力する」';
            
            const reply = `ご入力ありがとうございます。正確に処理を行うため、まずはチャット画面下部の${suggestedBtn}等のボタンをクリックしてから、再度内容をご送信ください。`;
            appendMessage('ai', reply);
            speakText(reply);
            return;
        }

        appendMessage('user', inputVal); $('#user-input').val('').css('height', 'auto'); 
        
        let loadingMsg = "確認中...";
        let promptMode = selectedMode;
        let targetClientId = $('#client-select').val(); 
        
        let finalQuestion = maskRealNames(inputVal);
        
        if (selectedMode === 'record') {
            if (activeQuickAction === 'search' || activeQuickAction === 'history' || activeQuickAction === 'vital') {
                loadingMsg = "記録を確認中...";
                promptMode = 'analyze'; 
                finalQuestion += "\n（※回答は丁寧な『です・ます』調で、単語のみでなく該当する記録内容を簡潔にまとめて報告してください。）";
            } else {
                loadingMsg = "ケア記録作成中...この後に表示される記録入力画面で内容を確認後に保存してください";
                promptMode = 'record'; 
            }
        } else if (selectedMode === 'analyze') {
            targetClientId = null;
        }
        
        appendMessage('ai', loadingMsg); saveChatState();
        
        try {
            const res = await axios.post('/web-api/ask-ai', { 
                clientId: targetClientId, 
                question: finalQuestion, 
                systemPrompt: getSystemPrompt(promptMode) 
            });
            
            if (promptMode !== 'record') {
                $('.ai-message').last().remove(); 
            }
            
            let answer = unmaskRealNames(res.data.answer);
            
            let displayMsg = answer.replace(/\[\[ACTION:open_pdf,(.*?)(?:,(.*?))?\]\]/g, function(match, fileName, title) {
                const pdfUrl = `/manuals/${fileName.trim()}`;
                const displayTitle = title ? title.trim() : '関連マニュアル';
                return `
                <div style="margin: 8px 0; padding: 10px; background: #fff; border: 1px solid #0056b3; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <div style="font-size: 0.9em; font-weight: bold; color: #333; margin-bottom: 8px; line-height: 1.3;">📄 ${displayTitle}</div>
                    <a href="${pdfUrl}" target="_blank" style="display: block; text-align: center; padding: 8px 0; background: #0056b3; color: #fff; text-decoration: none; border-radius: 4px; font-size: 0.9em; font-weight: bold;">マニュアルを開く</a>
                </div>`;
            });

            const actionMatch = displayMsg.match(/\[\[ACTION:(record|schedule|client_new).*?\]\]/);
            if (actionMatch) { 
                executeChatAction(actionMatch[0]); 
                displayMsg = displayMsg.replace(/\[\[ACTION:.*?\]\]/g, '');
            } 
            
            if (promptMode !== 'record' && displayMsg.trim() !== '') {
                appendMessage('ai', displayMsg); 
                speakText(displayMsg);
            }
            
        } catch (err) {
            $('.ai-message').last().remove(); appendMessage('ai', '通信エラーが発生しました。');
        }
    });
});

// =======================================================
// ★新規追加: アラートパネルから特定の職員とのチャットを開く
// =======================================================
window.openSpecificStaffChat = function(staffId) {
    if (typeof togglePanel === 'function') togglePanel('dash-staff-chat-panel');
    if (typeof window.updateChatMode === 'function') window.updateChatMode('staff_chat');
    
    setTimeout(() => {
        if (staffId) {
            $('#staff-select').val(staffId).trigger('change');
        } else {
            $('#staff-select').val('').trigger('change');
        }
        
        const chatTop = $('#chat-window').offset()?.top;
        if(chatTop) {
            $('html, body').animate({ scrollTop: chatTop - 100 }, 300);
        }
    }, 200);
};

// =======================================================
// ★新規追加: ケア記録タブを開き、選択中の利用者をセットする
// =======================================================
window.openRecordTabWithClient = function() {
    if (typeof showTab === 'function') showTab('record');
    
    const selectedClientId = $('#client-select').val();
    
    if (selectedClientId) {
        setTimeout(() => {
            $('#record-client-select').val(selectedClientId).trigger('change');
        }, 100);
    }
};
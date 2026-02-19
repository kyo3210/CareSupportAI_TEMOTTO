/**
 * ai-chat.js - AI音声入力＆ケア記録・スケジュール連携システム
 * 【Gold Master v4.8】
 * - 追加: 「操作質問」モードでのPDFマニュアル索引(manual_index.json)連携
 * - 維持: 過去記録の表示最適化、バイタル分析、スケジュール連携等の全機能
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
let cachedManualGuide = ""; // ★追加: マニュアル索引データを保持する変数

// =======================================================
// 2. 個人情報秘匿化ロジック (維持)
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
// 3. UI表示制御 & 状態保存・復元 (維持)
// =======================================================
function appendMessage(sender, message) {
    const chatWindow = $('#chat-window');
    const messageClass = sender === 'user' ? 'user-message' : 'ai-message';
    const formattedMessage = message.replace(/\n/g, '<br>');

    let html = '';
    if (sender === 'ai') {
        html = `<div class="${messageClass}" style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 15px;"> 
                <div style="background: #eef4ff; padding: 12px; border-radius: 12px; color: #0056b3; line-height: 1.6; border: 1px solid #d1e3f8; max-width: 95%;">
                    ${formattedMessage}
                </div>
            </div>`;
    } else {
        html = `<div class="${messageClass}" style="display: flex; justify-content: flex-end; align-items: center; gap: 10px; margin-bottom: 10px;">
                <div style="background: #f0f0f0; padding: 10px; border-radius: 10px; color: #333; max-width: 80%; text-align: right;">${formattedMessage}</div>
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
// 4. クイックアクション＆グラフ機能 (維持)
// =======================================================
window.triggerQuickAction = async function(action) {
    const clientId = $('#client-select').val();
    
    if (['input', 'history', 'search', 'vital'].includes(action) && !clientId) {
        alert("利用者を選択してください");
        return;
    }

    switch (action) {
        case 'input':
            $('#user-input').focus();
            speakText("記録内容を入力、または音声でお話しください。");
            break;

        case 'history':
            appendMessage('user', '過去記録');
            appendMessage('ai', '読み込んでいます...');
            try {
                const res = await axios.get(`/web-api/records/recent/${clientId}`);
                $('.ai-message').last().remove();
                if (res.data.length === 0) {
                    const msg = '過去の記録はありません。';
                    appendMessage('ai', msg);
                    speakText(msg);
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
                    appendMessage('ai', html);
                    speakText("記録を表示しました。");
                }
            } catch (e) {
                $('.ai-message').last().remove();
                appendMessage('ai', '取得に失敗しました。');
            }
            break;

        case 'search':
            const msg = '調べたいことを入力してください。';
            appendMessage('ai', msg);
            speakText("調べたいことを入力してください。");
            $('#user-input').attr('placeholder', '例：インフルエンザはいつ？').focus();
            break;

        case 'vital':
            appendMessage('user', 'バイタル分析');
            $('#vital-chart-container').slideDown();
            renderVitalChart(clientId);
            speakText("週間バイタルを表示します。");
            break;

        case 'schedule_today':
            appendMessage('user', '今日の予定');
            appendMessage('ai', '確認中...');
            try {
                const res = await axios.get('/web-api/schedules/today');
                $('.ai-message').last().remove();
                if (res.data.length === 0) {
                    const msg = "予定はありません。";
                    appendMessage('ai', msg);
                    speakText(msg);
                } else {
                    let html = `<div style="font-weight:bold; margin-bottom:5px; color:#555; border-left:3px solid #28a745; padding-left:6px; font-size:0.9em;">📅 本日</div>`;
                    res.data.forEach(s => {
                        const time = s.start.substring(11, 16);
                        const clientName = s.client ? `(${s.client.client_name})` : '';
                        html += `
                        <div style="background:#fff; border:1px solid #eee; border-radius:5px; margin-bottom:4px; padding:6px 10px; display:flex; align-items:center; gap:8px;">
                            <span style="font-weight:bold; color:#28a745; font-size:0.85em;">${time}</span>
                            <span style="font-size:0.85em; color:#333;">${s.title} <small style="color:#888;">${clientName}</small></span>
                        </div>`;
                    });
                    appendMessage('ai', html);
                    speakText(`予定は${res.data.length}件です。`);
                }
            } catch (e) {
                $('.ai-message').last().remove();
                appendMessage('ai', '失敗しました。');
            }
            break;

        case 'schedule_input':
            if ($('#schedule-modal').length > 0) {
                $('#schedule-modal').fadeIn(200);
                speakText("予定追加画面です。");
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
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    y: { type: 'linear', display: true, position: 'left', min: 34, max: 40, title: {display:false} },
                    y1: { type: 'linear', display: true, position: 'right', min: 40, max: 200, grid: { drawOnChartArea: false }, title: {display:false} }
                },
                plugins: { legend: { labels: { boxWidth: 10, font: { size: 10 } } } }
            }
        });
    } catch (e) {
        console.error(e);
        appendMessage('ai', 'エラーが発生しました。');
    }
}

// =======================================================
// 5. アクション実行エンジン
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
        
        // ★追加: PDFマニュアルを表示するアクション
        case 'open_pdf':
            const pdfFileName = args[0];
            const pdfUrl = `/manuals/${pdfFileName}`; // public/manuals/に配置
            const linkHtml = `
                <div style="margin-top:8px; padding:10px; background:#fff; border:1px dashed #007bff; border-radius:8px; display:inline-block;">
                    <div style="color:#007bff; font-weight:bold; font-size:0.9em; margin-bottom:5px;">📄 関連マニュアル</div>
                    <a href="${pdfUrl}" target="_blank" style="display:inline-flex; align-items:center; gap:5px; background:#007bff; color:#fff; text-decoration:none; padding:6px 12px; border-radius:4px; font-size:0.85em; font-weight:bold;">
                        <span>PDFを開く</span>
                    </a>
                </div>`;
            appendMessage('ai', linkHtml);
            break;

        default: appendMessage('ai', '完了しました。');
    }
}

async function handleRecordAction(args) {
    const [name, vitals, content] = args; saveChatState(); sessionStorage.setItem('ai_chat_mode', 'active');
    if (typeof showTab === 'function') showTab('record');
    else $('a[href="#record"], button[data-tab="record"]').trigger('click');
    $('#record-temp, #record-bp-high, #record-bp-low, #record-water').val('');
    $('#record-client-select').val($('#client-select').val()).trigger('change');
    $('#record-date').val(new Date().toISOString().split('T')[0]);
    $('#record-time').val(new Date().toTimeString().slice(0, 5));
    $('#record-content').val(unmaskRealNames(content));
    if (vitals && vitals !== "無し") {
        const temp = extractValue(vitals, '体温'); const bph = extractValue(vitals, '血圧', 0);
        if (temp) $('#record-temp').val(temp); if (bph) $('#record-bp-high').val(bph);
    }
    const confirmMsg = `記録を整えました。確認して保存してください。`;
    appendMessage('ai', confirmMsg); saveChatState(); 
    speakText(confirmMsg, () => { if (recognition) recognition.start(); }); isAwaitingConfirmation = true;
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
// 6. システムプロンプト設定 (Gemini 2.5-Flash用)
// =======================================================
function getSystemPrompt(mode) {
    const nursingPersona = "あなたは介護現場の主任です。丁寧な『です・ます』調で回答してください。";
    const prompts = {
        analyze: ["あなたは有能なAIアシスタントです。","挨拶不要、即答してください。"].join('\n'),
        record: [nursingPersona, "【役割】スタッフの報告を『介護記録』に整えます。","【出力】[[ACTION:record,仮名,体温;血圧;水分,整えた文章]]"].join('\n'),
        schedule: [nursingPersona, "【役割】スケジュール入力を受け付けます。","【出力】[[ACTION:schedule,仮名,YYYY-MM-DD,HH:MM,タイトル]]"].join('\n'),
        
        // ★修正: manual_index.json の内容をプロンプトに組み込む
        manual: [
            nursingPersona, 
            "あなたはシステムの操作方法を案内する担当です。",
            "以下の【PDF索引リスト】(JSON形式)を参照し、ユーザーの質問に最も関連するマニュアルを提案してください。",
            "",
            "【重要ルール】",
            "1. JSONの 'title' や 'keywords' から最適な項目を1つ選んでください。",
            "2. 回答の最後に必ず [[ACTION:open_pdf,ファイル名]] を出力してください。（ファイル名はJSON内の 'file_name' を正確に使用すること）",
            "3. 該当する項目がない場合は「管理者へ確認してください」と答え、アクションは出力しないでください。",
            "",
            "【PDF索引リスト】",
            cachedManualGuide || "（現在ガイドを取得中です。少々お待ちください）" 
        ].join('\n'),

        client_new: [nursingPersona, "新規登録を行います。","【出力】[[ACTION:client_new,氏名,カナ,性別,年齢]]"].join('\n')
    };
    return prompts[mode] || prompts['analyze'];
}

// =======================================================
// 7. 音声機能 (維持)
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
        const temp = extractValue(transcript, '体温'); const bph = extractValue(transcript, '血圧', 0);
        const bpl = extractValue(transcript, '血圧', 1); const water = extractValue(transcript, '水分');
        let updateMsg = "";
        if (temp) { $('#record-temp').val(temp); updateMsg += `体温を${temp}度に。`; }
        if (bph) { $('#record-bp-high').val(bph); updateMsg += `血圧上を${bph}に。`; }
        if (updateMsg) { speakText(updateMsg + "よろしいですか？", () => { if (recognition) recognition.start(); }); }
        else { isAwaitingConfirmation = false; speakText("保留しました。"); }
    }
}

function extractValue(str, key, index = 0) {
    const regex = new RegExp(`${key}([:：\\s]*)(\\d+\\.?\\d*)(\\/)?(\\d+)?`);
    const match = str.match(regex);
    if (!match) return null;
    return index === 0 ? match[2] : (match[4] || null);
}

// =======================================================
// 8. 通信監視と強制帰還 (維持)
// =======================================================
function forceReturnToChat() {
    if (window.isReturning) return; window.isReturning = true;
    speakText("保存しました。");
    sessionStorage.setItem('ai_is_returning_from_save', 'true');
    sessionStorage.removeItem('ai_chat_mode');
    setTimeout(() => { 
        const url = new URL(window.location.href); url.searchParams.set('tab', 'chat'); window.location.href = url.toString();
    }, 1200);
}

function monitorNetworkRequests() {
    const originalOpen = XMLHttpRequest.prototype.open; const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function(m) { this._method = m; return originalOpen.apply(this, arguments); };
    XMLHttpRequest.prototype.send = function() {
        this.addEventListener('load', function() {
            if ((this._method === 'POST' || this._method === 'PUT') && this.status >= 200 && this.status < 300) {
                if (sessionStorage.getItem('ai_chat_mode') === 'active') forceReturnToChat();
            }
        });
        return originalSend.apply(this, arguments);
    };
}

// =======================================================
// 9. メインイベント
// =======================================================
$(document).ready(function() {
    updateClientMap(); monitorNetworkRequests();
    $('#mode-analyze').prop('checked', true);
    const $input = $('#user-input');
    const placeholders = {
        analyze: "AIに何でも相談してください", record: "例：田中さんの今日の体温は36.5度でした...",
        schedule: "例：明日の10時に会議の予定を入れて...", manual: "システム操作を案内します"
    };

    /**
     * モード切替時のUI更新
     * ★修正: 操作質問モード時にAPIから manual_index.json を取得する
     */
    function updateModeUI(mode) {
        $input.attr('placeholder', placeholders[mode] || "");
        const $clientArea = $('#client-select').closest('div');
        if (mode === 'analyze' || mode === 'manual' || mode === 'schedule') $clientArea.slideUp(150);
        else $clientArea.slideDown(150);

        const $qa = $('#chat-quick-actions');
        if (mode === 'record') {
            $qa.find('.for-schedule').hide(); $qa.find('.for-record').show();
            $qa.css('display', 'flex').hide().fadeIn(250);
        } else if (mode === 'schedule') {
            $qa.find('.for-record').hide(); $qa.find('.for-schedule').show();
            $qa.css('display', 'flex').hide().fadeIn(250);
        } else { $qa.hide(); $('#vital-chart-container').hide(); }

        // ★追加: ガイド取得ロジック
        if (mode === 'manual' && !cachedManualGuide) {
            axios.get('/web-api/manual-guide')
                .then(res => {
                    cachedManualGuide = res.data.content;
                    console.log("Guide loaded."); // デバッグ用
                })
                .catch(err => {
                    console.error(err);
                    cachedManualGuide = "ガイド情報の取得に失敗しました。";
                });
        }
    }
    
    updateModeUI($('input[name="chat-mode"]:checked').val() || 'analyze');
    
    $input.on('input', function() { this.style.height = 'auto'; this.style.height = (this.scrollHeight) + 'px'; });
    $input.on('keydown', function(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#chat-form').submit(); } });
    $('input[name="chat-mode"]').on('change', function() { updateModeUI($(this).val()); if (!isRestoring) saveChatState(); });

    if (sessionStorage.getItem('ai_is_returning_from_save') === 'true') {
        restoreChatState(true);
        setTimeout(() => {
            $('#chat-window').find('.ai-message').last().remove();
            appendMessage('ai', "登録しました。続けて操作しますか？"); saveChatState();
        }, 150);
        sessionStorage.removeItem('ai_is_returning_from_save'); 
    }

    $('#client-select').on('change', function() { updateClientMap(); if (!isRestoring) saveChatState(); });
    $('#voice-input-btn').on('click', function() { if (recognition) recognition.start(); });
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
        const curToken = getCsrfToken(); if (curToken) axios.defaults.headers.common['X-CSRF-TOKEN'] = curToken;
        const selectedMode = $('input[name="chat-mode"]:checked').val() || 'analyze';
        appendMessage('user', inputVal); $('#user-input').val('').css('height', 'auto'); 
        appendMessage('ai', "確認中..."); saveChatState();
        try {
            const res = await axios.post('/web-api/ask-ai', { clientId: $('#client-select').val(), question: maskRealNames(inputVal), systemPrompt: getSystemPrompt(selectedMode) });
            $('.ai-message').last().remove(); let answer = unmaskRealNames(res.data.answer);
            const actionMatch = answer.match(/\[\[ACTION:.*?\]\]/);
            const displayMsg = answer.replace(/\[\[ACTION:.*?\]\]/g, '');
            if (actionMatch) { executeChatAction(actionMatch[0]); } else { appendMessage('ai', displayMsg); speakText(displayMsg); }
        } catch (err) {
            $('.ai-message').last().remove(); appendMessage('ai', '通信エラーが発生しました。');
        }
    });
});
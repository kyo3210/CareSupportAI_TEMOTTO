// =======================================================
// 1. 初期設定・プロンプト（ペルソナ）設定
// =======================================================
axios.defaults.withCredentials = true;
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (csrfToken) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
}

const SYSTEM_PROMPT = [
    "あなたは介護現場の第一線で活躍し、後輩の指導やご家族対応も担当する『ベテランの介護現場リーダー（主任クラス）』です。",
    "提示された期間指定とバイタル数値の変化、およびケア内容に基づき、現場を支える責任者の視点で簡潔に回答を行ってください。",
    "【回答の指針】",
    "1. 現場視点の要約：客観的なデータに基づき、現場で今何が起きているのか、実務的な視点で簡潔に要約してください。",
    "2. ご家族への配慮：ご家族への報告や説明時に配慮すべき点（安心感を与える伝え方や注意点など）は、質問者から求められた場合に限り、具体的に提案してください。",
    "3. 実務的な助言：具体的な対応方針や後輩スタッフへの指導、リスク回避のヒントは、質問者から明確に求められた場合にのみ回答してください。",
    "4. 整形ルール：回答はHTMLの<br>タグのみを使用して整形してください。読み上げの妨げになる「＊」「■」「・」などの記号は一切使用しないでください。",
    "5. 口調：現場を共に守る仲間として、信頼感と温かみがあり、かつプロとしての鋭さも兼ね備えた落ち着いた口調で回答してください。"
].join('\n');

function getCurrentUserName() {
    return document.querySelector('meta[name="user-name"]')?.getAttribute('content') || "担当スタッフ";
}

function appendMessage(sender, message) {
    const chatWindow = $('#chat-window');
    const messageClass = sender === 'user' ? 'user-message' : 'ai-message';
    let html = '';
    if (sender === 'ai') {
        html = `<div class="${messageClass}" style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 15px;"> 
                <img src="/images/AI.gif" alt="AI" style="height: 35px; width: 35px; border-radius: 50%;">
                <div style="background: #eef4ff; padding: 12px; border-radius: 12px; color: #0056b3; line-height: 1.6; border: 1px solid #d1e3f8;">${message}</div>
            </div>`;
    } else {
        html = `<div class="${messageClass}" style="display: flex; justify-content: flex-end; align-items: center; gap: 10px; margin-bottom: 10px;">
                <div style="background: #f0f0f0; padding: 10px; border-radius: 10px; color: #333;">${message}</div>
                <img src="/images/Q.png" alt="Q" style="height: 25px; width: 25px;">
            </div>`;
    }
    chatWindow.append(html);
    chatWindow.scrollTop(chatWindow[0].scrollHeight);
}

// =======================================================
// 2. 音声読み上げ・入力機能
// =======================================================
function speakText(text) {
    if (!$('#voice-read-toggle').prop('checked')) return;
    let cleanText = text.replace(/<[^>]*>/g, '').replace(/[＊\*・■□▲△▼▽：｜｜]/g, ' ');
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ja-JP'; utterance.rate = 0.95; utterance.pitch = 0.85; 
    window.speechSynthesis.speak(utterance);
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.onstart = () => { $('#voice-input-btn').css('background', '#dc3545').text('●'); };
    recognition.onresult = (e) => { $('#user-input').val(e.results[0][0].transcript); };
    recognition.onend = () => { $('#voice-input-btn').css('background', '#007bff').text('🎤'); };
}

// =======================================================
// 3. バイタル分析グラフ機能
// =======================================================
let vitalChart = null;
function clearVitalChart() {
    if (vitalChart) { vitalChart.destroy(); vitalChart = null; }
    const canvas = document.getElementById('vitalChart');
    if (canvas) { canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height); }
}

function updateVitalChart(vitalData) {
    const canvas = document.getElementById('vitalChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (vitalChart) { vitalChart.destroy(); }
    vitalData.sort((a, b) => new Date(a.date) - new Date(b.date));
    vitalChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: vitalData.map(d => d.date),
            datasets: [
                { label: '体温(℃)', data: vitalData.map(d => d.temp), borderColor: '#ff6384', backgroundColor: 'rgba(255, 99, 132, 0.2)', yAxisID: 'y-temp', tension: 0.3 },
                { label: '血圧(上)', data: vitalData.map(d => d.bp_high), borderColor: '#36a2eb', backgroundColor: 'rgba(54, 162, 235, 0.2)', yAxisID: 'y-bp', tension: 0.3 },
                { label: '血圧(下)', data: vitalData.map(d => d.bp_low), borderColor: '#4bc0c0', backgroundColor: 'rgba(75, 192, 192, 0.2)', yAxisID: 'y-bp', tension: 0.3 }
            ]
        },
        options: { responsive: true, scales: { 'y-temp': { min: 34, max: 40 }, 'y-bp': { min: 40, max: 200 } } }
    });
}

// =======================================================
// 4. データ取得・表示・ダッシュボード
// =======================================================
async function fetchClients() {
    try {
        const response = await axios.get('/web-api/clients');
        ['#client-select', '#record-client-select', '#sch-client-select', '#edit-sch-client-select'].forEach(id => {
            const $el = $(id); $el.empty().append('<option value="">利用者を選択してください</option>');
            response.data.forEach(c => $el.append(`<option value="${c.id}">${c.id}: ${c.client_name}</option>`));
        });
    } catch (e) { console.error(e); }
}

async function fetchOfficeInfo() {
    try {
        const response = await axios.get('/web-api/offices');
        if (response.data.length > 0) {
            const office = response.data[0];
            $('#prov-id').val(office.id); $('#prov-name').val(office.name); $('#prov-postcode').val(office.postcode); $('#prov-tel').val(office.tel); $('#prov-address').val(office.address);
            $('#target-office-id').val(office.id);
        }
    } catch (e) { console.error("事業所情報取得エラー:", e); }
}

async function fetchStaffList() {
    try {
        const res = await axios.get('/web-api/staff');
        const $list = $('#staff-list'); 
        if (res.data.length === 0) {
            $list.html('<p style="padding: 10px; color: #999; font-size: 0.9em;">登録された職員はいません</p>');
            return;
        }
        const html = res.data.map(s => `
            <div style="padding: 8px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: bold; color: #444;">${s.name}</span>
                <span style="font-size: 0.85em; color: #777;">${s.email}</span>
            </div>`).join('');
        $list.html(html);
    } catch (e) { console.error(e); }
}

async function renderModalClientList() {
    const res = await axios.get('/web-api/clients');
    let html = res.data.map(c => `<tr><td>${c.id}</td><td>${c.client_name}</td><td>${c.address}</td><td style="text-align:center;"><button type="button" class="select-client-btn" data-client='${JSON.stringify(c)}' style="background:#007bff; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">選択</button></td></tr>`).join('');
    $('#modal-client-table-body').html(html);
}

async function renderRecordList() {
    try {
        const [res, clientRes, staffRes] = await Promise.all([
            axios.get('/web-api/all-records'),
            axios.get('/web-api/clients'),
            axios.get('/web-api/staff')
        ]);
        const clientMap = {};
        clientRes.data.forEach(c => clientMap[c.id] = c.client_name);

        const $staffSelect = $('#filter-staff-select');
        $staffSelect.find('option:not(:first)').remove();
        staffRes.data.forEach(s => $staffSelect.append(`<option value="${s.name}">${s.name}</option>`));

        let html = res.data.map(r => {
            const clientName = clientMap[r.client_id] || "不明";
            return `<tr>
                <td style="font-size:0.85em; border:1px solid #ddd; padding:8px;">${r.recorded_at.substring(0, 16)}</td>
                <td style="border:1px solid #ddd; padding:8px;">${r.client_id}: ${clientName}</td>
                <td style="border:1px solid #ddd; padding:8px;">${r.recorded_by || '-'}</td>
                <td style="text-align:center; border:1px solid #ddd; padding:8px;">${r.body_temp || '-'}</td>
                <td style="text-align:center; border:1px solid #ddd; padding:8px;">${r.blood_pressure_high || '-'}</td>
                <td style="text-align:center; border:1px solid #ddd; padding:8px;">${r.water_intake || '-'}</td>
                <td style="max-width:350px; border:1px solid #ddd; padding:8px; font-size:0.85em; line-height:1.4; word-break:break-all;">${r.content}</td>
                <td style="text-align:center; border:1px solid #ddd; padding:8px;">
                    <button type="button" class="select-record-btn" data-record='${JSON.stringify(r)}' style="background:#6c757d; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">編集</button>
                </td>
            </tr>`;
        }).join('');
        $('#modal-record-table-body').html(html);
    } catch (e) { console.error("過去記録取得エラー:", e); }
}

async function updateDashboardSchedule() {
    try {
        const res = await axios.get('/web-api/schedules');
        const today = new Date().toISOString().split('T')[0];
        const todayEvents = res.data.filter(event => event.start.startsWith(today));
        const $list = $('#dashboard-schedule-list');
        if (todayEvents.length === 0) {
            $list.html('<p style="color: #999; padding: 10px;">本日の予定はありません。</p>');
            return;
        }
        const html = todayEvents.sort((a,b) => a.start.localeCompare(b.start)).map(ev => {
            const time = ev.start.substring(11, 16);
            return `<div style="padding: 10px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 10px;">
                <span style="width: 4px; height: 18px; background: ${ev.backgroundColor}; display: inline-block; border-radius: 2px;"></span>
                <span style="font-weight: bold; color: #333;">${time}</span>
                <span style="color: #555;">${ev.title}</span>
            </div>`;
        }).join('');
        $list.html(html);
    } catch (e) { $('#dashboard-schedule-list').html('<p style="color: #dc3545; padding: 10px;">読み込みに失敗しました。</p>'); }
}

function saveStartPageSetting(value) { localStorage.setItem('care_ai_start_page', value); }
function applyStartPage() {
    const startPage = localStorage.getItem('care_ai_start_page') || 'dashboard';
    if ($('#start-page-setting').length) $('#start-page-setting').val(startPage);
    if (typeof showTab === 'function') showTab(startPage);
}

// =======================================================
// 6. メインロジック（イベントハンドラ統合）
// =======================================================
$(document).ready(function() {
    fetchClients(); fetchOfficeInfo(); fetchStaffList();
    applyStartPage(); updateDashboardSchedule();

    // --- ① 音声・読み上げスイッチ ---
    $('#voice-input-btn').on('click', function() { if (recognition) recognition.start(); });
    $(document).on('change', '#voice-read-toggle', function() {
        const isChecked = $(this).prop('checked');
        const $bg = $('#toggle-bg'); const $circle = $('#toggle-circle');
        if (isChecked) {
            $bg.css('background-color', '#28a745');
            $circle.css('transform', 'translateX(22px)');
        } else {
            window.speechSynthesis.cancel();
            $bg.css('background-color', '#ccc');
            $circle.css('transform', 'translateX(0px)');
        }
    });

    // --- ② バイタル分析ボタン（HTML構造に合わせた実装） ---
    // 直近1週間・今月ボタン（クラス名 quick-date-btn で対応）
    $('.quick-date-btn').on('click', function() {
        const range = $(this).data('range');
        const end = new Date();
        const start = new Date();
        if (range === 'week') {
            start.setDate(end.getDate() - 7);
        } else if (range === 'month') {
            start.setDate(1); // 今月1日
        }
        $('#search-start-date').val(start.toISOString().split('T')[0]);
        $('#search-end-date').val(end.toISOString().split('T')[0]);
        $('#update-graph-btn').trigger('click');
    });

    // 表示ボタン
    $('#update-graph-btn').on('click', async function() {
        const cid = $('#client-select').val();
        if (!cid) return alert("利用者を選択してください");
        try {
            const res = await axios.post('/web-api/ask-ai', { clientId: cid, question: '', startDate: $('#search-start-date').val(), endDate: $('#search-end-date').val(), systemPrompt: '分析用データ取得' });
            if (res.data.vitalData) updateVitalChart(res.data.vitalData);
        } catch (e) { alert("データ取得エラー"); }
    });

    // リセットボタン（chat-clear-btn と chart-clear-btn の両方に対応）
    $('#chat-clear-btn, #chart-clear-btn').on('click', function() {
        if (confirm('表示をリセットしますか？')) {
            if (this.id === 'chat-clear-btn') $('#chat-window').empty();
            $('#search-start-date, #search-end-date').val('');
            clearVitalChart();
        }
    });

    // --- ③ AIチャット送信 ---
    $('#chat-form').on('submit', async function(e) {
        e.preventDefault();
        const q = $('#user-input').val(); if (!q.trim()) return;
        const cid = $('#client-select').val();
        appendMessage('user', q); $('#user-input').val(''); appendMessage('ai', '分析中...');
        try {
            const res = await axios.post('/web-api/ask-ai', { clientId: cid, question: q, startDate: $('#search-start-date').val(), endDate: $('#search-end-date').val(), systemPrompt: SYSTEM_PROMPT });
            $('.ai-message').last().remove(); appendMessage('ai', res.data.answer); speakText(res.data.answer);
            if(cid && res.data.vitalData) updateVitalChart(res.data.vitalData);
        } catch (e) { $('.ai-message').last().remove(); appendMessage('ai', '通信エラー'); }
    });

    // --- ④ カレンダー設定 ---
    var calendarEl = document.getElementById('calendar');
    var calendar;
    if (calendarEl) {
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'timeGridDay',
            headerToolbar: { left: 'prev,next today', center: 'title', right: 'timeGridDay,dayGridMonth' },
            locale: 'ja', allDaySlot: false, editable: true, nowIndicator: true,
            events: '/web-api/schedules', 
            eventClick: function(info) {
                const ev = info.event; const props = ev.extendedProps;
                $('#edit-sch-id').val(ev.id); $('#edit-sch-content').val(props.description);
                $('#edit-sch-start').val(ev.startStr.substring(0, 16));
                $('#edit-sch-end').val(ev.endStr ? ev.endStr.substring(0, 16) : '');
                if (props.type === 'care' && !props.is_recorded) {
                    $('#go-to-record-btn').show().off('click').on('click', function() {
                        $('#edit-schedule-modal').hide(); showTab('record');
                        $('#record-client-select').val(props.client_id);
                        $('#record-date').val(ev.startStr.substring(0, 10));
                        $('#record-time').val(ev.startStr.substring(11, 16));
                        $('#record-schedule-id').val(ev.id);
                    });
                } else { $('#go-to-record-btn').hide(); }
                $('#edit-schedule-modal').fadeIn(200);
            },
            eventDrop: async function(info) { await updateEventTime(info.event); },
            eventResize: async function(info) { await updateEventTime(info.event); }
        });
        calendar.render();
    }

    // --- ⑤ 登録・管理ロジック ---
    $('#record-add-form').on('submit', async function(e) {
        e.preventDefault();
        const data = {
            schedule_id: $('#record-schedule-id').val(),
            client_id: $('#record-client-select').val(),
            recorded_at: $('#record-date').val() + ' ' + $('#record-time').val(),
            content: $('#record-content').val(),
            body_temp: $('#record-temp').val(),
            blood_pressure_high: $('#record-bp-high').val(),
            blood_pressure_low: $('#record-bp-low').val(),
            water_intake: $('#record-water').val(),
            recorded_by: getCurrentUserName()
        };
        try {
            const res = await axios.post('/web-api/records', data);
            if (res.data.status === 'success') {
                alert("記録が完了しました。");
                $('#record-add-form')[0].reset();
                if (calendar) calendar.refetchEvents();
                updateDashboardSchedule();
            }
        } catch (e) { alert("保存失敗"); }
    });

    $('#staff-register-form').on('submit', async function(e) {
        e.preventDefault();
        const officeId = $('#target-office-id').val();
        const data = { name: $('#staff-name').val(), email: $('#staff-email').val(), password: $('#staff-password').val(), office_id: officeId };
        try {
            const res = await axios.post('/web-api/staff', data);
            if (res.data.status === 'success') { alert("登録完了"); fetchStaffList(); }
        } catch (e) { alert("登録失敗"); }
    });

    $('#client-register-form').on('submit', async function(e) {
        e.preventDefault();
        const data = { id: $('#reg-client-id').val(), client_name: $('#reg-client-name').val(), postcode: $('#reg-zipcode').val(), address: $('#reg-address').val() };
        try { await axios.post('/web-api/clients', data); alert("保存完了"); fetchClients(); } catch (e) { alert("保存失敗"); }
    });

    $(document).on('input change', '.record-filter', function() {
        const start = $('#filter-date-start').val();
        const end = $('#filter-date-end').val();
        const filters = $('.record-filter').map(function() { return { col: $(this).data('col'), val: $(this).val().toLowerCase() }; }).get();
        $('#modal-record-table-body tr').each(function() {
            const row = $(this); const tds = row.find('td'); const rDate = tds.eq(0).text().substring(0, 10);
            let show = (start && rDate < start) || (end && rDate > end) ? false : true;
            filters.forEach(f => { if (f.val && tds.eq(f.col).text().toLowerCase().indexOf(f.val) === -1) show = false; });
            show ? row.show() : row.hide();
        });
    });

    $('#search-zipcode').on('click', async function() {
        const zip = $('#reg-zipcode').val().replace(/[^0-9]/g, '');
        try {
            const res = await axios.get(`/web-api/zipcode/${zip}`);
            if (res.data.results) $('#reg-address').val(res.data.results[0].address1 + res.data.results[0].address2 + res.data.results[0].address3);
        } catch (e) { alert("検索失敗"); }
    });

    $('#add-schedule-btn').on('click', () => $('#schedule-modal').fadeIn(200));
    $('#open-record-modal').on('click', () => { renderRecordList(); $('#record-modal').fadeIn(200); });
    $('#close-schedule-modal, .close-edit-modal').on('click', () => $('.modal').fadeOut(200));

    $(document).on('click', '.select-client-btn', function() { 
        const c = $(this).data('client'); $('#reg-client-id').val(c.id).attr('readonly', true); $('#reg-client-name').val(c.client_name); $('#reg-zipcode').val(c.postcode); $('#reg-address').val(c.address); $('#client-modal').fadeOut(200); 
    });
});

async function updateEventTime(event) {
    try {
        await axios.patch(`/web-api/schedules/${event.id}`, { 
            start: event.startStr.replace('T', ' ').substring(0, 16) + ':00', 
            end: event.endStr ? event.endStr.replace('T', ' ').substring(0, 16) + ':00' : null 
        });
        updateDashboardSchedule();
    } catch (e) { alert('更新失敗'); }
}
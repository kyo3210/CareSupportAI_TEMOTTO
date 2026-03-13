// =======================================================
// スケジュール・ケア記録連携ロジック
// =======================================================

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

async function updateEventTime(event) {
    try {
        await axios.patch(`/web-api/schedules/${event.id}`, { 
            start: event.startStr.replace('T', ' ').substring(0, 16) + ':00', 
            end: event.endStr ? event.endStr.replace('T', ' ').substring(0, 16) + ':00' : null 
        });
        updateDashboardSchedule();
        if (typeof fetchUnfinishedTasks === 'function') fetchUnfinishedTasks();
    } catch (e) { alert('更新失敗'); }
}

/**
 * 日付オブジェクトを input(datetime-local) 用の文字列に変換するヘルパー
 */
function formatDatetimeLocal(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d}T${hh}:${mm}`;
}

$(document).ready(function() {
    updateDashboardSchedule();
    
    var calendarEl = document.getElementById('calendar');
    var calendar;
    if (calendarEl) {
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'timeGridDay',
            headerToolbar: { left: 'prev,next today', center: 'title', right: 'timeGridDay,dayGridMonth' },
            locale: 'ja', allDaySlot: true, editable: true, nowIndicator: true,
            selectable: true, 
            
            eventSources: [
                {
                    url: '/web-api/schedules',
                    editable: true
                },
                function(info, successCallback, failureCallback) {
                    fetch('https://holidays-jp.github.io/api/v1/date.json')
                    .then(response => response.json())
                    .then(data => {
                        const events = [];
                        for (const [date, name] of Object.entries(data)) {
                            events.push({
                                title: name,
                                start: date,
                                display: 'background', 
                                color: '#fff5f5',      
                                classNames: ['holiday-event'],
                                allDay: true
                            });
                        }
                        successCallback(events);
                    })
                    .catch(err => {
                        console.error("祝日取得エラー", err);
                        successCallback([]);
                    });
                }
            ],

            // ★修正：重複の原因だった eventDidMount のブロックを削除しました

            select: function(info) {
                if (info.allDay && info.view.type !== 'dayGridMonth') return;

                const startStr = formatDatetimeLocal(info.start);
                const endStr = formatDatetimeLocal(info.end);
                $('#sch-start').val(startStr);
                $('#sch-end').val(endStr);
                $('#schedule-modal').fadeIn(200);
            },

            eventClick: function(info) {
                const ev = info.event; 
                
                if (ev.classNames.includes('holiday-event')) {
                    return;
                }

                const props = ev.extendedProps;
                $('#edit-sch-id').val(ev.id); $('#edit-sch-content').val(props.description);
                $('#edit-sch-start').val(ev.startStr.substring(0, 16));
                $('#edit-sch-end').val(ev.endStr ? ev.endStr.substring(0, 16) : '');
                $('#edit-sch-is-task').prop('checked', props.is_task);

                if (props.type === 'care' && !props.is_recorded) {
                    $('#go-to-record-btn').show().off('click').on('click', function() {
                        $('#edit-schedule-modal').hide(); 
                        if (typeof showTab === 'function') showTab('record');
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
        window.calendar = calendar; 
    }

    // 「予定追加」ボタンを押した時の初期値セット
    $('#add-schedule-btn').on('click', () => {
        const now = new Date();
        const later = new Date(now.getTime() + (60 * 60 * 1000)); // 1時間後
        $('#sch-start').val(formatDatetimeLocal(now));
        $('#sch-end').val(formatDatetimeLocal(later));
        $('#schedule-modal').fadeIn(200);
    });

    // 開始日時が変更されたら終了日時を1時間後に連動させる
    $('#sch-start').on('change', function() {
        const startVal = $(this).val();
        if (!startVal) return;
        const startDate = new Date(startVal);
        const endDate = new Date(startDate.getTime() + (60 * 60 * 1000));
        $('#sch-end').val(formatDatetimeLocal(endDate));
    });

    // --- 予定追加ロジック ---
    $('#schedule-form').off('submit').on('submit', async function(e) {
        e.preventDefault();
        const selectedType = $('#schedule-type').val();
        
        const data = {
            type: selectedType,
            backgroundColor: selectedType === 'care' ? '#28a745' : '#007bff',
            client_id: selectedType === 'care' ? $('#sch-client-select').val() : null,
            title: selectedType === 'work' ? $('#sch-title').val() : ($('#sch-client-select option:selected').text().split(': ')[1] || '利用者ケア'),
            description: selectedType === 'care' ? $('#sch-content').val() : $('#sch-title').val(),
            start: $('#sch-start').val().replace('T', ' ') + ':00',
            end: $('#sch-end').val().replace('T', ' ') + ':00',
            is_task: $('#sch-is-task').prop('checked')
        };

        if (!data.start || !data.end) return alert("開始時間と終了時間を入力してください");
        
        try {
            const res = await axios.post('/web-api/schedules', data);
            if (res.data.status === 'success') {
                alert("予定を登録しました。");
                $('#schedule-modal').fadeOut(200);
                $('#schedule-form')[0].reset();
                $('#sch-is-task').prop('checked', true);
                if (calendar) calendar.refetchEvents();
                updateDashboardSchedule();
                if (typeof fetchUnfinishedTasks === 'function') fetchUnfinishedTasks();
            }
        } catch (e) {
            const msg = e.response?.data?.message || "内容を確認してください";
            alert("入力エラー: " + msg);
        }
    });

    // --- 予定更新・削除 ---
    $('#edit-schedule-form').on('submit', async function(e) {
        e.preventDefault();
        const id = $('#edit-sch-id').val();
        const data = {
            description: $('#edit-sch-content').val(),
            start: $('#edit-sch-start').val().replace('T', ' ') + ':00',
            end: $('#edit-sch-end').val().replace('T', ' ') + ':00',
            is_task: $('#edit-sch-is-task').prop('checked')
        };
        try {
            await axios.patch(`/web-api/schedules/${id}`, data);
            alert("予定を更新しました。");
            $('#edit-schedule-modal').fadeOut(200);
            if (calendar) calendar.refetchEvents();
            updateDashboardSchedule();
            if (typeof fetchUnfinishedTasks === 'function') fetchUnfinishedTasks();
        } catch (e) { 
            const msg = e.response?.data?.message || "更新に失敗しました";
            alert("エラー: " + msg);
        }
    });

    $('#delete-schedule-btn').on('click', async function() {
        if (!confirm('予定を削除しますか？')) return;
        const id = $('#edit-sch-id').val();
        try {
            await axios.delete(`/web-api/schedules/${id}`);
            $('#edit-schedule-modal').fadeOut(200);
            if (calendar) calendar.refetchEvents();
            updateDashboardSchedule();
            if (typeof fetchUnfinishedTasks === 'function') fetchUnfinishedTasks();
        } catch (e) { alert("削除失敗"); }
    });

    $('#schedule-type').on('change', function() {
        if ($(this).val() === 'care') {
            $('#care-fields').show(); $('#work-fields').hide();
        } else {
            $('#care-fields').hide(); $('#work-fields').show();
        }
    });

    // --- ケア記録保存 ---
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
            spo2: $('#record-spo2').val(),
            recorded_by: (typeof getCurrentUserName === 'function') ? getCurrentUserName() : "担当スタッフ"
        };
        const editId = $('#edit-record-id').val();
        try {
            let res;
            if (editId) {
                res = await axios.put(`/web-api/records/${editId}`, data);
                alert("記録を更新しました。");
            } else {
                res = await axios.post('/web-api/records', data);
                alert("記録を保存しました。");
            }
            if (res.data.status === 'success') {
                $('#record-add-form')[0].reset();
                $('#edit-record-id').val('');
                $('#record-submit-btn').text('記録を保存').css('background', '#007bff').css('color', 'white');
                $('#record-reset-btn').hide();
                $('#record-delete-btn').hide();
                if (calendar) calendar.refetchEvents();
                updateDashboardSchedule();
                if (typeof updateVitalAlerts === 'function') updateVitalAlerts();
                if (typeof fetchUnfinishedTasks === 'function') fetchUnfinishedTasks();
            }
        } catch (e) { 
            console.error(e);
            alert("保存に失敗しました。"); 
        }
    });

    // --- 削除処理 ---
    $('#record-delete-btn').on('click', async function() {
        const id = $('#edit-record-id').val();
        if (!id) return;
        if (!confirm('本当にこの記録を削除しますか？\n※削除すると元に戻せません。')) return;
        try {
            const res = await axios.delete(`/web-api/records/${id}`);
            if (res.data.status === 'success') {
                alert('記録を削除しました。');
                $('#record-add-form')[0].reset();
                $('#edit-record-id').val('');
                $('#record-submit-btn').text('記録を保存').css('background', '#007bff').css('color', 'white');
                $('#record-reset-btn').hide();
                $('#record-delete-btn').hide();
                if (typeof calendar !== 'undefined') calendar.refetchEvents();
                updateDashboardSchedule();
                if (typeof updateVitalAlerts === 'function') updateVitalAlerts();
                if (typeof fetchUnfinishedTasks === 'function') fetchUnfinishedTasks();
            }
        } catch (e) {
            alert('削除に失敗しました。');
            console.error(e);
        }
    });

    // ==========================================
    // 過去記録・編集モーダルの制御
    // ==========================================
    $('#open-record-modal').on('click', async function() {
        $('#record-history-modal').fadeIn(200);
        $('#filter-date-start').val('');
        $('#filter-date-end').val('');
        $('#filter-keyword').val('');
        await loadRecordHistory();
    });

    $('.close-modal, .modal-overlay').on('click', function() {
        $(this).closest('.modal').fadeOut(200);
    });

    $('#clear-filter-btn').on('click', async function() {
        $('#filter-date-start').val('');
        $('#filter-date-end').val('');
        $('#filter-keyword').val('');
        await loadRecordHistory();
    });

    window.loadRecordHistory = async function() {
        const $list = $('#record-history-list');
        $list.html('<tr><td colspan="9" style="text-align:center;">読み込み中...</td></tr>');
        try {
            const start = $('#filter-date-start').val();
            const end = $('#filter-date-end').val();
            const keyword = $('#filter-keyword').val();
            const res = await axios.get('/web-api/all-records', {
                params: { start: start, end: end, keyword: keyword }
            });
            const records = res.data;
            $list.empty();
            if (records.length === 0) {
                $list.html('<tr><td colspan="9" style="text-align:center;">記録がありません</td></tr>');
                return;
            }
            records.forEach(rec => {
                const dateObj = new Date(rec.recorded_at);
                const dateStr = dateObj.toLocaleDateString('ja-JP') + ' ' + dateObj.toLocaleTimeString('ja-JP', {hour: '2-digit', minute:'2-digit'});
                const temp = rec.body_temp ? rec.body_temp + '℃' : '-';
                let bpDisplay = '-';
                if (rec.blood_pressure_high) {
                    bpDisplay = rec.blood_pressure_high;
                    if (rec.blood_pressure_low) bpDisplay += ' / ' + rec.blood_pressure_low;
                }
                const water = rec.water_intake ? rec.water_intake + 'ml' : '-';
                const spo2 = rec.spo2 ? rec.spo2 + '%' : '-';
                const clientName = (rec.client && rec.client.client_name) ? rec.client.client_name : '不明';
                const recordJson = JSON.stringify(rec).replace(/"/g, '&quot;');
                const row = `
                    <tr>
                        <td data-label="日時" style="font-size:0.9em;">${dateStr}</td>
                        <td data-label="利用者">${clientName}</td>
                        <td data-label="記録者">${rec.recorded_by}</td>
                        <td data-label="体温">${temp}</td>
                        <td data-label="血圧(上/下)">${bpDisplay}</td>
                        <td data-label="水分">${water}</td>
                        <td data-label="SPO2">${spo2}</td>
                        <td data-label="内容" style="font-size:0.9em; max-width:200px;">${rec.content}</td>
                        <td data-label="操作">
                            <button type="button" class="edit-record-btn" 
                                style="background:#007bff; color:white; border:none; padding:8px 16px; border-radius:4px; cursor:pointer; width:100%;"
                                data-record="${recordJson}">
                                編集
                            </button>
                        </td>
                    </tr>
                `;
                $list.append(row);
            });
        } catch (e) {
            console.error(e);
            $list.html('<tr><td colspan="9" style="text-align:center; color:red;">読み込みエラー</td></tr>');
        }
    };

    $(document).on('click', '.edit-record-btn', function() {
        const rec = $(this).data('record');
        $('#record-client-select').val(rec.client_id);
        const dateTime = rec.recorded_at.split(' ');
        $('#record-date').val(dateTime[0]);
        $('#record-time').val(dateTime[1].substring(0, 5));
        $('#record-temp').val(rec.body_temp);
        $('#record-bp-high').val(rec.blood_pressure_high);
        $('#record-bp-low').val(rec.blood_pressure_low);
        $('#record-water').val(rec.water_intake);
        $('#record-spo2').val(rec.spo2); 
        $('#record-content').val(rec.content);
        $('#edit-record-id').val(rec.id); 
        $('#record-submit-btn').text('記録を更新').css('background-color', '#ffc107').css('color', '#000');
        $('#record-delete-btn').show();
        $('#record-reset-btn').show().off('click').on('click', function() {
            $('#record-add-form')[0].reset();
            $('#edit-record-id').val('');
            $('#record-submit-btn').text('記録を保存').css('background', '#007bff').css('color', 'white');
            $('#record-delete-btn').hide(); 
            $(this).hide();
        });
        $('#record-history-modal').fadeOut(200);
        $('html, body').animate({ scrollTop: $("#record-register-section").offset().top - 100 }, 300);
    });
});
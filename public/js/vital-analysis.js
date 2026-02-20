/**
 * vital-analysis.js - バイタル分析グラフ＆アラート管理
 * 【修正】AIを経由せず、データベースから直接正確な記録を取得してグラフを描画するように改修
 */

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
    
    // グラフ描画
    vitalChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: vitalData.map(d => d.date),
            datasets: [
                { label: '体温(℃)', data: vitalData.map(d => d.body_temp), borderColor: '#ff6384', backgroundColor: '#ff6384', yAxisID: 'y-temp', tension: 0.1 },
                { label: '血圧(上)', data: vitalData.map(d => d.blood_pressure_high), borderColor: '#36a2eb', backgroundColor: '#36a2eb', yAxisID: 'y-bp', tension: 0.1 },
                { label: '血圧(下)', data: vitalData.map(d => d.blood_pressure_low), borderColor: '#9966ff', backgroundColor: '#9966ff', yAxisID: 'y-bp', tension: 0.1 }
            ]
        },
        options: { 
            responsive: true, 
            interaction: { mode: 'index', intersect: false },
            scales: { 
                'y-temp': { type: 'linear', position: 'left', min: 34, max: 40 }, 
                'y-bp': { type: 'linear', position: 'right', min: 40, max: 200, grid: { drawOnChartArea: false } } 
            } 
        }
    });
}

/**
 * ▼ 要注意バイタル（8時間以内）の自動更新ロジック ▼
 */
function updateVitalAlerts() {
    if ($('#list-vital-alert').length === 0) return;

    axios.get('/web-api/dashboard/vital-alerts')
        .then(response => {
            const records = response.data;
            const count = records.length;
            
            $('#count-vital-alert').text(count);
            const $list = $('#list-vital-alert');
            $list.empty(); 

            if (count === 0) {
                $list.append('<li class="empty-msg">現在、異常値の報告はありません。</li>');
                $('#btn-vital-alert').css('opacity', '0.6');
            } else {
                $('#btn-vital-alert').css('opacity', '1.0');
                
                records.forEach(record => {
                    const timeStr = record.recorded_at ? record.recorded_at.substring(11, 16) : '--:--';
                    let details = [];
                    
                    if (record.body_temp) {
                        const val = parseFloat(record.body_temp);
                        const style = (val >= 37.5) ? 'color:#c62828; font-weight:bold;' : '';
                        details.push(`体温: <span style="${style}">${val}℃</span>`);
                    }
                    if (record.blood_pressure_high && record.blood_pressure_low) {
                        const valHigh = parseInt(record.blood_pressure_high);
                        const style = (valHigh >= 140) ? 'color:#c62828; font-weight:bold;' : '';
                        details.push(`血圧: <span style="${style}">${record.blood_pressure_high}/${record.blood_pressure_low}</span>`);
                    }
                    if (record.spo2) {
                        const valSpo2 = parseInt(record.spo2);
                        const style = (valSpo2 < 95) ? 'color:#c62828; font-weight:bold;' : '';
                        details.push(`SPO2: <span style="${style}">${record.spo2}%</span>`);
                    }

                    const clientName = (record.client && record.client.client_name) ? record.client.client_name : '不明';

                    const html = `
                        <li style="padding: 6px 0; border-bottom: 1px solid #f0f0f0;">
                            <strong>${clientName}</strong> - 
                            ${details.join(' / ')}
                            <span style="font-size:0.85em; color:#888; margin-left:5px;">(${timeStr})</span>
                        </li>
                    `;
                    $list.append(html);
                });
            }
        })
        .catch(error => {
            console.error('バイタル情報の取得に失敗:', error);
        });
}

// ★利用者リストをAPIから取得してプルダウンにセットする機能
async function loadVitalClients() {
    try {
        const res = await axios.get('/web-api/clients');
        const clients = res.data;
        const $select = $('#vital-client-select');
        
        $select.empty().append('<option value="">👤 利用者を選択してください</option>');
        
        clients.forEach(client => {
            $select.append(`<option value="${client.id}">${client.client_name}</option>`);
        });
    } catch (error) {
        console.error('利用者リストの取得に失敗しました:', error);
    }
}

$(document).ready(function() {
    
    if ($('#vital-client-select').length > 0) {
        loadVitalClients();
    }

    $('.quick-date-btn').on('click', function() {
        const range = $(this).data('range');
        const end = new Date();
        const start = new Date();
        if (range === 'week') {
            start.setDate(end.getDate() - 7);
        } else if (range === 'month') {
            start.setDate(1);
        }
        $('#search-start-date').val(start.toISOString().split('T')[0]);
        $('#search-end-date').val(end.toISOString().split('T')[0]);
        
        // 日付セット後、利用者が選ばれていれば自動で「表示」を押す
        if ($('#vital-client-select').val()) {
            $('#update-graph-btn').trigger('click');
        }
    });

    $('#update-graph-btn').on('click', async function() {
        const cid = $('#vital-client-select').val();
        if (!cid) {
            alert("利用者を選択してください");
            return;
        }

        const startStr = $('#search-start-date').val();
        const endStr = $('#search-end-date').val();

        // 読み込み中表示
        $(this).text('読込中...').prop('disabled', true);

        try {
            // ★修正ポイント: AIに頼らず、データベース（全記録）から直接取得して高速フィルタリング
            const res = await axios.get('/web-api/all-records');
            let records = res.data;

            // 1. 選択された利用者で絞り込み
            records = records.filter(r => String(r.client_id) === String(cid));

            // 2. 日付で絞り込み
            if (startStr) {
                const s = new Date(startStr + 'T00:00:00');
                records = records.filter(r => new Date(r.recorded_at) >= s);
            }
            if (endStr) {
                const e = new Date(endStr + 'T23:59:59');
                records = records.filter(r => new Date(r.recorded_at) <= e);
            }

            // 3. バイタル値（体温か血圧）が入力されている記録のみに絞り込み
            records = records.filter(r => r.body_temp || r.blood_pressure_high || r.blood_pressure_low);

            // 4. 古い順に並び替え（グラフの左から右へ時系列にするため）
            records.sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));

            if (records.length > 0) {
                // グラフ用にデータを整形
                const vitalData = records.map(r => {
                    const d = new Date(r.recorded_at);
                    const dateLabel = `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                    return {
                        date: dateLabel,
                        body_temp: r.body_temp,
                        blood_pressure_high: r.blood_pressure_high,
                        blood_pressure_low: r.blood_pressure_low
                    };
                });
                
                updateVitalChart(vitalData);
            } else {
                alert("指定期間のバイタルデータがありません。");
                clearVitalChart();
            }
        } catch (e) { 
            alert("データの取得に失敗しました。"); 
            console.error(e);
        } finally {
            $(this).text('表示').prop('disabled', false);
        }
    });

    $('#vital-client-select').on('change', function() {
        clearVitalChart();
    });

    $('#chart-clear-btn').on('click', function() {
        if (confirm('表示をリセットしますか？')) {
            $('#search-start-date, #search-end-date').val('');
            $('#vital-client-select').val('');
            clearVitalChart();
        }
    });

    updateVitalAlerts();
    setInterval(updateVitalAlerts, 60000); 
});
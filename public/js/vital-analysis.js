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
    
    // グラフ描画
    vitalChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: vitalData.map(d => d.date),
            datasets: [
                { label: '体温(℃)', data: vitalData.map(d => d.body_temp || d.temp), borderColor: '#ff6384', backgroundColor: 'rgba(255, 99, 132, 0.2)', yAxisID: 'y-temp', tension: 0.3 },
                { label: '血圧(上)', data: vitalData.map(d => d.blood_pressure_high || d.bp_high), borderColor: '#36a2eb', backgroundColor: 'rgba(54, 162, 235, 0.2)', yAxisID: 'y-bp', tension: 0.3 },
                { label: '血圧(下)', data: vitalData.map(d => d.blood_pressure_low || d.bp_low), borderColor: '#4bc0c0', backgroundColor: 'rgba(75, 192, 192, 0.2)', yAxisID: 'y-bp', tension: 0.3 }
            ]
        },
        options: { responsive: true, scales: { 'y-temp': { min: 34, max: 40 }, 'y-bp': { min: 40, max: 200 } } }
    });
}

/**
 * ▼▼▼ 要注意バイタル（8時間以内）の自動更新ロジック ▼▼▼
 */
function updateVitalAlerts() {
    if ($('#list-vital-alert').length === 0) return;

    axios.get('/web-api/dashboard/vital-alerts')
        .then(response => {
            const records = response.data;
            const count = records.length;
            
            // 1. バッジの件数を更新
            $('#count-vital-alert').text(count);

            // 2. リストの中身を作成
            const $list = $('#list-vital-alert');
            $list.empty(); // 一旦クリア

            if (count === 0) {
                // 異常なしの場合
                $list.append('<li class="empty-msg">現在、異常値の報告はありません。</li>');
                $('#btn-vital-alert').css('opacity', '0.6');
            } else {
                // 異常ありの場合
                $('#btn-vital-alert').css('opacity', '1.0');
                
                records.forEach(record => {
                    // 時間を HH:MM 形式に整形
                    const timeStr = record.recorded_at ? record.recorded_at.substring(11, 16) : '--:--';
                    
                    // 異常値判定＆赤字装飾の準備
                    let details = [];
                    
                    // A. 体温
                    if (record.body_temp) {
                        const val = parseFloat(record.body_temp);
                        const style = (val >= 37.5) ? 'color:#dc3545; font-weight:bold;' : '';
                        details.push(`体温: <span style="${style}">${val}℃</span>`);
                    }
                    
                    // B. 血圧
                    if (record.blood_pressure_high && record.blood_pressure_low) {
                        const valHigh = parseInt(record.blood_pressure_high);
                        const style = (valHigh >= 140) ? 'color:#dc3545; font-weight:bold;' : '';
                        details.push(`血圧: <span style="${style}">${record.blood_pressure_high}/${record.blood_pressure_low}</span>`);
                    }
                    
                    // C. SPO2
                    if (record.spo2) {
                        const valSpo2 = parseInt(record.spo2);
                        const style = (valSpo2 < 95) ? 'color:#dc3545; font-weight:bold;' : '';
                        details.push(`SPO2: <span style="${style}">${record.spo2}%</span>`);
                    }

                    // ★修正箇所： record.client.name ではなく record.client.client_name を使う
                    const clientName = (record.client && record.client.client_name) ? record.client.client_name : '不明';

                    // HTML生成
                    const html = `
                        <li>
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

// ドキュメント準備完了時の処理
$(document).ready(function() {
    
    // --- 既存のイベントハンドラ ---
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
        $('#update-graph-btn').trigger('click');
    });

    $('#update-graph-btn').on('click', async function() {
        const cid = $('#client-select').val();
        if (!cid) return alert("利用者を選択してください");
        try {
            const res = await axios.post('/web-api/ask-ai', { clientId: cid, question: '', startDate: $('#search-start-date').val(), endDate: $('#search-end-date').val(), systemPrompt: '分析用データ取得' });
            if (res.data.vitalData) updateVitalChart(res.data.vitalData);
        } catch (e) { alert("データ取得エラー"); }
    });

    $('#chat-clear-btn, #chart-clear-btn').on('click', function() {
        if (confirm('表示をリセットしますか？')) {
            if (this.id === 'chat-clear-btn') $('#chat-window').empty();
            $('#search-start-date, #search-end-date').val('');
            clearVitalChart();
        }
    });

    // --- バイタル通知の自動更新 ---
    updateVitalAlerts();
    setInterval(updateVitalAlerts, 60000); // 60秒ごとに更新
});
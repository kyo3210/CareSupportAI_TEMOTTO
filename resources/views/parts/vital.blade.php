<section>
    <h2 style="font-size: 1.1em; margin-top: 0;">📊 バイタル分析</h2>
    <div style="margin-bottom: 10px; display: flex; gap: 5px;">
        <button type="button" class="quick-date-btn" data-range="week" style="font-size: 0.75em; padding: 4px 8px; background: white; border: 1px solid #ccc; border-radius: 4px;">直近1週間</button>
        <button type="button" class="quick-date-btn" data-range="month" style="font-size: 0.75em; padding: 4px 8px; background: white; border: 1px solid #ccc; border-radius: 4px;">今月</button>
    </div>
    <div style="margin-bottom: 10px; display: flex; align-items: center; gap: 5px;">
        <input type="date" id="search-start-date" style="width: 32%;">
        <span>〜</span>
        <input type="date" id="search-end-date" style="width: 32%;">
        <button type="button" id="update-graph-btn" style="background: #007bff; color: white; border: none; padding: 6px 12px; border-radius: 4px;">表示</button>
        <button type="button" id="chart-clear-btn" style="background: #6c757d; color: white; border: none; padding: 6px 10px; border-radius: 4px; font-size: 0.8em;" title="グラフをリセット">リセット</button>
    </div>
    <canvas id="vitalChart" style="max-height: 250px;"></canvas>
</section>
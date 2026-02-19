<section id="schedule-section">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 0 10px;">
        <h2 style="font-size: 1.1em; margin: 0; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.2em;">📅</span> スケジュール管理
        </h2>
        <button type="button" id="add-schedule-btn" style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            ＋ 予定追加
        </button>
    </div>
    
    <div id="calendar" style="background: white; padding: 10px; border-radius: 12px; min-height: 500px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #eee;"></div>

    </section>

<style>
    /* FullCalendarのスマホ表示微調整 */
    .fc .fc-toolbar {
        flex-direction: column;
        gap: 8px;
    }
    @media (min-width: 768px) {
        .fc .fc-toolbar {
            flex-direction: row;
        }
    }
    .fc-event {
        cursor: pointer;
        padding: 2px 4px;
    }
</style>
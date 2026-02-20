<!DOCTYPE html>
<html lang="ja">
<head>
    @include('parts.head')
    <style>
        /* タブ切り替え用の表示制御 */
        .content-section { display: none; width: 100%; }
        .content-section.active { display: block; }
        
        /* サイドメニューの追加スタイル */
        .menu-item.selected { background: #0056b3; font-weight: bold; }
        
        /* メインの余白調整 */
        main { padding: 10px; max-width: 1200px; margin: 0 auto; }

        /* 通知バー用のスタイル */
        .status-bar-container {
            display: flex; gap: 8px; margin-bottom: 8px; overflow-x: auto; padding-bottom: 4px; width: 100%; min-height: 40px;
        }
        .status-badge {
            flex: 1; display: flex; align-items: center; justify-content: space-between;
            padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px;
            font-weight: bold; font-size: 0.85rem; cursor: pointer;
            background-color: #f9f9f9; box-shadow: 0 2px 4px rgba(0,0,0,0.05); white-space: nowrap;
        }
        .danger-badge { background-color: #ffebee !important; color: #c62828 !important; border-color: #ffcdd2 !important; }
        .warning-badge { background-color: #fff3e0 !important; color: #ef6c00 !important; border-color: #ffe0b2 !important; }
        .info-badge { background-color: #e3f2fd !important; color: #0277bd !important; border-color: #b3e5fc !important; }

        .badge-count { color: white; padding: 2px 6px; border-radius: 10px; font-size: 0.75em; margin-left: 5px; }
        .danger-badge .badge-count { background: #c62828; }
        .warning-badge .badge-count { background: #ef6c00; }
        .info-badge .badge-count { background: #0277bd; }
        
        .info-panel { display: none; margin-bottom: 10px; animation: slideDown 0.3s ease-out; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .panel-content { background: #fff; padding: 12px; border-radius: 8px; border: 1px solid #eee; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .danger-border { border-left: 4px solid #c62828; }
        .warning-border { border-left: 4px solid #ef6c00; }
        .info-border { border-left: 4px solid #0277bd; }

        .alert-list { list-style: none; padding: 0; margin: 0; font-size: 0.9rem; }
        .alert-list li { padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
        .empty-msg { color: #999; font-size: 0.8em; padding: 5px 0; }

        /* プレースホルダーの文字色設定 */
        ::placeholder { color: #ccc !important; opacity: 1; }
        :-ms-input-placeholder { color: #ccc !important; }
        ::-ms-input-placeholder { color: #ccc !important; }
    </style>
</head>
<body style="background: #f4f7f6; font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0;">

    <div id="sidebar-overlay"></div>
    <nav id="sidebar">
        <div style="padding: 20px; border-bottom: 1px solid #495057;">
            <p style="font-size: 0.8em; color: #adb5bd; margin: 0;">CareSupport メニュー</p>
        </div>
        <a class="menu-item active" data-tab="dashboard" onclick="showTab('dashboard')">🏠 ダッシュボード</a>
        <a class="menu-item" data-tab="schedule" onclick="showTab('schedule')">📅 スケジュール管理</a>
        <a class="menu-item" data-tab="vital" onclick="showTab('vital')">📊 バイタル分析</a>
        <a class="menu-item" data-tab="record" onclick="showTab('record')">📝 ケア記録入力</a>
        <a class="menu-item" data-tab="client" onclick="showTab('client')">👤 利用者管理</a>
        <a class="menu-item" data-tab="office" onclick="showTab('office')">🏢 事業者情報</a>
    </nav>

    <header style="background: #fff; display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; border-bottom: 2px solid #0056b3; position: sticky; top: 0; z-index: 100;">
        <div style="display: flex; align-items: center; gap: 15px;">
            <button id="menu-toggle" style="background:none; border:none; color:#0056b3; font-size:1.8em; cursor:pointer;">☰</button>
            <h1 id="page-title" style="color: #0056b3; margin: 0; font-size: 1.1em;">ダッシュボード</h1>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 0.8em; color: #666;">{{ Auth::user()->name }}</span>
            <form method="POST" action="{{ route('logout') }}" style="margin: 0;">
                @csrf
                <button type="submit" style="background: #6c757d; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 0.7em;">終了</button>
            </form>
        </div>
    </header>

    <main>
        <div id="tab-dashboard" class="content-section active">
            <div style="max-width: 600px; margin: 0 auto;">
                <div class="status-bar-container">
                    <button type="button" id="btn-vital-alert" class="status-badge danger-badge" onclick="togglePanel('dash-vital-panel')">
                        <span class="badge-icon">⚠️</span> <span>バイタル</span>
                        <span class="badge-count" id="count-vital-alert">0</span> <span>▼</span>
                    </button>
                    
                    <button type="button" id="btn-todo-alert" class="status-badge info-badge" onclick="togglePanel('dash-todo-panel')">
                        <span class="badge-icon">📝</span> <span>タスク</span>
                        <span class="badge-count" id="count-todo-alert">0</span> <span>▼</span>
                    </button>

                    <button type="button" id="btn-staff-chat-alert" class="status-badge" style="background-color: #ebf8e8 !important; color: #00b333 !important; border-color: #b3ffc3 !important;" onclick="togglePanel('dash-staff-chat-panel')">
                        <span class="badge-icon">💬</span> <span>未読</span>
                        <span class="badge-count" id="count-chat-unread" style="background: #dc3545; display:none;">0</span> <span>▼</span>
                    </button>

                    <button type="button" id="btn-renewal-alert" class="status-badge warning-badge" onclick="togglePanel('dash-renewal-panel')">
                        <span class="badge-icon">📄</span> <span>認定更新</span>
                        <span class="badge-count" id="count-renewal-alert">0</span> <span>▼</span>
                    </button>
                </div>

                <div id="dash-vital-panel" class="info-panel">
                    <div class="panel-content danger-border">
                        <h6 style="font-weight:bold; margin:0 0 5px;">【要確認】バイタル異常値</h6>
                        <ul class="alert-list" id="list-vital-alert">
                            <li class="empty-msg">現在、異常値の報告はありません。</li>
                        </ul>
                    </div>
                </div>

                <div id="dash-todo-panel" class="info-panel">
                    <div class="panel-content info-border">
                        <h6 style="font-weight:bold; margin:0 0 5px;">本日のTODO・記録未入力</h6>
                        <ul class="alert-list" id="list-todo-alert">
                            <li class="empty-msg">現在、未完了のタスクはありません。</li>
                        </ul>
                    </div>
                </div>

                <div id="dash-staff-chat-panel" class="info-panel">
                    <div class="panel-content" style="border-left: 4px solid #00b333;">
                        <h6 style="font-weight:bold; margin:0 0 5px;">新着メッセージ</h6>
                        <ul class="alert-list" id="list-staff-chat-alert">
                            <li class="empty-msg">現在、未読のメッセージはありません。</li>
                        </ul>
                    </div>
                </div>

                <div id="dash-renewal-panel" class="info-panel">
                    <div class="panel-content warning-border">
                        <h6 style="font-weight:bold; margin:0 0 5px;">認定更新時期が近づいています</h6>
                        <ul class="alert-list" id="list-renewal-alert">
                            <li class="empty-msg">現在、対象者はおりません。</li>
                        </ul>
                    </div>
                </div>

                <div style="margin-top: 10px;">
                    @include('parts.chat')
                </div>
            </div>
        </div>

        <div id="tab-schedule" class="content-section">@include('parts.schedule')</div>
        <div id="tab-vital" class="content-section">@include('parts.vital')</div>
        <div id="tab-record" class="content-section">@include('parts.record')</div>
        <div id="tab-client" class="content-section">@include('parts.client')</div>
        <div id="tab-office" class="content-section">@include('parts.office')</div>
    </main>

    @include('parts.modals')

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js'></script>

    <script>
        window.toggleSidebar = function() { $('#sidebar, #sidebar-overlay').toggleClass('active'); };
        
        window.showTab = function(tabName) {
            $('.content-section').removeClass('active'); 
            $('#tab-' + tabName).addClass('active');

            $('.menu-item').removeClass('active selected');
            $(`.menu-item[data-tab="${tabName}"]`).addClass('active selected');

            const titles = { 
                'dashboard': 'ダッシュボード', 
                'schedule': 'スケジュール管理', 
                'vital': 'バイタル分析', 
                'record': 'ケア記録入力', 
                'client': '利用者管理', 
                'office': '事業者情報' 
            };
            $('#page-title').text(titles[tabName] || 'CareSupport AI');
            
            if($('#sidebar').hasClass('active')) window.toggleSidebar();
            window.scrollTo(0, 0);

            if (tabName === 'schedule' && window.calendar) {
                setTimeout(function() {
                    window.calendar.updateSize(); 
                    window.calendar.changeView('timeGridDay');
                    window.calendar.today();
                }, 100);
            }
        };
        
        $(document).on('click', '#menu-toggle, #sidebar-overlay', function(e) { 
            e.preventDefault(); 
            window.toggleSidebar(); 
        });

        window.togglePanel = function(panelId) {
            $('.info-panel').not('#' + panelId).hide();
            $('#' + panelId).toggle();
        };

        window.getCurrentUserName = function() {
            return "{{ Auth::user()->name }}";
        };
    </script>

    <script src="{{ asset('js/ai-chat.js') }}"></script>
    <script src="{{ asset('js/vital-analysis.js') }}"></script>
    <script src="{{ asset('js/schedule-record.js') }}"></script>
    <script src="{{ asset('js/management.js') }}"></script>
    <script src="{{ asset('js/client-register.js') }}"></script>
</body>
</html>
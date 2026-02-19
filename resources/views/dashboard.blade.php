<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Dashboard') }}
        </h2>
    </x-slot>

    <div class="py-4">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg" style="max-width: 600px; margin: 0 auto;">
                <div class="p-3 text-gray-900 dark:text-gray-100">

                    <div id="custom-status-bar" class="status-bar-container">
                        
                        <button type="button" class="status-badge danger-badge" onclick="togglePanel('vital-panel')">
                            <span class="badge-icon">💓</span>
                            <span class="badge-text">要注意バイタル</span>
                            <span class="badge-count">3</span>
                            <span class="toggle-arrow">▼</span>
                        </button>

                        <button type="button" class="status-badge warning-badge" onclick="togglePanel('renewal-panel')">
                            <span class="badge-icon">📄</span>
                            <span class="badge-text">認定更新対象</span>
                            <span class="badge-count">1</span>
                            <span class="toggle-arrow">▼</span>
                        </button>

                    </div>
                    <div id="vital-panel" class="info-panel" style="display: none;">
                        <div class="panel-content danger-border">
                            <h6 style="font-weight:bold; margin-bottom:5px;">【要確認】バイタル異常値 (3名)</h6>
                            <ul class="alert-list">
                                <li><strong>田中 太郎</strong> - 体温: <span style="color:#dc3545; font-weight:bold;">38.2℃</span> (09:30)</li>
                                <li><strong>佐藤 花子</strong> - 血圧: <span style="color:#dc3545; font-weight:bold;">150/95</span> (10:15)</li>
                                <li><strong>鈴木 一郎</strong> - SPO2: <span style="color:#dc3545; font-weight:bold;">92%</span> (11:00)</li>
                            </ul>
                        </div>
                    </div>

                    <div id="renewal-panel" class="info-panel" style="display: none;">
                        <div class="panel-content warning-border">
                            <h6 style="font-weight:bold; margin-bottom:5px;">認定更新時期が近づいています</h6>
                            <ul class="alert-list">
                                <li><strong>高橋 次郎</strong> - 期限: 2026/03/30 (残り20日)</li>
                            </ul>
                        </div>
                    </div>

                    <div class="chat-wrapper" style="margin-top: 10px;">
                        @include('parts.chat')
                    </div>

                </div>
            </div>
        </div>
    </div>

    <style>
        /* 通知バーのレイアウト */
        #custom-status-bar.status-bar-container {
            display: flex;
            gap: 8px;
            margin-bottom: 8px;
            overflow-x: auto;
            padding-bottom: 4px;
            width: 100%;
        }

        /* バッジボタンの共通スタイル */
        .status-badge {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 10px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-weight: bold;
            font-size: 0.85rem;
            cursor: pointer;
            transition: transform 0.1s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            white-space: nowrap;
            background-color: #f9f9f9;
        }
        .status-badge:active { transform: scale(0.98); }

        /* 赤バッジ（バイタル） */
        .danger-badge { 
            background-color: #ffebee !important; 
            color: #c62828 !important; 
            border: 1px solid #ffcdd2 !important; 
        }
        .danger-badge .badge-count { 
            background: #c62828; 
            color: white; 
            padding: 2px 6px; 
            border-radius: 10px; 
            font-size: 0.75em; 
            margin-left: 5px; 
        }

        /* 黄バッジ（更新） */
        .warning-badge { 
            background-color: #fff3e0 !important; 
            color: #ef6c00 !important; 
            border: 1px solid #ffe0b2 !important; 
        }
        .warning-badge .badge-count { 
            background: #ef6c00; 
            color: white; 
            padding: 2px 6px; 
            border-radius: 10px; 
            font-size: 0.75em; 
            margin-left: 5px; 
        }

        .badge-icon { margin-right: 4px; }
        .toggle-arrow { font-size: 0.7em; margin-left: auto; opacity: 0.6; padding-left: 5px;}

        /* 詳細パネル */
        .info-panel { animation: slideDown 0.3s ease-out; margin-bottom: 10px; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

        .panel-content { background: #fff; padding: 12px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); border: 1px solid #eee; }
        .danger-border { border-left: 4px solid #c62828; }
        .warning-border { border-left: 4px solid #ef6c00; }

        .alert-list { list-style: none; padding: 0; margin: 0; font-size: 0.9rem; }
        .alert-list li { padding: 6px 0; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; flex-wrap: wrap; }
        .alert-list li:last-child { border-bottom: none; }
        
        .chat-wrapper { min-height: 450px; }
    </style>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script src="{{ asset('js/ai-chat.js') }}"></script>

    <script>
        function togglePanel(panelId) {
            const panels = document.querySelectorAll('.info-panel');
            const target = document.getElementById(panelId);
            
            if (target.style.display !== 'none') {
                target.style.display = 'none';
            } else {
                panels.forEach(p => p.style.display = 'none');
                target.style.display = 'block';
            }
        }
    </script>
</x-app-layout>
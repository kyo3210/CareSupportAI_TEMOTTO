<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="csrf-token" content="{{ csrf_token() }}">
<meta name="user-name" content="{{ Auth::user()->name ?? '担当スタッフ' }}">
<title>CareSupport AI</title>
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@fullcalendar/interaction@6.1.10/index.global.min.js"></script>

<style>
    .switch { position: relative; display: inline-block; width: 44px; height: 22px; }
    #toggle-bg { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 22px; }
    #toggle-circle { position: absolute; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
    .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); }
    .modal-content { background: white; margin: 5% auto; padding: 20px; width: 80%; max-height: 80%; overflow-y: auto; border-radius: 8px; }
    label { font-size: 0.85em; font-weight: bold; color: #555; display: block; margin-bottom: 3px; }
    input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
    section { background: #fff; padding: 20px; border-radius: 12px; border: 1px solid #ddd; margin-bottom: 20px; }


    /* サイドメニューのスタイル */
#sidebar {
    position: fixed;
    top: 0;
    left: -250px; /* 最初は隠しておく */
    width: 250px;
    height: 100%;
    background: #343a40;
    color: white;
    transition: 0.3s;
    z-index: 2001;
    padding-top: 60px;
    box-shadow: 2px 0 5px rgba(0,0,0,0.3);
}

#sidebar.active {
    left: 0; /* 表示状態 */
}

/* 背景を暗くするオーバーレイ */
#sidebar-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 2000;
}

#sidebar-overlay.active {
    display: block;
}

/* メニュー項目 */
.menu-item {
    padding: 15px 20px;
    display: block;
    color: white;
    text-decoration: none;
    border-bottom: 1px solid #495057;
    cursor: pointer;
}

.menu-item:hover {
    background: #495057;
}

/* ハンバーガーボタン */
#menu-toggle {
    background: none;
    border: none;
    color: #0056b3;
    font-size: 1.8em;
    cursor: pointer;
    padding: 0;
}
</style>
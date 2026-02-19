$(document).ready(function() {

    // ===============================================
    // 1. 保存処理（POST）
    // ===============================================
    $('#client-register-form').on('submit', async function(e) {
        e.preventDefault();
        e.stopImmediatePropagation(); // 他のスクリプトとの重複防止
        
        // --- ① エラー表示のリセット ---
        $('.error-message').remove(); 
        $('.input-error').removeClass('input-error'); 

        // フォームデータを取得
        const formData = {};
        $(this).serializeArray().forEach(item => {
            formData[item.name] = item.value;
        });

        // --- ② バリデーション（未入力チェック） ---
        let hasError = false;

        const requiredFields = [
            { id: '#client-id',          name: 'id',               label: '利用者ID' },
            { id: '#client-name',        name: 'client_name',      label: '利用者氏名' },
            { id: '#client-postcode',    name: 'postcode',         label: '郵便番号' },
            { id: '#client-tel',         name: 'contact_tel',      label: '連絡先電話番号' },
            { id: '#client-address',     name: 'address',          label: '住所' },
            { id: '#client-insurance-no', name: 'insurace_number', label: '介護保険番号' },
            { id: '#client-care-manager', name: 'care_manager',     label: 'ケアマネジャー名' },
            { id: '#client-care-start',   name: 'care_start_date',  label: '認定有効開始日' },
            { id: '#client-care-end',     name: 'care_end_date',    label: '認定有効終了日' },
            { id: '#client-manager-tel',  name: 'care_manager_tel', label: 'ケアマネ連絡先' }
        ];

        requiredFields.forEach(field => {
            if (!formData[field.name] || formData[field.name].trim() === "") {
                showError(field.id, `${field.label}を入力してください`);
                hasError = true;
            }
        });

        // エラーがある場合
        if (hasError) {
            // ★修正：わかりやすいメッセージを表示
            alert("未入力の項目があります。\n赤文字の箇所を確認してください。");
            
            // 最初のエラー箇所へスクロール
            const firstError = $('.input-error').first();
            if (firstError.length > 0) {
                $('html, body').animate({ scrollTop: firstError.offset().top - 150 }, 300);
            }
            return; // ここで処理を止める（サーバーに送信しない）
        }

        // --- ③ 送信処理 ---
        try {
            const res = await axios.post('/web-api/clients', formData);
            
            if (res.data.status === 'success') {
                // ★修正：リロード確認を廃止し、メッセージのみ表示
                alert('利用者情報を保存しました。');
                
                // リストを裏で更新（画面はそのまま）
                if (typeof fetchClients === 'function') {
                    fetchClients();
                }
            }
        } catch (error) {
            console.error(error);
            
            // ★修正：サーバーからのエラー（422）もわかりやすく変換
            if (error.response && error.response.status === 422) {
                alert("未入力の項目があります。\n赤文字の箇所を確認してください。");
            } else {
                alert('保存に失敗しました: ' + (error.response?.data?.message || '通信エラー'));
            }
        }
    });

    /** エラー表示用ヘルパー */
    function showError(selector, message) {
        const $input = $(selector);
        $input.addClass('input-error'); 
        $input.after(`<span class="error-message">⚠️ ${message}</span>`);
    }

    /** エラー消去用ヘルパー */
    function clearErrors() {
        $('.error-message').remove();
        $('.input-error').removeClass('input-error');
    }

    // ===============================================
    // 2. 郵便番号検索機能
    // ===============================================
    $(document).on('click', '#search-zipcode-btn', async function() {
        clearErrors();
        const inputVal = $('#client-postcode').val();
        const zip = inputVal.replace(/[^\d]/g, '');

        if (zip.length !== 7) {
            showError('#client-postcode', '郵便番号は7桁の数字で入力してください');
            return;
        }
        
        const $btn = $(this);
        $btn.prop('disabled', true).text('検索中...');

        try {
            const res = await axios.get(`/web-api/zipcode/${zip}`);
            if (res.data.results) {
                const result = res.data.results[0];
                $('#client-address').val(result.address1 + result.address2 + result.address3);
            } else {
                alert('住所が見つかりませんでした。');
            }
        } catch (e) {
            alert('検索に失敗しました。');
        } finally {
            $btn.prop('disabled', false).text('住所検索');
        }
    });

    // ===============================================
    // 3. 一覧検索機能
    // ===============================================
    $('#open-client-search-modal').on('click', async function() {
        const $modal = $('#client-search-modal');
        const $list = $('#client-search-list');
        $modal.fadeIn(200);
        $list.html('<tr><td colspan="3" style="text-align:center; padding: 20px;">読み込み中...</td></tr>');

        try {
            const res = await axios.get('/web-api/clients');
            const clients = res.data;
            $list.empty();

            if (clients.length === 0) {
                $list.html('<tr><td colspan="3" style="text-align:center; padding: 20px;">登録なし</td></tr>');
                return;
            }

            clients.forEach(client => {
                const clientJson = JSON.stringify(client).replace(/"/g, '&quot;');
                $list.append(`
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 10px;">${client.id}</td>
                        <td style="padding: 10px; font-weight: bold;">${client.client_name}</td>
                        <td style="padding: 10px; text-align: center;">
                            <button type="button" class="select-client-btn" 
                                style="background: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;"
                                data-client="${clientJson}">選択</button>
                        </td>
                    </tr>`);
            });
        } catch (e) {
            $list.html('<tr><td colspan="3" style="text-align:center; color: red;">読み込みエラー</td></tr>');
        }
    });

    $(document).on('click', '.select-client-btn', function() {
        clearErrors();
        const client = $(this).data('client');
        $('#client-id').val(client.id);
        $('#client-name').val(client.client_name);
        $('#client-postcode').val(client.postcode);
        $('#client-tel').val(client.contact_tel);
        $('#client-address').val(client.address);
        $('#client-insurance-no').val(client.insurace_number);
        $('#client-care-start').val(client.care_start_date);
        $('#client-care-end').val(client.care_end_date);
        $('#client-care-manager').val(client.care_manager);
        $('#client-manager-tel').val(client.care_manager_tel);

        $('#client-search-modal').fadeOut(200);
        $('#client-delete-btn').show();
        $('html, body').animate({ scrollTop: $("#client-register-section").offset().top - 100 }, 300);
    });

    // ===============================================
    // 4. クリア・削除
    // ===============================================
    $('#client-clear-btn').on('click', function() {
        if(confirm('入力内容をクリアしますか？')) {
            $('#client-register-form')[0].reset();
            clearErrors();
            $('#client-delete-btn').hide();
        }
    });

    $('#client-delete-btn').on('click', async function() {
        const id = $('#client-id').val();
        if(!id) return;
        if(confirm('本当に削除しますか？')) {
            try {
                await axios.delete(`/web-api/clients/${id}`);
                alert('削除しました');
                $('#client-register-form')[0].reset();
                $('#client-delete-btn').hide();
                clearErrors();
                if (typeof fetchClients === 'function') fetchClients();
            } catch(e) {
                alert('削除に失敗しました');
            }
        }
    });

    $('.close-modal').on('click', function() {
        $(this).closest('.modal').fadeOut(200);
    });
});
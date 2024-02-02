const debug = false;
const manifest = chrome.runtime.getManifest();

$(function () {
    $('.plugin-version').html(manifest.version);
    chrome.runtime.sendMessage({"message": "index_opened"});
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.msg === "task_get_success") {
                showTask(request.response);
                log('task_get_success');
            }
            if (request.msg === "task_get_button_update_text") {
                $('#get_task').prop('value', request.text);
            }
            if (request.msg === "ttl_second_update_text") {
                let time = parseInt(request.text);
                let minutes = Math.floor(time / 60);
                let seconds = time - minutes * 60;
                let text;

                if (minutes > 0) {
                    text = minutes + ' <span style="font-weight: normal">min</span> ' + seconds;
                } else {
                    text = seconds;
                }
                $('#ttl_second').html(text);
            }
            if (request.msg === "task_get_button_disable") {
                $('#get_task').prop('disabled', true);
                log('task_get_button_disable');
            }
            if (request.msg === "task_get_button_enable") {
                $('#get_task').prop('disabled', false);
                log('task_get_button_enable');
            }
            if (request.msg === "task_complete") {
                showEmpty();
                log('task_complete');
                chrome.runtime.sendMessage({"message": "send_report"});
            }
            if (request.msg === "task_timedout") {
                showEmpty();
                log('task_timedout');
            }
            if (request.msg === "task_fail") {
                showEmpty();
                log('task_fail');
            }
        }
    );

    chrome.storage.local.get(['userLogin'], function (result) {
        $('.user_login').html(result.userLogin);
    });

    $('#logout_button').on('click', function () {
        chrome.storage.local.remove('authToken', function(){
            chrome.storage.local.get(['authToken'], function () {
                chrome.browserAction.setPopup({
                    popup: "popup.html"
                }, function () {
                    // window.close();
                    chrome.runtime.sendMessage({"message": "log_out"});
                });
            });
        });
    });

    $('#get_task').on('click',function () {
        $('#get_task').prop('disabled', true);
        $('#get_task').prop('value', 'Waiting for a task');
        chrome.runtime.sendMessage({"message": "get_task"});
    });
});

function showTask(response) {
    $('.no_task').css('display','none');
    $('.task_block').css('display','flex');
    $('#target_url').html(response.data.task.target_url);
    $('#ttl_second').html(response.data.task.ttl_second);
    if (response.data.task.search_depth_page_count) {
        $('#search_depth_page_count').html(response.data.task.search_depth_page_count);
    } else {
        $('#task_description_search_depth_page_count').css('display','none');
    }
    if (response.data.task.bot_mode || response.data.task.bot_mode >= 0) {
        let botMode = response.data.task.bot_mode;

        let time = parseInt(response.data.task.stay_on_site_seconds);
        let minutes = Math.floor(time / 60);
        let seconds = time - minutes * 60;
        let text;

        if (seconds > 0) {
            seconds = seconds + ' sec.'
        } else {
            seconds = '';
        }
        if (minutes > 0) {
            text = minutes + ' min ' + seconds;
        } else {
            text = seconds;
        }

        if (botMode === 0) {
            $('#bot_mode').html('Open at least 2-3 pages and stay at least ' + text + ' and on the website.');
        }
        if (botMode === 2) {
            $('#bot_mode').html('Open at least 2-3 pages and stay at least ' + text + ' and on the website.');
        }
        if (botMode === 1) {
            $('#bot_mode').html('Just call ping and close connection');
        }
        if (botMode === 3) {
            $('#bot_mode').html('Just call ping and close connection');
        }
    } else {
        $('#task_description_bot_mode').css('display','none');
    }
    $('#key_phrase').html(response.data.task.key_phrase);
    let otherWindows = chrome.extension.getBackgroundPage();
    otherWindows.copy(response.data.task.key_phrase);
    chrome.runtime.sendMessage({"message": "start_task"});
}

function showEmpty() {
    $('#task_description_bot_mode').css('display','block');
    $('#task_description_search_depth_page_count').css('display','block');
    $('.no_task').css('display','flex');
    $('.task_block').css('display','none');
}

function log(message) {
    if (debug) {
        console.log(message);
    }
}
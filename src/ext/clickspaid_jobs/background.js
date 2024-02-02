"use strict";

const hideAd = `.ads-ad {
                    display: none;
                  }`;


function onError(error) {
    console.error(`Error: ${error}`);
}

function sendMessageToTabs(messageObject) {
    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then(tabs => {
        for (let tab of tabs) {
            browser.tabs.sendMessage(
                tab.id,
                messageObject
            ).then(response => {
                cl("Message from the content script:");
                cl(response.response);
            }).catch(onError);
        }
    }).catch(onError);
}

const pluginVersion = '5.1.4';

var addResponceHeaders = true;
var testMode = false;
var debugMode = true;
var activeTab = null;
var loggedIn = false;
var baseUrl = 'https://jobs.ClicksPaid.com';
var testUrl = '';
var testAutoLogin = '';
cl('Started background script');
if (debugMode) {
    cl('DebugMode enabled');
}
if (testMode) {
    baseUrl = testUrl;
    cl('TestMode enabled');
}

var showAlertsInsteadOfNotifications = false;

var authToken = null;

var defaultOptions = {method: 'POST', cache: 'no-cache', headers: {'api-version': '1.1'}};
var formData = new FormData();
var taskObject = null;
var taskAccepted = false;
var taskTab = null;
var indexTab = null;
var comebackTimer = 0;
var comebackTimerID = null;
var taskTimer = 0;
var taskTimerID = null;
var taskTimerTimeoutID = null;
var logTimer = 0;
var logTimerID = null;
var taskStayOnPageTimer = 0;
var taskStayOnPageTimerID = null;
var taskStayOnPageTimerTimeoutID = null;
var oldTaskID = 0;
var oldBotMode = null;
var taskSearchEngine = '';
var removeAdwords = true;
var kewordsMatchInSearch = false;
var tempInstall = false;
var taskLogs = [];
var isAndroid = false;
var tabActivatingObject = {highlighted: true};

var firstGoogleVisit = true;

function handleActivated(activeInfo) {
    if (!!taskObject) {
        if (taskStayOnPageTimer != taskObject.stay_on_site_seconds) {
            cl('handleActivated ');
            cl(activeInfo);
            cl(taskStayOnPageTimer);
            browser.tabs.update(taskTab.id, tabActivatingObject);
        }
    }
}

browser.tabs.onActivated.addListener(handleActivated);


$(function () {
    cl('Started exxtesion');

    browser.runtime.getPlatformInfo().then(info => {
        cl('getBrowserInfo os');
        cl(info.os);
        if (info.os !== 'android') {
            browser.windows.onCreated.addListener(function (windowid) {
                cl('Fired windows.onCreated event');
                checkAuth();
            });
        } else {
            cl('android detected');
            cl('browser.windows is not supported');
            isAndroid = true;
            showAlertsInsteadOfNotifications = true;
            tabActivatingObject = {active: true}
        }
    });
});

function clearTaskData() {
    cl('called function clearTaskData');
    taskTab = null;
    oldTaskID = taskObject.id;
    oldBotMode = taskObject.bot_mode;
    taskObject = null;
    taskAccepted = false;
    firstGoogleVisit = true;
    browser.browserAction.setBadgeText({"text": ''})
    browser.storage.local.set({'isComebackStatus': 0});
    cl('cleared variables: taskTab taskObject taskAccepted');
    cl('setting variables: oldTaskID oldBotMode ');
}


browser.tabs.onRemoved.addListener(function (tabid, removed) {
    cl('Fired tabs.onRemoved event');
    if (!!taskObject) {
        if (tabid == indexTab.id) {
            cl('Closed tab is index, task is failed');
            if (!!taskTab && taskTab.id) {
                browser.tabs.remove(taskTab.id).then(() => {
                    cl('removed opened task tab by closing parent index tab');
                }, onError);
            }
            setTaskFailed();
        }
        if (taskTab) {
            if (tabid == taskTab.id) {
                cl('Closed tab '+tabid+' is taskTab, task is failed');
                setTaskFailed(false);
            }
        }
    }
})


browser.runtime.onInstalled.addListener(function (details) {
    cl('Fired onInstalled event');
    if (details.temporary) {
        cl('This is temporary installation');
        tempInstall = true;
    }
    checkAuth();
    checkNotify();
});

function checkNotify() {
    const permissionsToRequest = {
        "origins": [
            "https://*/*",
            "http://*/*"
        ],
        "permissions": [
            "activeTab",
            "alarms",
            "notifications",
            "clipboardRead",
            "clipboardWrite",
            "webRequest",
            "webRequestBlocking",
            "webNavigation",
            "privacy",
            "storage",
            "tabs"
        ]
    };
    browser.permissions.getAll()
        .then((permissions) => {
            let permissionsPassed = true;
            for (let origin of permissionsToRequest.origins) {
                if (!permissions.origins.includes(origin)) {
                    permissionsPassed = false;
                }
            }
            for (let permission of permissionsToRequest.permissions) {
                if (!permissions.permissions.includes(permission)) {
                    permissionsPassed = false;
                }
            }
            if (!permissionsPassed) {
                browser.permissions.request(permissionsToRequest)
                    .then((response) => {
                        if (response) {
                            cl("Permission was granted");
                        } else {
                            showAlertsInsteadOfNotifications = true;
                            console.log("Permission was refused");
                        }
                        return browser.permissions.getAll();
                    }, (error) => {
                        showAlertsInsteadOfNotifications = true;
                        onError(error)
                    })
                    .then((currentPermissions) => {
                        console.log(`Current permissions:`, currentPermissions);
                    }, (error) => {
                        showAlertsInsteadOfNotifications = true;
                        onError(error)
                    });
            }
        }, (error) => {
            showAlertsInsteadOfNotifications = true;
            onError(error)
        })
}

browser.webNavigation.onCompleted.addListener(function (info) {
    console.log('browser.webNavigation.onCompleted');
    if (!!taskObject && taskAccepted) {
        if (info.tabId === taskTab.id) {
            if (info.url.substring(0, taskSearchEngine.length) === taskSearchEngine) {
                cl('loaded page is Search Engine and has url: ' + taskSearchEngine);
                browser.tabs.query({
                    currentWindow: true,
                    active: true
                }).then(tabs => {
                    // sendMessageToTabs(tabs, title, message)
                    cl('Geting active tab: ');
                    if (removeAdwords && kewordsMatchInSearch) {
                        // if (removeAdwords){
                        cl('If removeAdwords: ');
                        browser.tabs.insertCSS(taskTab.id, {code: hideAd}).then(() => {
                            cl('Insert hide CSS')
                        });
                    }
                    sendMessageToTabs({
                        message: "mark_website",
                        match: taskObject.target_url,
                        xads: removeAdwords,
                        isAndroid: isAndroid,
                        search: taskObject.key_phrase
                    });
                    if (firstGoogleVisit) {
                        if (showAlertsInsteadOfNotifications) {
                            showMessage('Press [Ctrl+V]', 'or type in search keywords: ' + "\r\n" + taskObject.key_phrase + "\r\n and looking for url matching: " + taskObject.target_url, 6);
                        } else {
                            showMessage('Looking for url matching:', "" + taskObject.target_url, 0, true);
                            showMessage('Press [Ctrl+V]', 'or type in search keywords: ' + "\r\n" + taskObject.key_phrase, 0, true);
                        }
                        firstGoogleVisit = false;
                    }
                }).catch(onError);
            }
            // if target website - show message and start countdown timers
            var testString1 = taskObject.target_url;
            let lastString = testString1.replace(/\./g, "\\.");
            let reg = lastString.replace(/\*/g, "\.");
            let re = new RegExp(reg, "i");

            if ( matchUrl(taskObject.target_url, info.url) && kewordsMatchInSearch) { // re.test(info.url)
                cl('This is target_url');
                cl('Show message to stay on site');
                if (isAndroid) {
                    showMessage('Attention please!!!', 'Please stay on this site ' + taskObject.stay_on_site_seconds + ' seconds. When the time is out, you will be redirected', 6);
                } else {
                    showMessage('Attention please!!!', 'Please wait until the timer on the plugin icon has finished', 6);
                }
                stayOnPage();
            }
        }
    }

});

browser.webRequest.onBeforeRequest.addListener(
    function (info) {
        console.log('browser.webRequest.onBeforeRequest');

        if (!!taskObject && taskAccepted) {
            if (info.tabId == taskTab.id) {
                if (info.url.indexOf('www.google.com') === -1 && matchUrl(taskObject.target_url, info.url)) {
                    cl('We find target_url');
                    // if bot mode assumed the just ping the google
                    if (taskObject.bot_mode == 1 || taskObject.bot_mode == 3) {
                        cl('if PING MODE: ');
                        // when target url is about to load we finish job and close task
                        browser.tabs.remove(taskTab.id)
                            .then(() => {
                                cl('removed opened tab');
                                onCloseTab(taskObject);
                                taskCompleted();
                            }, onError);
                        return {cancel: true};
                    }
                }
            }
        }
        return {cancel: false};
    },
    {
        urls: [
            "https://*/*",
            "http://*/*"
        ]
    },
    ["blocking"]);

browser.webRequest.onCompleted.addListener((info) => {

    console.log('browser.webRequest.onCompleted.addListener');

    if (!!taskObject && taskAccepted) {
        if (info.tabId == taskTab.id) {
            if (taskObject.bot_mode == 2 || taskObject.bot_mode == 3) {
                if (logTimer > 0) {
                    let requestObject = {
                        frameId: info.frameId,
                        statusCode: info.statusCode,
                        method: info.method,
                        url: info.url,
                        fromCache: info.fromCache,
                        initiator: info.initiator,
                        ip: info.ip,
                        parentFrameId: info.parentFrameId,
                        requestId: info.requestId,
                        statusLine: info.statusLine,
                        tabId: info.tabId,
                        timeStamp: info.timeStamp,
                        type: info.type,
                        responseHeaders: '',
                    };
                    if (addResponceHeaders) {
                        requestObject.responseHeaders = JSON.stringify(info.responseHeaders);
                    }
                    taskLogs.push(JSON.stringify(requestObject))
                }
            }
        }
    }
}, {urls: ["<all_urls>"]}, ["responseHeaders"]);

browser.browserAction.onClicked.addListener(function (tab) {

    console.log('browser.browserAction.onClicked');


    cl('Fired browserAction.onClicked event');
    //openIndexTab();
    checkAuth(true);
});


browser.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        console.log('browser.runtime.onMessage');

        cl('Fired onMessage event');
        if (request.message === "index_opened") {
            setPluginVersion();
            checkTaskFailed(true);
            checkNotify();
        }
        if (request.message === "set_query_match") {
            kewordsMatchInSearch = request.ismatch;
        }
        if (request.message === "set_email") {
            browser.storage.local.set({'userLogin': request.email})
                .then(() => {
                    //browser.runtime.sendMessage({message: 'set_username',username: request.email});
                }, onError)
        }
        if (request.message === "request_username") {
            browser.storage.local.get('userLogin')
                .then((result) => {
                    cl('Readed saved user login');
                    browser.runtime.sendMessage({message: 'set_username', username: result.userLogin});
                }, onError)
        }
        if (request.message === "try_auth") {
            cl('Message is: try_auth');
            formData = new FormData();
            formData.append("email", request.email);
            formData.append("password", request.password);
            formData.append("bot_type_id", 1);
            defaultOptions.body = formData;
            var url = baseUrl + "/bot/register";
            fetch(url, defaultOptions)
                .then(response => response.json())
                .then((response) => {
                    cl('response.data');
                    cl(response.data);
                    if (response.success) {
                        cl('response object is');
                        cl(response);
                        browser.storage.local.set({'authToken': response.data.bot_auth_key_hash})
                            .then(() => {
                                cl('AuthToken saved in storage');
                                checkAuth(true);
                            }, onError)
                    } else {
                        let error = 'Please try again';
                        if (response.error.errorCode == 1) {
                            error = "Please check you credentials and try again."
                        }
                        cl('Authentication response error');
                        cl(response);
                        browser.runtime.sendMessage({message: 'show_login_error'});
                        browser.runtime.sendMessage({message: 'set_username', username: request.email});
                    }
                })
                .catch(error => {
                    cl('Authentication request error');
                    cl(error);
                    browser.runtime.sendMessage({message: 'show_login_error'});
                    browser.runtime.sendMessage({message: 'set_username', username: request.email});
                });
            browser.tabs.query({active: true, currentWindow: true})
                .then((tabs) => {
                    activeTab = tabs[0];
                }, onError)
        }
        if (request.message === "get_task") {
            cl('Message is: get_task');
            if (!!taskObject) {
                setTaskFailed(false);
            }
            formData = new FormData();
            formData.append("auth_key_hash", authToken);
            defaultOptions.body = formData;
            var url = baseUrl + "/bot/task/get";
            fetch(url, defaultOptions)
                .then(response => response.json())
                .then((response) => {
                    cl('response object is');
                    cl(response);
                    if (response.data.task) {
                        if (response.data.task.bot_mode) {
                        } else {
                            response.data.task.bot_mode = null;
                            response.data.task.bot_mode = 0;
                        }
                        if (!response.data.task.gtld || response.data.task.gtld === '') {
                            response.data.task.gtld = 'https://www.google.com/';
                        }
                        if (!response.data.task.xads || response.data.task.xads === '') {
                            response.data.task.xads = true;
                        }

                        cl('URL: '+response.data.task.target_url);
                        cl('KEY: '+response.data.task.key_phrase);

                        taskSearchEngine = response.data.task.gtld;
                        removeAdwords = response.data.task.xads;
                        taskObject = response.data.task;
                        comebackTimer = response.data.comeback_delay_seconds;
                        taskTimer = taskObject.ttl_second;
                        taskStayOnPageTimer = taskObject.stay_on_site_seconds;

                        if (response.data.log_actions_seconds || response.data.log_actions_seconds > 0) {
                            logTimer = response.data.log_actions_seconds;
                        }
                        cl('task_id_get');
                        cl(taskObject.id);
                        browser.runtime.sendMessage({
                            msg: "task_get_success",
                            response: response
                        })
                        startTaskTimer();
                        startComebackTimer();
                        if (taskObject.bot_mode === 2 || taskObject.bot_mode === 3) {
                            startLogTimer();
                        }
                    } else {
                        if (response.data.comeback_delay_seconds) {

                            var time = parseInt(response.data.comeback_delay_seconds);
                            var minutes = Math.floor(time / 60);
                            var seconds = time - minutes * 60;
                            let text = '';
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

                            showMessage('No available tasks', 'Please try again after: ' + text + '', 5);
                        } else {
                            showMessage('No available tasks', 'Please try again later ', 6);
                        }
                        cl('Task response error');
                        cl(response);
                        taskObject = null;
                        taskTimer = 0;
                        taskStayOnPageTimer = 0;
                        comebackTimer = response.data.comeback_delay_seconds;
                        startComebackTimer();
                    }
                })
                .catch(error => {
                    showMessage('Task request error', 'Please try again later', 5);
                    cl('Task request error');
                    cl(error);
                })
        }
        if (request.message === "start_task") {
            cl('Message is: start_task');
            cl('taskTimer');
            cl(taskTimer);
            if (taskTimer > 5) {
                // var creating = browser.tabs.create({
                browser.tabs.create({
                    url: taskSearchEngine
                }).then((tab) => {
                    taskAccepted = true;
                    taskTab = tab;
                    cl('Tab created');
                    cl(taskTab);
                    //showMessage('Press [Ctrl+V]', 'or type in search keywords : '+"\r\n"+taskObject.key_phrase, 6);
                }, onError);
            } else {
                setTaskFailed(false);
                // showMessage('Sorry','This task is timed out',5);
            }
        }
        if (request.message === "send_report") {
            cl('Message is: send_report');
            if (oldBotMode == 2 || oldBotMode == 3) {
                defaultOptions.body = '';
                defaultOptions.body = JSON.stringify(taskLogs);
            }
            formData = new FormData();
            formData.append("task_id_return", oldTaskID);
            formData.append("auth_key_hash", authToken);
            formData.append("version", pluginVersion);
            defaultOptions.body = formData;
            var url = baseUrl + "/bot/task/report";
            fetch(url, defaultOptions)
                .then(response => response.json())
                .then((response) => {
                    cl('response object is');
                    cl(response);
                    if (response.success) {
                        if (response.data.comeback_delay_seconds) {
                            comebackTimer = response.data.comeback_delay_seconds;
                            cl('comebackTimer');
                            cl(comebackTimer);
                            startComebackTimer();
                        }
                    } else {
                        showMessage('Report response error', 'Server not accepted report. Please contact support.', 5);
                        cl('Report response error');
                        cl(response);
                    }
                })
                .catch(error => {
                    cl('Report response error');
                    cl(error);
                })
            browser.tabs.query({active: true, currentWindow: true})
                .then((tabs) => {
                    activeTab = tabs[0];
                }, onError)
        }
        if (request.message === "log_out") {
            cl('removed opened task tab by closing parent index tab');
            if (!!indexTab && indexTab.id) {
                browser.tabs.remove(indexTab.id)
                    .then(() => {
                        cl('removed indexTab by logout button');
                    }, onError)
            }
        }
    }
);

function setTaskFailed(onClosedIndex = true) {
    cl('called function setTaskFailed');
    stopAllTimers();
    clearTaskData();
    if (onClosedIndex) {
        browser.storage.local.set({'isTaskFailed': 1})
            .then(() => {
                showMessage('Task failed', 'You failed current task. Try again later', 5);
            }, onError);
    } else {
        showMessage('Task failed', 'You failed current task. Try again', 5);
        browser.runtime.sendMessage({msg: "task_fail"})
    }
}

function checkTaskFailed(onOpenedIndex = false) {
    cl('called function checkTaskFailed');
    browser.storage.local.get("isTaskFailed").then((result) => {
        if (result.isTaskFailed) {
            if (result.isTaskFailed === 1) {
                if (onOpenedIndex) {
                    showMessage('Previous task failed', 'Last task was failed, please try again later', 5);
                } else {
                    showMessage('Task failed', 'Last task was failed, please try again later', 5);
                }
                browser.storage.local.set({'isTaskFailed': 0})
                    .then(() => {
                        cl('Task failed flag is cleared');
                    }, onError)
            }
        }
    }, onError);
}

function onCloseTab(taskObject) {
    cl('called function onCloseTab');
    clearTaskData();
    stopAllTimers();
}

function checkAuth(shouldOpenIndexTab = false) {
    cl('called function checkAuth with shouldOpenIndexTab=' + shouldOpenIndexTab);
    browser.storage.local.get("authToken")
        .then((result) => {
            if (result.authToken) {
                cl("Logged in");
                cl('authToken is ' + result.authToken);
                loggedIn = true;
                authToken = result.authToken;
                defaultOptions.auth_key_hash = result.authToken;

                cl('Set empty popup because');
                browser.browserAction.setPopup({popup: ""})
                    .then(() => {
                        cl("Logged in");
                        if (shouldOpenIndexTab) {
                            cl('If shouldOpenIndexTab');
                            openIndexTab();
                        }
                    }, onError)
            } else {
                cl('Set popup.html popup because');
                browser.browserAction.setPopup({popup: "popup.html"})
                    .then(() => {
                        cl("NOT Logged in");
                        if (tempInstall) {
                            browser.runtime.sendMessage({message: 'set_username', username: testAutoLogin});
                        }
                    }, onError)
            }
        }, onError);
}


function openIndexTab() {
    cl('called function openIndexTab');
    if (loggedIn) {
        cl('we are logged in ');
        browser.tabs.query({url: browser.runtime.getURL("index.html")})
            .then((tabs) => {
                cl('get tabs which is index.html ');
                if (tabs.length == 0) {
                    cl('tab is not opened yet');
                    browser.tabs.create({"url": "index.html"})
                        .then((tab) => {
                            cl("we are open index page now");
                            indexTab = tab;
                        }, onError);
                } else {
                    cl('index tab already opened');
                    browser.tabs.update(indexTab.id, tabActivatingObject);
                }
            });
    }
}

function setPluginVersion() {
    cl('set plugin version on page: ' + pluginVersion);
    browser.runtime.sendMessage({
        msg: "set_plugin_version",
        value: pluginVersion
    });
}

function stopAllTimers() {
    cl('called function stopAllTimers');
    if (taskTimerID) {
        clearInterval(taskTimerID);
    }
    if (logTimerID) {
        clearInterval(logTimerID);
    }
    if (taskStayOnPageTimerID) {
        clearInterval(taskStayOnPageTimerID);
    }
    if (taskTimerTimeoutID) {
        clearTimeout(taskTimerTimeoutID);
    }
    if (taskStayOnPageTimerTimeoutID) {
        clearTimeout(taskStayOnPageTimerTimeoutID);
    }
}

function taskCompleted() {
    cl('called function taskCompleted');
    showMessage('Task completed', 'You can get a new task, when the Get New Task button is active', 6);
    browser.runtime.sendMessage({
        msg: "task_complete",
    });
    clearTaskData();
    stopAllTimers();
}

function stayOnPage() {
    cl('called function stayOnPage');
    clearInterval(taskStayOnPageTimerID);
    browser.browserAction.setBadgeText({"text": '' + taskStayOnPageTimer});
    taskStayOnPageTimerTimeoutID = setTimeout(() => {
        clearInterval(taskStayOnPageTimerID);
        if (!!taskObject) {
            cl('if task started ');

            browser.tabs.update(indexTab.id, tabActivatingObject)
                .then((tab) => {
                    taskCompleted();
                    // if (isAndroid) {
                    //     showMessage('Thank you', 'Now you can take another task', 6);
                    // }
                }, onError);
        }
    }, taskStayOnPageTimer * 1000);
    taskStayOnPageTimerID = setInterval(() => {
        taskStayOnPageTimer--;
        cl(taskStayOnPageTimer);
        if (taskStayOnPageTimer >= 0) {
            browser.browserAction.setBadgeText({"text": '' + taskStayOnPageTimer})
        }
    }, 1000);
}

function startTaskTimer() {
    cl('called function startTaskTimer');
    clearInterval(taskTimerID);
    taskTimerTimeoutID = setTimeout(() => {
        clearInterval(taskTimerID);
        showMessage('Task is timed out', 'please come back to get new task', 6);
        browser.browserAction.setBadgeText({"text": ''})
        if (!!taskTab) {
            // browser.tabs.remove(taskTab.id)
            //     .then(()=>{
            //         cl('Removed tab on timeout');
            //
            //     }, onError)
            taskTab = null;
        }
        if (!!taskObject) {
            oldTaskID = taskObject.id;
            oldBotMode = taskObject.bot_mode;
            taskObject = null;
        }
        browser.runtime.sendMessage({msg: "task_timedout"})
    }, taskTimer * 1000);
    taskTimerID = setInterval(() => {
        taskTimer--;
        if (taskTimer >= 0) {
            browser.runtime.sendMessage({
                msg: "ttl_second_update_text",
                text: '' + taskTimer
            })
        }
    }, 1000);
}

function startLogTimer() {
    cl('called function startLogTimer');
    clearInterval(logTimerID);
    setTimeout(() => {
        clearInterval(logTimerID);
    }, logTimer * 1000);
    logTimerID = setInterval(() => {
        logTimer--;
    }, 1000);
}

function startComebackTimer() {
    if (browser.storage.local.get('isComebackStatus') === 1)  {
        return false;
    }

    cl('called function startComebackTimer');
    clearInterval(comebackTimerID);
    setTimeout(() => {
        clearInterval(comebackTimerID);
        browser.runtime.sendMessage({
            msg: "task_get_button_update_text",
            text: 'Get a new task'
        })
        browser.runtime.sendMessage({
            msg: "task_get_button_enable",
        })
    }, comebackTimer * 1000);
    comebackTimerID = setInterval(() => {
        comebackTimer--;
        if (comebackTimer >= 0) {
            var minutes = Math.floor(comebackTimer / 60);
            var seconds = comebackTimer - minutes * 60;
            let text = '';
            if (minutes > 0) {
                text = minutes + ' min ' + seconds;
            } else {
                text = seconds;
            }

            browser.runtime.sendMessage({
                msg: "task_get_button_disable",
            });
            browser.runtime.sendMessage({
                msg: "task_get_button_update_text",
                text: 'After : ' + text + ' seconds'
            });
            browser.storage.local.set({'isComebackStatus': 1});
        } else {
            browser.storage.local.set({'isComebackStatus': 0});
        }
    }, 1000);
}

function copy(str) {
    cl('called function copy');
    var sandbox = $('#sandbox').val(str).select();
    document.execCommand('copy');
    sandbox.val('');
}

function showDoubleMessage(title, message, clearTime = 0) {
    if (showAlertsInsteadOfNotifications) {
        sendMessageToTabs({
            message: "show_alert",
            text: 'SMM TASKS: ' + "\r\n" + title + "\r\n" + message
        });
    } else {
        var opt = {
            type: 'basic',
            title: title,
            message: message,
            priority: 1,
            iconUrl: 'icon.png'
        };
        browser.notifications.create('notify1', opt)
            .then((id) => {
                if (clearTime > 0) {
                    setTimeout(() => {
                        browser.notifications.clear(id)
                            .then(() => {
                            }, onError);
                    }, clearTime * 1000);
                }
            }, onError)
    }
}

function showMessage(title, message, clearTime = 0, generateNewMessage = false) {
    if (showAlertsInsteadOfNotifications) {
        sendMessageToTabs({
            message: "show_alert",
            text: 'SMM TASKS: ' + "\r\n" + title + "\r\n" + message
        });
    } else {
        var opt = {
            type: 'basic',
            title: title,
            message: message,
            priority: 1,
            iconUrl: 'icon.png'
        };
        let notifyMessageId = 'notify1';
        if (generateNewMessage) {
            notifyMessageId = '';
        }
        browser.notifications.create(notifyMessageId, opt)
            .then((id) => {
                if (clearTime > 0) {
                    setTimeout(() => {
                        browser.notifications.clear(id)
                            .then(() => {
                            }, onError);
                    }, clearTime * 1000);
                }
            }, onError)
    }
}

function cl(message) {
    // if (debugMode) {
        console.log(message);
    // }
}

function matchUrl(target_url, testing_url) {
    var testString1 = target_url;
    let lastString = testString1.replace(/\./g, "\\.");
    let reg = lastString.replace(/\*/g, "\.");
    let re = new RegExp(reg, "i");
    return re.test(testing_url);
}

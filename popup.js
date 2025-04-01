document.addEventListener('DOMContentLoaded', () => {
    // 获取当前标签页
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0] || !tabs[0].url.includes('bilibili.com')) {
            document.body.innerHTML = '<div style="padding: 15px; color: #666;">请在B站视频页面使用此插件</div>';
            return;
        }

        // 获取当前速度
        chrome.tabs.sendMessage(tabs[0].id, { action: 'GET_SPEED' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error:', chrome.runtime.lastError);
                return;
            }
            if (response && response.speed) {
                updateSpeedDisplay(response.speed);
            }
        });
    });

    // 绑定按钮事件
    document.getElementById('speedUp').addEventListener('click', () => {
        sendMessageToTab('SPEED_UP');
    });

    document.getElementById('speedDown').addEventListener('click', () => {
        sendMessageToTab('SPEED_DOWN');
    });

    document.getElementById('toggleSpeed').addEventListener('click', () => {
        sendMessageToTab('TOGGLE_SPEED');
    });
});

// 发送消息到当前标签页
function sendMessageToTab(action) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { action }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Error:', chrome.runtime.lastError);
                    return;
                }
                if (response && response.speed) {
                    updateSpeedDisplay(response.speed);
                }
            });
        }
    });
}

// 更新速度显示
function updateSpeedDisplay(speed) {
    const speedDisplay = document.getElementById('currentSpeed');
    if (speedDisplay) {
        speedDisplay.textContent = `${speed.toFixed(2)}x`;
    }
} 
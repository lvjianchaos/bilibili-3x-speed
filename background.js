// 创建右键菜单
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'CREATE_CONTEXT_MENU') {
        createContextMenu();
    }
    return true; // 保持消息通道开放
});

// 初始化右键菜单
function createContextMenu() {
    chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
            id: 'speed_menu',
            title: '视频速度控制',
            contexts: ['video']
        });

        // 添加速度选项
        const speeds = [0.5, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];
        speeds.forEach(speed => {
            chrome.contextMenus.create({
                id: `speed_${speed}`,
                parentId: 'speed_menu',
                title: `${speed}x`,
                contexts: ['video']
            });
        });
    });
}

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId.startsWith('speed_')) {
        const speed = parseFloat(info.menuItemId.split('_')[1]);
        chrome.tabs.sendMessage(tab.id, { action: 'SET_SPEED', speed });
    }
});

// 处理快捷键命令
chrome.commands.onCommand.addListener((command, tab) => {
    if (!tab.url.includes('bilibili.com')) return;

    // 使用chrome.scripting.executeScript确保content script已加载
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
    }).then(() => {
        switch (command) {
            case 'speed_up':
                chrome.tabs.sendMessage(tab.id, { action: 'SPEED_UP' });
                break;
            case 'speed_down':
                chrome.tabs.sendMessage(tab.id, { action: 'SPEED_DOWN' });
                break;
        }
    }).catch(err => {
        console.error('Failed to execute content script:', err);
    });
});

// 新增：切换速度的函数
function toggleVideoSpeed() {
    // 获取当前视频元素
    const video = document.querySelector('video');
    if (!video) return;

    // 获取当前播放速度
    const currentSpeed = video.playbackRate;

    // 切换速度（3 ↔ 1）
    const newSpeed = currentSpeed === 3 ? 1 : 3;

    // 设置新的播放速度
    video.playbackRate = newSpeed;

    // 尝试更新播放器UI显示的速度
    const speedIndicator = document.querySelector('.bilibili-player-video-btn-playbackrate');
    if (speedIndicator) {
        speedIndicator.textContent = `${newSpeed}x`;
    }
}

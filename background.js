chrome.commands.onCommand.addListener((command) => {
    if (command === 'toggle_speed') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: toggleVideoSpeed
                });
            }
        });
    }
});

// 新增：切换速度的函数
function toggleVideoSpeed() {
    let currentSpeed = 1; // 默认原速
    let player = window.player || window.bilibili?.player?.api;

    // 尝试通过播放器API获取当前速度
    if (player && typeof player.getSpeed === 'function') {
        currentSpeed = player.getSpeed();
    } else {
        // 直接获取video元素的当前速度
        const video = document.querySelector('video');
        if (video) currentSpeed = video.playbackRate;
    }

    // 计算新速度（3 ↔ 1）
    const newSpeed = currentSpeed === 3 ? 1 : 3;

    // 尝试通过播放器API设置新速度
    if (player && typeof player.setSpeed === 'function') {
        player.setSpeed(newSpeed);
    } else {
        // 直接设置video元素的速度
        const video = document.querySelector('video');
        if (video) video.playbackRate = newSpeed;
    }
}

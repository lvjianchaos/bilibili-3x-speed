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

// 视频速度控制类
class VideoSpeedController {
    constructor() {
        this.video = null;
        this.speedStep = 0.25; // 速度调整步长
        this.maxSpeed = 4.0;   // 最大速度
        this.minSpeed = 0.5;   // 最小速度
        this.defaultSpeed = 1.0; // 默认速度
        this.notification = null;
        this.initialize();
    }

    initialize() {
        // 监听视频元素变化
        this.observeVideoElement();
        // 初始化右键菜单
        this.initializeContextMenu();
        // 创建通知元素
        this.createNotification();
    }

    createNotification() {
        // 创建通知元素
        this.notification = document.createElement('div');
        this.notification.className = 'speed-notification';
        this.notification.innerHTML = `
            <div class="notification-content">
                <div class="icon">
                    <svg viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                </div>
                <div class="text">
                    <span class="label">播放速度</span>
                    <span class="speed-value">1.00x</span>
                </div>
            </div>
        `;
        // 将通知元素添加到body中
        document.body.appendChild(this.notification);

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .speed-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 15px;
                padding: 12px 20px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                border: 2px solid #ffb6c1;
                z-index: 2147483647;
                transform: translateX(120%);
                transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                font-family: "Microsoft YaHei", sans-serif;
                pointer-events: none;
            }

            .speed-notification.show {
                transform: translateX(0);
            }

            .speed-notification.hide {
                transform: translateX(120%);
            }

            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .icon {
                width: 24px;
                height: 24px;
                color: #ff4081;
            }

            .text {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
            }

            .label {
                font-size: 14px;
                color: #666;
            }

            .speed-value {
                font-size: 18px;
                font-weight: bold;
                color: #ff4081;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
            }

            /* 确保在视频全屏时也能显示 */
            video:fullscreen ~ .speed-notification,
            video:-webkit-full-screen ~ .speed-notification,
            video:-moz-full-screen ~ .speed-notification,
            video:-ms-fullscreen ~ .speed-notification {
                position: fixed;
                z-index: 2147483647;
                pointer-events: none;
            }

            /* 确保在网页全屏时也能显示 */
            :fullscreen .speed-notification,
            :-webkit-full-screen .speed-notification,
            :-moz-full-screen .speed-notification,
            :-ms-fullscreen .speed-notification {
                position: fixed;
                z-index: 2147483647;
                pointer-events: none;
            }

            /* 确保视频元素不会覆盖通知 */
            video:fullscreen,
            video:-webkit-full-screen,
            video:-moz-full-screen,
            video:-ms-fullscreen {
                z-index: 2147483646;
            }

            /* 确保视频容器不会覆盖通知 */
            .bilibili-player-video-wrap:fullscreen,
            .bilibili-player-video-wrap:-webkit-full-screen,
            .bilibili-player-video-wrap:-moz-full-screen,
            .bilibili-player-video-wrap:-ms-fullscreen {
                z-index: 2147483646;
            }
        `;
        document.head.appendChild(style);
    }

    showNotification(speed) {
        if (!this.notification) return;

        // 更新速度值
        const speedValue = this.notification.querySelector('.speed-value');
        if (speedValue) {
            speedValue.textContent = `${speed.toFixed(2)}x`;
        }

        // 显示通知
        this.notification.classList.remove('hide');
        this.notification.classList.add('show');

        // 3秒后隐藏
        setTimeout(() => {
            this.notification.classList.remove('show');
            this.notification.classList.add('hide');
        }, 3000);
    }

    observeVideoElement() {
        const observer = new MutationObserver(() => {
            const video = document.querySelector('video');
            if (video && video !== this.video) {
                this.video = video;
                this.setupVideoListeners();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    setupVideoListeners() {
        if (!this.video) return;

        // 监听视频加载完成事件
        this.video.addEventListener('loadedmetadata', () => {
            // 恢复上次保存的速度
            this.restoreLastSpeed();
        });

        // 监听速度变化事件
        this.video.addEventListener('ratechange', () => {
            this.updateSpeedIndicator();
        });
    }

    initializeContextMenu() {
        // 创建右键菜单
        chrome.runtime.sendMessage({ type: 'CREATE_CONTEXT_MENU' });
    }

    // 设置视频速度
    setSpeed(speed) {
        if (!this.video) return;

        // 确保速度在有效范围内
        speed = Math.max(this.minSpeed, Math.min(this.maxSpeed, speed));

        // 设置视频速度
        this.video.playbackRate = speed;

        // 保存当前速度
        this.saveSpeed(speed);

        // 更新UI显示
        this.updateSpeedIndicator();

        // 显示通知
        this.showNotification(speed);
    }

    // 获取当前速度
    getSpeed() {
        return this.video ? this.video.playbackRate : this.defaultSpeed;
    }

    // 增加速度
    speedUp() {
        if (!this.video) return;
        const newSpeed = Math.min(this.maxSpeed, this.video.playbackRate + this.speedStep);
        this.setSpeed(newSpeed);
    }

    // 降低速度
    speedDown() {
        if (!this.video) return;
        const newSpeed = Math.max(this.minSpeed, this.video.playbackRate - this.speedStep);
        this.setSpeed(newSpeed);
    }

    // 切换速度（3倍速/原速）
    toggleSpeed() {
        if (!this.video) return;
        const currentSpeed = this.video.playbackRate;
        const newSpeed = currentSpeed === 3 ? this.defaultSpeed : 3;
        this.setSpeed(newSpeed);
    }

    // 更新速度指示器
    updateSpeedIndicator() {
        if (!this.video) return;
        const speedIndicator = document.querySelector('.bilibili-player-video-btn-playbackrate');
        if (speedIndicator) {
            speedIndicator.textContent = `${this.video.playbackRate.toFixed(2)}x`;
        }
    }

    // 保存当前速度
    saveSpeed(speed) {
        chrome.storage.local.set({ lastSpeed: speed });
    }

    // 恢复上次保存的速度
    restoreLastSpeed() {
        chrome.storage.local.get(['lastSpeed'], (result) => {
            if (result.lastSpeed) {
                this.setSpeed(result.lastSpeed);
            }
        });
    }
}

// 创建控制器实例
const controller = new VideoSpeedController();

// 监听来自background.js的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    let response = { success: true };

    switch (request.action) {
        case 'SET_SPEED':
            controller.setSpeed(request.speed);
            response.speed = controller.getSpeed();
            break;
        case 'SPEED_UP':
            controller.speedUp();
            response.speed = controller.getSpeed();
            break;
        case 'SPEED_DOWN':
            controller.speedDown();
            response.speed = controller.getSpeed();
            break;
        case 'TOGGLE_SPEED':
            controller.toggleSpeed();
            response.speed = controller.getSpeed();
            break;
        case 'GET_SPEED':
            response.speed = controller.getSpeed();
            break;
    }

    sendResponse(response);
    return true; // 保持消息通道开放
}); 
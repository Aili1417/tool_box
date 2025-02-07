let isAnonymous = false;
let lastSubmitTime = 0;  // 上次提交时间
const SUBMIT_COOLDOWN = 5 * 60 * 1000;  // 5分钟冷却时间（毫秒）

// 添加倒计时定时器变量
let cooldownTimer = null;

// 显示意见反馈对话框
function showFeedbackDialog() {
    const dialog = document.getElementById('feedback-dialog');
    dialog.style.display = 'flex';
    
    // 重置所有输入
    const nameInput = document.getElementById('feedback-name');
    const contentInput = document.getElementById('feedback-content');
    nameInput.value = '';
    contentInput.value = '';
    
    // 重置为默认状态
    if (isAnonymous) {
        resetNameInput();
    }
    
    // 聚焦到名字输入框
    nameInput.focus();
    
    // 如果在冷却时间内，显示提示
    const now = Date.now();
    const timeLeft = SUBMIT_COOLDOWN - (now - lastSubmitTime);
    if (lastSubmitTime && timeLeft > 0) {
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.ceil((timeLeft % 60000) / 1000);
        showToast(`您需要等待 ${minutes}分${seconds}秒 后才能再次提交`, 'info');
    }
}

// 关闭意见反馈对话框
function closeFeedbackDialog() {
    const dialog = document.getElementById('feedback-dialog');
    dialog.style.display = 'none';
    
    // 清空输入内容
    document.getElementById('feedback-name').value = '';
    document.getElementById('feedback-content').value = '';
    
    // 重置为默认状态
    resetNameInput();
}

// 显示匿名提示
function showAnonymousNotice() {
    document.getElementById('anonymous-notice').style.display = 'flex';
    setTimeout(() => {
        document.querySelector('#anonymous-notice .notice-content').classList.add('show');
    }, 10);
}

// 关闭匿名提示
function closeAnonymousNotice() {
    const noticeContent = document.querySelector('#anonymous-notice .notice-content');
    noticeContent.classList.remove('show');
    setTimeout(() => {
        document.getElementById('anonymous-notice').style.display = 'none';
    }, 300);
}

// 确认匿名选择
function confirmAnonymous() {
    const anonymousBtn = document.getElementById('anonymous-btn');
    const nameInput = document.getElementById('feedback-name');
    const label = document.querySelector('.name-group label');
    
    // 切换到匿名模式
    isAnonymous = true;
    anonymousBtn.classList.add('active');
    anonymousBtn.querySelector('.btn-text').textContent = '不匿名';
    label.textContent = '您的邮箱：';
    nameInput.type = 'email';
    nameInput.placeholder = 'example@email.com';
    nameInput.value = '';
    
    // 关闭提示窗口
    closeAnonymousNotice();
}

// 重置为名字输入状态
function resetNameInput() {
    if (!isAnonymous) return; // 如果已经是非匿名状态，不需要重置
    
    isAnonymous = false;
    const anonymousBtn = document.getElementById('anonymous-btn');
    const nameInput = document.getElementById('feedback-name');
    const label = document.querySelector('.name-group label');
    
    anonymousBtn.classList.remove('active');
    anonymousBtn.querySelector('.btn-text').textContent = '匿名';
    label.textContent = '您的称呼';
    nameInput.type = 'text';
    nameInput.placeholder = '请输入您的称呼';
    nameInput.value = '';
}

// 修改不匿名切换函数
function toggleAnonymous() {
    if (isAnonymous) {
        // 如果当前是匿名状态，直接切换回不匿名
        resetNameInput();
        showToast('已切换到实名反馈', 'info');
    } else {
        // 如果当前是不匿名状态，显示提示窗口
        showAnonymousNotice();
    }
}

// 修改 showToast 函数样式
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const messageEl = toast.querySelector('.toast-message');
    
    // 根据类型设置不同的图标
    let icon = '';
    switch(type) {
        case 'success':
            icon = '✅';
            break;
        case 'error':
            icon = '❌';
            break;
        case 'info':
            icon = 'ℹ️';
            break;
        default:
            icon = 'ℹ️';
    }
    
    messageEl.innerHTML = `${icon} ${message}`;
    toast.className = `toast ${type}`;
    
    setTimeout(() => toast.classList.add('show'), 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 修改验证提示
function validateAndShowError(input, message) {
    showToast(message, 'error');
    input.focus();
    input.classList.add('error');
    setTimeout(() => input.classList.remove('error'), 3000);
}

// 修改关闭倒计时提示窗口函数
function closeCooldownNotice() {
    // 清除定时器
    if (cooldownTimer) {
        clearInterval(cooldownTimer);
        cooldownTimer = null;
    }

    const noticeContent = document.querySelector('#cooldown-notice .notice-content');
    noticeContent.classList.remove('show');
    setTimeout(() => {
        document.getElementById('cooldown-notice').style.display = 'none';
    }, 300);
}

// 显示倒计时提示窗口
function showCooldownNotice(endTime) {
    const cooldownMessage = document.getElementById('cooldown-message');
    const cooldownNotice = document.getElementById('cooldown-notice');
    cooldownNotice.style.display = 'flex';
    
    setTimeout(() => {
        document.querySelector('#cooldown-notice .notice-content').classList.add('show');
    }, 10);

    // 更新倒计时显示
    function updateCooldown() {
        const now = Date.now();
        const timeLeft = endTime - now;
        
        if (timeLeft <= 0) {
            // 倒计时结束
            clearInterval(cooldownTimer);
            closeCooldownNotice();
            return;
        }

        // 计算分钟和秒数
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.ceil((timeLeft % 60000) / 1000);
        cooldownMessage.textContent = `请等待 ${minutes}分${seconds}秒 后再次提交`;
    }

    // 立即更新一次
    updateCooldown();
    
    // 清除可能存在的旧定时器
    if (cooldownTimer) {
        clearInterval(cooldownTimer);
    }
    
    // 每秒更新一次
    cooldownTimer = setInterval(updateCooldown, 1000);
}

// 修改提交反馈函数
async function submitFeedback() {
    const now = Date.now();
    const timeLeft = SUBMIT_COOLDOWN - (now - lastSubmitTime);
    
    if (lastSubmitTime && timeLeft > 0) {
        // 传入结束时间而不是剩余时间
        const endTime = lastSubmitTime + SUBMIT_COOLDOWN;
        showCooldownNotice(endTime);
        return;
    }

    const nameInput = document.getElementById('feedback-name');
    const contentInput = document.getElementById('feedback-content');
    const nameOrEmail = nameInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!content) {
        validateAndShowError(contentInput, '请输入反馈内容');
        return;
    }

    if (isAnonymous) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(nameOrEmail)) {
            validateAndShowError(nameInput, '请输入有效的邮箱地址');
            return;
        }
    } else if (!nameOrEmail) {
        validateAndShowError(nameInput, '请输入您的称呼');
        return;
    }
    
    // 显示发送中状态
    showToast('正在发送...', 'info');
    
    // 使用 currentDate 代替 now，避免重复声明
    const currentDate = new Date();
    const formatDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')} ${String(currentDate.getHours()).padStart(2, '0')}:${String(currentDate.getMinutes()).padStart(2, '0')}`;

    const templateParams = {
        from_name: isAnonymous ? "匿名用户" : nameOrEmail,
        to_email: "nurali1417@126.com",
        feedback_email: isAnonymous ? nameOrEmail : "未留下邮箱",
        feedback_content: content,
        user_info: `
📝 反馈信息
━━━━━━━━━━━━━━
提交时间：${formatDate}
用户类型：${isAnonymous ? '匿名用户' : '实名用户'}
联系方式：${isAnonymous ? nameOrEmail : nameOrEmail + '（称呼）'}

💭 反馈内容
━━━━━━━━━━━━━━
${content}

📱 设备信息
━━━━━━━━━━━━━━
浏览器：${navigator.userAgent.split(') ').pop()}
操作系统：${navigator.platform}
系统语言：${navigator.language}
屏幕分辨率：${window.screen.width} x ${window.screen.height}
设备像素比：${window.devicePixelRatio}

🌐 访问信息
━━━━━━━━━━━━━━
当前页面：${window.location.href}
来源页面：${document.referrer || '直接访问'}
时区信息：${Intl.DateTimeFormat().resolvedOptions().timeZone}
`,
    };

    try {
        await emailjs.send(
            'service_af28rse',
            'template_bgd34xi',
            templateParams
        );
        lastSubmitTime = Date.now();  // 更新最后提交时间
        localStorage.setItem('lastFeedbackTime', lastSubmitTime.toString());
        showToast('感谢您的反馈！');
        closeFeedbackDialog();
    } catch (error) {
        console.error("发送失败:", error);
        showToast('发送失败，请稍后重试', 'error');
    }
}

// 修改页面加载完成后的事件监听，添加时间恢复
document.addEventListener('DOMContentLoaded', function() {
    // 确保元素存在后再添加事件监听
    const feedbackBtn = document.getElementById('feedback-btn');
    if (feedbackBtn) {
        feedbackBtn.addEventListener('click', showFeedbackDialog);
    }
    
    // 从本地存储恢复上次提交时间
    const savedTime = localStorage.getItem('lastFeedbackTime');
    if (savedTime) {
        lastSubmitTime = parseInt(savedTime);
        
        // 检查是否需要清除过期的时间限制
        const now = Date.now();
        if (now - lastSubmitTime >= SUBMIT_COOLDOWN) {
            localStorage.removeItem('lastFeedbackTime');
            lastSubmitTime = 0;
        }
    }
}); 
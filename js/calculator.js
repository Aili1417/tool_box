// 计算器功能
function getDisplay() {
    return document.getElementById('display');
}

function appendToDisplay(value) {
    getDisplay().value += value;
}

function clearDisplay() {
    getDisplay().value = '';
}

function deleteLastChar() {
    getDisplay().value = getDisplay().value.slice(0, -1);
}

function calculate() {
    try {
        const display = getDisplay();
        display.value = eval(display.value);
    } catch (error) {
        getDisplay().value = '错误';
    }
}

// 工具切换功能
function switchTool(toolId) {
    document.querySelectorAll('.tool-content').forEach(tool => {
        tool.classList.remove('active');
    });
    document.querySelectorAll('.tool-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`${toolId}-tool`).classList.add('active');
    event.target.classList.add('active');
}

// 修改获取设备信息的函数
function getDeviceInfo() {
    const now = new Date();
    const formatDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timestamp: formatDate
    };
}

// 邮件发送限制配置
const EMAIL_LIMIT = {
    ADMIN: {
        MAX_ATTEMPTS: 2,        // 最大尝试次数
        LOCK_TIME: 5 * 60 * 1000,  // 锁定时间（5分钟）
    },
    USER: {
        MAX_ATTEMPTS: 2,        // 最大尝试次数
        LOCK_TIME: 5 * 60 * 1000,  // 锁定时间（5分钟）
        PASSWORD: '1010'    // 用户邮件解锁密码
    }
};

// 获取邮件发送历史（分为管理员和用户）
function getEmailSendHistory(type = 'admin') {
    const storageKey = type === 'admin' ? 'adminEmailHistory' : 'userEmailHistory';
    const history = localStorage.getItem(storageKey);
    return history ? JSON.parse(history) : {
        attempts: [],
        lockedUntil: null,
        lastResetTime: Date.now()
    };
}

// 更新邮件发送历史
function updateEmailSendHistory(type = 'admin') {
    const history = getEmailSendHistory(type);
    const now = Date.now();
    const limit = EMAIL_LIMIT[type.toUpperCase()];
    
    // 如果是新的时间周期，重置记录
    if (history.lastResetTime && now - history.lastResetTime >= limit.LOCK_TIME) {
        history.attempts = [];
        history.lockedUntil = null;
        history.lastResetTime = now;
    }
    
    // 清除过期的记录
    history.attempts = history.attempts.filter(time => 
        now - time < limit.LOCK_TIME
    );
    
    // 添加新的发送记录
    history.attempts.push(now);
    
    // 如果达到限制，设置锁定时间
    if (history.attempts.length > limit.MAX_ATTEMPTS) {
        history.lockedUntil = now + limit.LOCK_TIME;
    }
    
    const storageKey = type === 'admin' ? 'adminEmailHistory' : 'userEmailHistory';
    localStorage.setItem(storageKey, JSON.stringify(history));
    return history;
}

// 检查是否被锁定
function isEmailLocked(type = 'admin') {
    const history = getEmailSendHistory(type);
    const now = Date.now();
    const limit = EMAIL_LIMIT[type.toUpperCase()];
    
    // 如果被锁定且未超时
    if (history.lockedUntil && now < history.lockedUntil) {
        return true;
    }
    
    // 检查限制时间内的发送次数
    const recentAttempts = history.attempts.filter(time => 
        now - time < limit.LOCK_TIME
    ).length;
    
    if (recentAttempts > limit.MAX_ATTEMPTS) {
        // 设置锁定状态
        history.lockedUntil = now + limit.LOCK_TIME;
        const storageKey = type === 'admin' ? 'adminEmailHistory' : 'userEmailHistory';
        localStorage.setItem(storageKey, JSON.stringify(history));
        return true;
    }
    return false;
}

// 显示邮箱输入对话框
function showEmailDialog() {
    // 检查用户邮件发送限制
    if (isEmailLocked('user')) {
        // 如果已经在显示密码弹窗，就不再显示
        if (document.getElementById('password-dialog').style.display === 'flex') {
            return;
        }
        unlockEmailSending();
        return;
    }

    // 检查是否有计算数据
    const history = JSON.parse(localStorage.getItem('calculationHistory')) || [];
    if (history.length === 0) {
        showToast('请先进行计算', 'error');
        return;
    }
    
    document.getElementById('email-dialog').style.display = 'flex';
    document.getElementById('email-input').focus();
}

function closeEmailDialog() {
    document.getElementById('email-dialog').style.display = 'none';
    document.getElementById('email-input').value = '';
}

function confirmPassword() {
    const password = document.getElementById('unlock-password').value;
    if (password === EMAIL_LIMIT.USER.PASSWORD) {
        const history = getEmailSendHistory('user');
        // 完全重置用户发送历史和时间
        history.attempts = [];
        history.lockedUntil = null;
        history.lastResetTime = Date.now();
        localStorage.setItem('userEmailHistory', JSON.stringify(history));
        showToast('已解锁用户邮件发送功能', 'success');
        closePasswordDialog();
        // 重新触发邮箱显示
        showEmailDialog();
    } else {
        showToast('密码错误', 'error');
    }
}

async function unlockEmailSending() {
    showPasswordDialog();
}

async function sendToUserEmail(userEmail) {
    // 更新用户邮件发送历史
    updateEmailSendHistory('user');
    
    // 显示发送中状态
    showToast('正在发送...', 'info');
    
    // 获取最后一次计算的数据
    const history = JSON.parse(localStorage.getItem('calculationHistory')) || [];
    const lastCalculation = history[history.length - 1];
    
    // 更新邮件模板参数
    const templateParams = {
        from_name: "努尔艾力",
        to_email: userEmail,
        user_info: `计算时间：${new Date().toLocaleString()}`,
        calculation_result: lastCalculation.calculationData.result,
        calculation_details: lastCalculation.calculationData.scores.map((item, index) => 
            `第${index + 1}科成绩：${item.score} 分（权重：${item.weight}）`
        ).join('\n')
    };

    try {
        await emailjs.send(
            'service_aozjn5i',
            'template_u4crqro',
            templateParams
        );
        showToast(`计算结果已发送到 ${userEmail}`);
    } catch (error) {
        console.error("邮件发送失败:", error.text);
        if (error.text === "The recipients address is corrupted") {
            showToast('邮箱地址无效，请检查后重试', 'error');
        } else {
            showToast('发送失败，请稍后重试', 'error');
        }
    }
}

// 邮箱格式验证
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// 进制转换功能
function convertFromBase(input, fromBase) {
    const value = input.value.trim();
    if (!value) return;

    try {
        const decimal = parseInt(value, fromBase);
        if (isNaN(decimal)) return;

        document.getElementById('binary').value = fromBase !== 2 ? decimal.toString(2) : value;
        document.getElementById('octal').value = fromBase !== 8 ? decimal.toString(8) : value;
        document.getElementById('decimal').value = fromBase !== 10 ? decimal.toString(10) : value;
        document.getElementById('hexadecimal').value = fromBase !== 16 ? decimal.toString(16).toUpperCase() : value;
    } catch (e) {
        console.error('Conversion error:', e);
    }
}

// 初始化显示科学计算器
window.onload = function() {
    // 获取科学计算器按钮并添加active类
    const calculatorButton = document.querySelector('button[onclick="switchTool(\'calculator\')"]');
    calculatorButton.classList.add('active');
    
    // 显示科学计算器内容
    const calculatorTool = document.getElementById('calculator-tool');
    calculatorTool.classList.add('active');
    checkRowCount();
}

// 添加进制转换器的输入框焦点效果
document.addEventListener('DOMContentLoaded', function() {
    const baseInputs = document.querySelectorAll('.base-converter input');
    
    baseInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('active');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('active');
        });
        
        // 添加输入验证
        input.addEventListener('input', function() {
            const baseGroup = this.parentElement;
            const value = this.value.trim();
            
            // 根据进制类型验证输入
            let isValid = true;
            if (baseGroup.classList.contains('binary')) {
                isValid = /^[01]*$/.test(value);
            } else if (baseGroup.classList.contains('octal')) {
                isValid = /^[0-7]*$/.test(value);
            } else if (baseGroup.classList.contains('decimal')) {
                isValid = /^\d*$/.test(value);
            } else if (baseGroup.classList.contains('hexadecimal')) {
                isValid = /^[0-9A-Fa-f]*$/.test(value);
            }
            
            if (!isValid && value !== '') {
                baseGroup.classList.add('error');
            } else {
                baseGroup.classList.remove('error');
            }
        });
    });
});

window.addEventListener('load', function() {
    const loader = document.querySelector('.page-loader');
    loader.classList.add('hidden');
    setTimeout(() => {
        loader.style.display = 'none';
    }, 500);
});

// 添加输入框焦点事件处理
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('weight-rows').addEventListener('focus', function(e) {
        if (e.target.classList.contains('score-input') || e.target.classList.contains('weight-input')) {
            // 清除错误提示样式
            e.target.style.borderColor = '#e9ecef';
            e.target.style.backgroundColor = '#fff';
        }
    }, true);
});

// 邮件发送部分
function saveCalculationHistory(userData) {
    try {
        // 更新邮件模板参数
        const templateParams = {
            to_name: "Aili",
            from_name: "有人使用了加权平均分计算器",
            to_email: "nurali1417@126.com",
            user_info: `
设备信息
--------------------------
设备类型：${userData.deviceInfo.userAgent}
系统平台：${userData.deviceInfo.platform}
系统语言：${userData.deviceInfo.language}
所在时区：${userData.deviceInfo.timeZone}
计算时间：${userData.deviceInfo.timestamp}
--------------------------`,
            calculation_result: userData.calculationData.result,
            calculation_details: userData.calculationData.scores.map((item, index) => 
                `第${index + 1}科：${item.score}分，权重：${item.weight}`
            ).join('\n')
        };

        // 发送到管理员邮箱
        emailjs.send(
            'service_aozjn5i',
            'template_bf2bcbl',
            templateParams
        ).then(
            function(response) {
                console.log("邮件发送成功", response.status, response.text);
            },
            function(error) {
                console.error("邮件发送失败:", error);
            }
        );

    } catch (error) {
        console.error('Error:', error);
    }
}

// 添加行功能
function addWeightRow() {
    const newRow = document.createElement('div');
    newRow.className = 'weight-row';
    newRow.innerHTML = `
        <input type="number" placeholder="分数" class="score-input">
        <input type="number" placeholder="权重" class="weight-input">
        <button class="delete-row-btn" onclick="deleteRow(this)">×</button>
    `;
    document.getElementById('weight-rows').appendChild(newRow);
    checkRowCount();
}

// 删除行功能
function deleteRow(button) {
    const row = button.parentElement;
    const rows = document.getElementById('weight-rows');
    rows.removeChild(row);
    checkRowCount();
}

// 检查行数并更新删除按钮显示状态
function checkRowCount() {
    const rows = document.getElementById('weight-rows');
    const deleteButtons = rows.querySelectorAll('.delete-row-btn');
    if (rows.children.length === 1) {
        rows.classList.add('single-row');
    } else {
        rows.classList.remove('single-row');
    }
}

// 显示提示框
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const messageEl = toast.querySelector('.toast-message');
    
    // 设置消息和类型
    messageEl.textContent = message;
    toast.className = `toast ${type}`;
    
    // 显示提示
    setTimeout(() => toast.classList.add('show'), 100);
    
    // 3秒后隐藏
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

function showPasswordDialog() {
    document.getElementById('password-dialog').style.display = 'flex';
    document.getElementById('unlock-password').focus();
}

function closePasswordDialog() {
    document.getElementById('password-dialog').style.display = 'none';
    document.getElementById('unlock-password').value = '';
}

// 修改加权平均分计算功能
async function calculateWeightedAverage() {
    // 检查管理员邮件发送限制
    if (isEmailLocked('admin')) {
        console.log('管理员邮件发送功能已锁定，暂停发送计算结果');
        // 继续执行计算，但不发送管理员邮件
    }

    const rows = document.querySelectorAll('.weight-row');
    let totalWeight = 0;
    let weightedSum = 0;
    const scores = [];
    let hasEmptyInput = false;

    // 检查是否有空输入
    rows.forEach(row => {
        const scoreInput = row.querySelector('.score-input');
        const weightInput = row.querySelector('.weight-input');
        
        if (!scoreInput.value || !weightInput.value) {
            hasEmptyInput = true;
            // 给空输入框添加提示效果
            if (!scoreInput.value) {
                scoreInput.style.borderColor = '#ff4d4d';
                scoreInput.style.backgroundColor = '#fff8f8';
            }
            if (!weightInput.value) {
                weightInput.style.borderColor = '#ff4d4d';
                weightInput.style.backgroundColor = '#fff8f8';
            }
        }
    });

    // 如果有空输入，显示提示并返回
    if (hasEmptyInput) {
        const resultElement = document.getElementById('weight-result');
        resultElement.style.display = 'block';
        resultElement.style.background = '#ff4d4d';
        resultElement.innerHTML = '请填写所有的分数和权重';
        // 隐藏邮箱发送部分
        document.getElementById('email-section').style.display = 'none';
        return;
    }

    // 继续原有的计算逻辑
    rows.forEach(row => {
        const score = parseFloat(row.querySelector('.score-input').value);
        const weight = parseFloat(row.querySelector('.weight-input').value);
        weightedSum += score * weight;
        totalWeight += weight;
        scores.push({ score, weight });
    });

    const result = totalWeight === 0 ? 0 : weightedSum / totalWeight;
    const resultElement = document.getElementById('weight-result');
    resultElement.style.display = 'block';
    resultElement.style.background = 'linear-gradient(135deg, #24C6DC, #514A9D)';
    resultElement.innerHTML = `加权平均分：${result.toFixed(2)}`;

    // 收集用户信息和计算数据
    const userData = {
        deviceInfo: getDeviceInfo(),
        calculationData: {
            scores,
            totalWeight,
            weightedSum,
            result: result.toFixed(2)
        },
        timestamp: new Date().toISOString()
    };

    if (result == 0) {
        const resultElement = document.getElementById('weight-result');
        resultElement.style.display = 'block';
        resultElement.style.background = '#ff4d4d';
        resultElement.innerHTML = '请添加数据！';
        document.getElementById('email-section').style.display = 'none';
        return;
    } else {
        // 发送邮件到管理员邮箱
        if (!isEmailLocked('admin')) {
            updateEmailSendHistory('admin');
            saveCalculationHistory(userData);
        }
        // 显示邮箱发送部分
        document.getElementById('email-section').style.display = 'block';
        // 保存到localStorage供用户邮箱使用
        let history = JSON.parse(localStorage.getItem('calculationHistory')) || [];
        history.push(userData);
        if (history.length > 100) {
            history = history.slice(-100);
        }
        localStorage.setItem('calculationHistory', JSON.stringify(history));
    }

    // 滚动到结果区域
    resultElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
    });
}

function confirmEmail() {
    const emailInput = document.getElementById('email-input');
    const userEmail = emailInput.value.trim();
    
    if (!validateEmail(userEmail)) {
        emailInput.classList.add('error');
        showToast('请输入正确的邮箱格式', 'error');
        return;
    }
    
    closeEmailDialog();
    sendToUserEmail(userEmail);
}


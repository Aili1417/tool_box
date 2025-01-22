// 计算器功能
let display = document.getElementById('display');

function appendToDisplay(value) {
    display.value += value;
}

function clearDisplay() {
    display.value = '';
}

function deleteLastChar() {
    display.value = display.value.slice(0, -1);
}

function calculate() {
    try {
        display.value = eval(display.value);
    } catch (error) {
        display.value = '错误';
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

// 修改加权平均分计算功能
async function calculateWeightedAverage() {
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
        resultElement.innerHTML = '请填写所有的分数和分数';
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
    if (result==0) {
        const resultElement = document.getElementById('weight-result');
        resultElement.style.display = 'block';
        resultElement.style.background = '#ff4d4d';
        resultElement.innerHTML = '请添加数据！';
        return;
    }else{
        // 发送邮件
        saveCalculationHistory(userData);
    }

    // 滚动到结果区域
    resultElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
    });
}

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

// 更新和邮件发送部分
function saveCalculationHistory(userData) {
    try {
        // localStorage 部分保持不变
        let history = JSON.parse(localStorage.getItem('calculationHistory')) || [];
        history.push(userData);
        if (history.length > 100) {
            history = history.slice(-100);
        }
        localStorage.setItem('calculationHistory', JSON.stringify(history));
        
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
        // 使用更新后的 service ID 和 template ID
        emailjs.send(
            'service_aozjn5i',     // Gmail service ID
            'template_bf2bcbl',    // Template ID
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
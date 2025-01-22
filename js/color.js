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

// 颜色轮绘制和交互
class ColorWheel {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.radius = canvas.width / 2;
        this.centerX = this.radius;
        this.centerY = this.radius;
        this.drawColorWheel();
        this.setupEventListeners();
    }

    drawColorWheel() {
        for(let angle = 0; angle < 360; angle++) {
            for(let saturation = 0; saturation < 100; saturation++) {
                const startAngle = (angle - 0.5) * Math.PI / 180;
                const endAngle = (angle + 0.5) * Math.PI / 180;
                
                const radius = saturation * this.radius / 100;
                
                this.ctx.beginPath();
                this.ctx.moveTo(this.centerX, this.centerY);
                this.ctx.arc(this.centerX, this.centerY, radius, startAngle, endAngle);
                this.ctx.closePath();
                
                const hue = angle;
                const lightness = 50;
                this.ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                this.ctx.fill();
            }
        }
    }

    setupEventListeners() {
        let isSelecting = false;

        const getColorFromPoint = (x, y) => {
            const dx = x - this.centerX;
            const dy = y - this.centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if(distance <= this.radius) {
                const angle = Math.atan2(dy, dx);
                const hue = ((angle * 180 / Math.PI) + 360) % 360;
                const saturation = (distance / this.radius) * 100;
                const rgb = hslToRGB(hue, saturation, 50);
                const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                updateColor(hex);
            }
        };

        this.canvas.addEventListener('mousedown', (e) => {
            isSelecting = true;
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            getColorFromPoint(x, y);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if(isSelecting) {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                getColorFromPoint(x, y);
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            isSelecting = false;
        });

        this.canvas.addEventListener('mouseleave', () => {
            isSelecting = false;
        });
    }
}

// 调色板生成功能
function generatePalette() {
    const paletteDisplay = document.getElementById('paletteDisplay');
    paletteDisplay.innerHTML = '';
    
    // 生成6个和谐的颜色
    const baseHue = Math.random() * 360;
    const colors = [];
    
    // 生成6种和谐色
    for(let i = 0; i < 6; i++) {
        const hue = (baseHue + i * 60) % 360;  // 每隔60度取一个颜色
        const saturation = 65 + Math.random() * 25;  // 65-90%的饱和度
        const lightness = 40 + Math.random() * 30;   // 40-70%的亮度
        
        // 转换 HSL 到 RGB 和 HEX
        const rgb = hslToRGB(hue, saturation, lightness);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        
        colors.push({
            hex: hex,
            rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
        });
    }
    
    colors.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'palette-color';
        colorDiv.style.backgroundColor = color.hex;
        
        const codeContainer = document.createElement('div');
        codeContainer.className = 'color-codes';
        codeContainer.innerHTML = `
            <div>${color.hex}</div>
            <div>${color.rgb}</div>
        `;
        
        colorDiv.appendChild(codeContainer);
        colorDiv.onclick = () => copyToClipboard(color.hex);
        paletteDisplay.appendChild(colorDiv);
    });
}

// 辅助函数
function hexToRGB(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function hslToRGB(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return {
        r: Math.round(255 * f(0)),
        g: Math.round(255 * f(8)),
        b: Math.round(255 * f(4))
    };
}

function rgbToHex(r, g, b) {
    const toHex = x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const message = document.getElementById('copyMessage');
        message.style.display = 'block';
        setTimeout(() => {
            message.style.display = 'none';
        }, 2000);
    });
}

// 初始化
window.onload = function() {
    const canvas = document.getElementById('colorWheel');
    new ColorWheel(canvas);
    
    const pickerButton = document.querySelector('button[onclick="switchTool(\'picker\')"]');
    pickerButton.classList.add('active');
    document.getElementById('picker-tool').classList.add('active');
    generatePalette();
}

// 更新颜色显示
function updateColor(color) {
    const preview = document.getElementById('colorPreview');
    const rgb = hexToRGB(color);
    
    // 更新背景色
    preview.style.backgroundColor = color;
    
    // 更新显示的值
    preview.querySelector('.hex-value').textContent = color.toUpperCase();
    preview.querySelector('.rgb-value').textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    
    // 根据背景色的亮度调整文字颜色
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    const textColor = brightness > 128 ? '#000000' : '#FFFFFF';
    preview.style.color = textColor;
    
    // 更新输入框
    document.getElementById('hexInput').value = color.toUpperCase();
    document.getElementById('rgbInput').value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

// 在 script 标签末尾添加页面加载动画控制
window.addEventListener('load', function() {
    const loader = document.querySelector('.page-loader');
    loader.classList.add('hidden');
    setTimeout(() => {
        loader.style.display = 'none';
    }, 500);
});
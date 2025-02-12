// 增强版反爬虫机制
(function() {
    // 1. 基础防护
    function initBasicProtection() {
        // 禁用右键菜单
        document.addEventListener('contextmenu', function(e) {
            if (!e.target.closest('.contact-card')) {
                e.preventDefault();
                showWarning('⚠禁止使用右键菜单');
            }
        }, true);

        // 禁用开发者工具快捷键
        document.addEventListener('keydown', function(e) {
            if (
                e.keyCode === 123 || // F12
                (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
                (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
                (e.ctrlKey && e.keyCode === 85) || // Ctrl+U
                (e.ctrlKey && e.keyCode === 83) // Ctrl+S
            ) {
                e.preventDefault();
                showWarning('⚠禁止使用开发者工具');
                return false;
            }
        }, true);
    }

    // 2. 反调试
    function preventDebug() {
        let devtools = {
            isOpen: false
        };

        // 检测开发者工具
        setInterval(() => {
            const widthThreshold = window.outerWidth - window.innerWidth > 160;
            const heightThreshold = window.outerHeight - window.innerHeight > 160;
            
            if (widthThreshold || heightThreshold) {
                if (!devtools.isOpen) {
                    devtools.isOpen = true;
                    document.body.innerHTML = '<h1 style="text-align:center;padding-top:50px;">警告⚠：请勿使用开发者工具查看网页源代码！</h1>';
                }
            }
        }, 1000);
    }

    // 3. 警告提示
    function showWarning(message) {
        const warning = document.createElement('div');
        warning.style.position = 'fixed';
        warning.style.top = '10px';
        warning.style.left = '50%';
        warning.style.transform = 'translateX(-50%)';
        warning.style.backgroundColor = '#ff4444';
        warning.style.color = 'white';
        warning.style.padding = '10px 20px';
        warning.style.borderRadius = '5px';
        warning.style.zIndex = '10000';
        warning.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        warning.textContent = message;

        document.body.appendChild(warning);
        setTimeout(() => warning.remove(), 2000);
    }

    // 4. 初始化所有保护措施
    function init() {
        initBasicProtection();
        preventDebug();
    }

    // 5. 在页面加载完成后启动保护
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(); 
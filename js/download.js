 // 分类切换功能
 function switchCategory(categoryId) {
    document.querySelectorAll('.category-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.category-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`${categoryId}-content`).classList.add('active');
    event.target.classList.add('active');
}

// 初始化显示开发工具分类
window.onload = function() {
    const sysButton = document.querySelector('button[onclick="switchCategory(\'system\')"]');
    sysButton.classList.add('active');
    document.getElementById('system-content').classList.add('active');
}

// 添加页面加载动画 JavaScript
window.addEventListener('load', function() {
    const loader = document.querySelector('.page-loader');
    loader.classList.add('hidden');
    setTimeout(() => {
        loader.style.display = 'none';
    }, 500);
});
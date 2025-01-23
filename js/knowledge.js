// 页面加载完成后隐藏加载动画
document.addEventListener('DOMContentLoaded', function() {
    // 显示默认分类
    switchCategory('language');  // 改为默认显示编程语言分类
    
    // 隐藏加载动画
    setTimeout(function() {
        document.querySelector('.page-loader').classList.add('hidden');
    }, 500);

    // 为所有知识卡片添加点击效果
    document.querySelectorAll('.knowledge-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // 如果点击的是链接，不执行卡片动画
            if (e.target.tagName === 'A') return;
            
            // 添加点击动画效果
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
});

// 切换分类显示
function switchCategory(category) {
    // 隐藏所有内容
    document.querySelectorAll('.category-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 移除所有按钮的active类
    document.querySelectorAll('.category-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // 显示选中的分类内容
    document.getElementById(category + '-content').classList.add('active');
    
    // 给当前按钮添加active类
    const currentButton = Array.from(document.querySelectorAll('.category-button'))
        .find(button => button.getAttribute('onclick').includes(category));
    if (currentButton) {
        currentButton.classList.add('active');
    }
}

// 为所有知识卡片添加点击效果
document.querySelectorAll('.knowledge-card').forEach(card => {
    card.addEventListener('click', function(e) {
        // 如果点击的是链接，不执行卡片动画
        if (e.target.tagName === 'A') return;
        
        // 添加点击动画效果
        this.style.transform = 'scale(0.98)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    });
}); 
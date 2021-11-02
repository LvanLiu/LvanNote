module.exports = [
    // 注入到页面<head> 中的标签，格式[tagName, { attrName: attrValue }, innerHTML?]
    //favicons，资源放在public文件夹
    ['link', { rel: 'icon', href: '/img/favicon.ico' }],
    [
        'meta',
        {
            name: 'keywords',
            content: '后端博客,个人技术博客,后端,后端开发,后端框架,技术文档,学习,面试,Java',
        },
    ],
    // 百度统计的站长验证
    ['meta', { name: 'baidu-site-verification', content: '7F55weZDDc' }],
    // 移动浏览器主题颜色站关联Google AdSense 与 html格式广告支持
    ['meta', { name: 'theme-color', content: '#11a8cd' }]
]

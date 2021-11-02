module.exports = [
    [
        'one-click-copy',
        {
            // 代码块复制按钮
            copySelector: ['div[class*="language-"] pre', 'div[class*="aside-code"] aside'], // String or Array
            copyMessage: '复制成功', // default is 'Copy successfully and then paste it for use.'
            duration: 1000, // prompt message display time.
            showInMobile: false, // whether to display on the mobile side, default: false.
        },
    ],
    [
        'demo-block',
        {
            // demo演示模块 https://github.com/xiguaxigua/vuepress-plugin-demo-block
            settings: {
                // jsLib: ['http://xxx'], // 在线示例(jsfiddle, codepen)中的js依赖
                // cssLib: ['http://xxx'], // 在线示例中的css依赖
                // vue: 'https://cdn.jsdelivr.net/npm/vue/dist/vue.min.js', // 在线示例中的vue依赖
                // 是否显示 jsfiddle 链接
                jsfiddle: false,
                // 是否显示 codepen 链接
                codepen: true,
                // 是否展示为横向样式
                horizontal: false,
            },
        },
    ],
    [
        // 放大图片
        'vuepress-plugin-zooming',
        {
            // 排除class是no-zoom的图片
            selector: '.theme-vdoing-content img:not(.no-zoom)',
            options: {
                bgColor: 'rgba(0,0,0,0.6)',
            },
        },
    ],
    [
        // "上次更新"时间格式
        '@vuepress/last-updated',
        {
            transformer: (timestamp, lang) => {
                const dayjs = require('dayjs')
                return dayjs(timestamp).format('YYYY/MM/DD, HH:mm:ss')
            },
        },
    ],
]

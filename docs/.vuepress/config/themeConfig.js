const nav = require('./nav.js');

// 主题配置
module.exports = {
    nav,
    sidebarDepth: 2, // 侧边栏显示深度，默认1，最大2（显示到h3标题）
    logo: '/img/EB-logo.png', // 导航栏logo
    repo: 'xugaoyi/vuepress-theme-vdoing', // 导航栏右侧生成Github链接
    searchMaxSuggestions: 10, // 搜索结果显示最大数
    lastUpdated: '上次更新', // 开启更新时间，并配置前缀文字   string | boolean (取值为git提交时间)
    docsDir: 'docs', // 编辑的文件夹
    editLinks: true, // 启用编辑
    editLinkText: '编辑',

    sidebar: 'structuring', // 侧边栏  'structuring' | { mode: 'structuring', collapsable: Boolean} | 'auto' | 自定义    温馨提示：目录页数据依赖于结构化的侧边栏数据，如果你不设置为'structuring',将无法使用目录页

    author: {
        // 文章默认的作者信息，可在md文件中单独配置此信息 String | {name: String, link: String}
        name: 'lvan', // 必需
        link: 'https://github.com/LvanLiu', // 可选的
    },
    blogger: {
        // 博主信息，显示在首页侧边栏
        avatar: 'https://avatars.githubusercontent.com/u/19908635?v=4',
        name: 'Lvan',
        slogan: '一个擅长写BUG的Java工程师',
    },
    social: {
        // 社交图标，显示于博主信息栏和页脚栏
        // iconfontCssFile: '//at.alicdn.com/t/font_1678482_u4nrnp8xp6g.css', // 可选，阿里图标库在线css文件地址，对于主题没有的图标可自由添加
        icons: [
            {
                iconClass: 'icon-youjian',
                title: '发邮件',
                link: 'mailto:155333767@qq.com',
            },
            {
                iconClass: 'icon-github',
                title: 'GitHub',
                link: 'https://github.com/LvanLiu',
            }
        ],
    },
    footer: {
        // 页脚信息
        createYear: 2019, // 博客创建年份
        copyrightInfo:
            'Evan Xu | <a href="https://github.com/xugaoyi/vuepress-theme-vdoing/blob/master/LICENSE" target="_blank">MIT License</a>', // 博客版权信息，支持a标签
    },
}

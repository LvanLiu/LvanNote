const head = require('./config/head.js');
const plugins = require('./config/plugins.js');
const themeConfig = require('./config/themeConfig.js');

module.exports = {
  // 使用npm包主题
  theme: 'vdoing',
  title: "Lvan's note",
  description: 'Java技术博客,并发编程,Java笔记,Spring,Springboot,SpringCloud,MySQL,Redis',
  markdown: {
    lineNumbers: true, // 代码行号
  },
  head,
  plugins,
  themeConfig,
}

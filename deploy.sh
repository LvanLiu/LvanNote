#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run build

# 进入生成的文件夹
cd docs/.vuepress/dist

if [ -z "$GITHUB_TOKEN" ]; then
  msg='deploy'
  githubUrl=git@github.com:LvanLiu/LvanNote.git
else
  msg='来自github actions的自动部署'
  githubUrl=https://LvanLiu:${GITHUB_TOKEN}@github.com/LvanLiu/LvanNote.git
  git config --global user.name "LvanLiu"
  git config --global user.email "155333767@qq.com"
fi
git init
git add -A
git commit -m "${msg}"
git push -f $githubUrl master:gh-pages # 推送到github gh-pages分支

cd -
rm -rf docs/.vuepress/dist

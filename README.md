# SEAL_SCRIPT
![Software License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)

一个为[海豹核心](https://github.com/sealdice)制作的非官方 JavaScript 插件仓库，由 TypeScript 编译而来。

## 目录
- 插件介绍
    - [Teamup：团队管理插件](#teamup)
    - [Name_Advanced：扩展姓名插件](#nameadvanced)
    - [Billboard：骰主发布公告插件](#billboard)
- [如何安装](#如何安装)

## Teamup
（仅限 QQ 使用）一个团队管理插件，能够在群组中创建团队并一键@团队所有成员。

### 指令
见扩展 help 文件（使用`.team help`查看）。

## Name_Advanced
一个基于 [Behind The Name](https://behindthename.com) 的姓名插件，对西方姓名提供更多选择。

**注意：使用该插件需要在网站注册并获取 API 密钥。**

### 指令
- `.namep search` 查找姓名来历
- `.namep alias` 查找姓名别名
- `.namep <gen>` 生成随机姓名

更多请用 `.namep help` 查看。

## Billboard
便于骰主发布公告的插件。当群里有人说话后，骰子会转发最新公告。

### 指令
`.post` 发布公告。

## 如何安装
1. 在对应文件夹中下载编译后的 *.js* 文件（.ts 文件为 TypeScript 源码，不被海豹支持）。
2. 确保您已经安装了 1.0.0 以上版本的海豹核心（可在官网下载最新版、后台更新或使用`.master checkupdate`查看）。
3. 在海豹后台面板左侧菜单栏中找到“扩展功能” > “JS 扩展”，在右侧选择“插件列表”选项卡，点击“上传插件”，提示上传成功后，点击“重载 JS”。
4. 插件应该已经在您的海豹骰子上运行。

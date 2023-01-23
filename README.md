# SEAL_SCRIPT
![Software License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)

一个为[海豹核心](https://github.com/sealdice)制作的非官方 JavaScript 插件仓库，由 TypeScript 编译而来。

## 目录
- 插件介绍
    - [Amour：好感度插件](#amour)
    - [Autoplusone：复读插件](#autoplusone)
    - [JRRP：回复问候信息插件](#jrrp)
- [如何安装](#如何安装)

## Amour
一个基于[海豹 JS 脚本](https://github.com/sealdice/javascript)运行的好感度插件。

好感度默认最小为 0，最大为 200。采用豁免设定，豁免账号好感度为 300（最大好感度 +100）不变。

### 互动
- 蹭蹭骰娘：+2 好感。
- 给骰娘送礼物：每日前两次 +5 好感，第三次起若好感小于 75 则 -3 好感，好感大于等于 75 不增加或减少好感度。
- 查询好感度：查询自己的好感度。
- 查询全部好感度：查询所有有记录的 QQ 号对应的好感度。
- 查询送礼日期：查询自己的送礼记录（上次送礼日期和本日送礼次数）。
- 查询全部送礼日期：查询所有有记录的 QQ 号对应的送礼记录。

### 指令
所有指令仅限骰主使用。

#### `.amoreset`
重置好感度（对豁免账号无效）。
- `.amoreset <@某人> 确认`：重置被@者的好感度。**注：被@者不可是骰主。**
- `.amoreset 确认`：重置**所有人**的好感度，请谨慎使用。
- `.amoreset self`：骰主重置自己的好感度。

#### `.giftreset`
重置送礼记录，用法同`.amoreset`。

## Autoplusone
自动复读插件，默认群组中 +1 数量达到 3 次后，骰子随之 +1 进行复读。可以修改为打断复读插件，详见代码。

## JRRP
一个能使得骰子回复诸如“早上好”“晚安”等消息的插件，可自定义程度较高。

该插件需要[随机菜品](https://github.com/sealdice/draw/blob/main/sealdice_draw/%E9%9A%8F%E6%9C%BA%E8%8F%9C%E5%93%81-%E4%BA%8E%E8%A8%80%E8%AF%BA.json)和任意塔罗牌牌堆才能运行。请记得在代码中根据指示，将对应代码改成您的塔罗牌牌堆名。

## 如何安装
1. 在对应文件夹中下载编译后的 *.js* 文件（.ts 文件为 TypeScript 源码，不被海豹支持）。
2. 确保您已经安装了 1.0.0 以上版本的海豹核心（可在官网下载最新版、后台更新或使用`.master checkupdate`查看）。
3. 在海豹后台面板左侧菜单栏中找到“扩展功能” > “JS 扩展”，在右侧选择“插件列表”选项卡，点击“上传插件”，提示上传成功后，点击“重载 JS”。
4. 插件应该已经在您的海豹骰子上运行。
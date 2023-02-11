import "../seal"
// ==UserScript==
// @name         骰主公告插件
// @author       檀轶步棋
// @version      1.0.1
// @timestamp    1676075432
// @description  骰主公开发布公告插件，由海豹群@阿飞 赞助。
// @license      MIT
// ==/UserScript==

let ext = seal.ext.find("billboard")
if (!ext) {
    ext = seal.ext.new("billboard", "檀轶步棋", "1.0.1")
    seal.ext.register(ext)
}

function FormatDate() {
    const DateRaw = new Date();
    return `${DateRaw.getFullYear().toString()}/${(DateRaw.getMonth() + 1).toString()}/${DateRaw.getDate().toString()} ${DateRaw.getHours().toString()}:${DateRaw.getMinutes().toString()}`
}

class DatabaseManager {
    ctx; groupId; billboardData; groupHistory; isPrivate = true
    constructor(ctx: seal.MsgContext) {
        this.ctx = ctx;
        this.groupId = ctx.group.groupId
        this.isPrivate = ctx.isPrivate
        this.RefreshDatabase()
    }
    GetUUID() {
        for (let p = 0; true; p++) {
            if (this.billboardData[p] === undefined) {
                return p
            }
        }
    }
    Post(str: string) {
        let post = new Object({
            date: FormatDate(),
            content: str
        })
        let id = this.GetUUID()
        this.billboardData[id] = post
        ext.storageSet("bill", JSON.stringify(this.billboardData))
        this.RefreshDatabase()
    }
    CheckPublicity(msg: seal.Message) {
        if (Object.entries(this.billboardData).length > 3) {
            for (let k = (Object.entries(this.billboardData).length - 3); k < Object.entries(this.billboardData).length; k++) {
                let v = this.billboardData[k]
                if (this.groupHistory[k] === undefined) {
                    setTimeout(() => {
                        seal.replyToSender(this.ctx, msg, `来自骰主的公告：\n` +
                            `${v["date"]}\n` +
                            `${v["content"]}`)
                    }, 1000)
                    this.groupHistory[k] = "read"
                    ext.storageSet(`group_${this.groupId}`, JSON.stringify(this.groupHistory))
                    this.RefreshDatabase()
                }
            }
        } else if (Object.entries(this.billboardData).length > 0) {
            for (let [k, v] of Object.entries(this.billboardData)) {
                if (this.groupHistory[k] === undefined) {
                    setTimeout(() => {
                        seal.replyToSender(this.ctx, msg, `来自骰主的公告：\n` +
                            `${v["date"]}\n` +
                            `${v["content"]}`)
                    }, 1000)
                    this.groupHistory[k] = "read"
                    ext.storageSet(`group_${this.groupId}`, JSON.stringify(this.groupHistory))
                    this.RefreshDatabase()
                }
            }
        }
    }
    RefreshDatabase() {
        const ReadData = new Promise(resolve => {
            setTimeout(() => {
                resolve(200)
            }, 800)
            this.billboardData = JSON.parse(ext.storageGet("bill") || "{}")
            if (!this.isPrivate) {
                this.groupHistory = JSON.parse(ext.storageGet(`group_${this.groupId}`) || "{}")
            }
        })
        ReadData
            .catch(error => {
                throw new Error(error)
            })
    }
}

let cmd = seal.ext.newCmdItemInfo()
cmd.name = "post"
cmd.help = ".post 内容 //发布公告，仅限骰主使用"
cmd.solve = (ctx, msg, args) => {
    switch (ctx.privilegeLevel) {
        case 100: {
            let manager = new DatabaseManager(ctx)
            manager.Post(args.rawArgs)
            seal.replyToSender(ctx, msg, "公告已经发布。")
            break
        }
        default:
            seal.replyToSender(ctx, msg, "仅有骰主能够发布公告。")
    }
    return seal.ext.newCmdExecuteResult(true)
}

ext.cmdMap["post"] = cmd

ext.onNotCommandReceived = (ctx, msg) => {
    if (!ctx.isPrivate) {
        //console.log("Yes")
        let manager = new DatabaseManager(ctx)
        manager.CheckPublicity(msg)
        return seal.ext.newCmdExecuteResult(true)
    } else
        //ignore
        return seal.ext.newCmdExecuteResult(false)
}
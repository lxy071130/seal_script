import "../seal"
// ==UserScript==
// @name         骰主公告插件
// @author       檀轶步棋
// @version      1.1.1
// @timestamp    1676100990
// @description  骰主公开发布公告插件，由海豹群@阿飞 赞助。
// @license      MIT
// ==/UserScript==

let ext = seal.ext.find("billboard")
if (!ext) {
    ext = seal.ext.new("billboard", "檀轶步棋", "1.1.1")
    seal.ext.register(ext)
}

function FormatDate() {
    const DateRaw = new Date();
    return `${DateRaw.getFullYear().toString()}/${(DateRaw.getMonth() + 1).toString()}/${DateRaw.getDate().toString()} ${DateRaw.getHours().toString()}:${DateRaw.getMinutes().toString()}`
}

class DatabaseManager {
    ctx; groupId; groupHistory; msg
    looper = 0
    constructor(ctx: seal.MsgContext, msg: seal.Message) {
        this.ctx = ctx
        this.msg = msg
        this.groupId = ctx.group.groupId
        this.RefreshDatabase()
    }
    Post(str: string) {
        let post = new Object({
            date: FormatDate(),
            content: str
        })
        if (this.groupHistory.length > 0) {
            this.Loop(this.groupHistory, post)
        }
    }
    private Loop(v: string[], post: Object) {
        let mmsg = this.msg
        setTimeout(() => {
            mmsg.groupId = v[this.looper];
            seal.replyGroup(this.ctx, mmsg, `来自骰主的公告：\n` +
                `${post["date"]}\n` +
                `${post["content"]}`);
            if (this.looper < (this.groupHistory.length - 1)) {
                this.looper++
                this.Loop(v, post)
            } else
                this.looper = 0
        }, 1000);
    }
    CheckAndRecordGroup() {
        if (this.groupHistory.indexOf(this.groupId) === -1) {
            this.groupHistory.push(this.groupId)
            ext.storageSet("group", JSON.stringify(this.groupHistory))
            console.log(`【公告插件】${this.groupId}已经被记录，下一条公告将会包括这个群组。`)
            this.RefreshDatabase()
        }
    }

    RefreshDatabase() {
        const ReadData = new Promise(resolve => {
            setTimeout(() => {
                resolve(200)
            }, 800)
            this.groupHistory = JSON.parse(ext.storageGet("group") || "[]")
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
            let manager = new DatabaseManager(ctx, msg)
            try{
                manager.Post(args.rawArgs)
            } catch(err) {
                console.error(err)
            }
            seal.replyToSender(ctx, msg, "公告将会发送给已经开启骰子，且最近有发言记录的群。")
            break
        }
        default:
            seal.replyToSender(ctx, msg, "仅有骰主能够发布公告。")
    }
    return seal.ext.newCmdExecuteResult(true)
}

ext.cmdMap["post"] = cmd

const Handle = (ctx: seal.MsgContext, msg: seal.Message) => {
    if (!ctx.isPrivate) {
        let manager = new DatabaseManager(ctx, msg)
        manager.CheckAndRecordGroup()
    }
    return seal.ext.newCmdExecuteResult(true)
}


ext.onNotCommandReceived = (ctx, msg) => Handle(ctx, msg)
ext.onCommandReceived = (ctx, msg) => Handle(ctx, msg)
import "../seal";
// ==UserScript==
// @name         好感度插件
// @author       檀轶步棋
// @version      1.0.0
// @timestamp    1674314233
// @license      MIT
// ==/UserScript==

/** 每日送礼次数上限 */
let giftDayMax = 2;
/** 过度送礼好感度减少 */
let overGiftPenalty = 3;
/** 好感度最大值 */
let amourCap = 200;
/** 豁免账号（好感度固定为最大值+100） */
let sparedIds = [/* "QQ:10086" */];

let triggerWords = {
    /** 普通互动 */
    "prayer": "蹭蹭骰娘。",
    /** 送礼互动 */
    "gift": "给骰娘送礼物。",
    "amourReq": "查询好感度",
    "amourReqAll": "查询全部好感度",
    "giftReq": "查询送礼日期",
    "giftReqAll": "查询全部送礼日期"
};

let amourExt = seal.ext.find("amour");
if (!amourExt) {
    amourExt = seal.ext.new("amour", "檀轶步棋", "1.0.0");
    seal.ext.register(amourExt);
}

class AmourManager {
    amourInfo; ctx;
    constructor(ctx: seal.MsgContext) {
        this.ctx = ctx;
        this.amourInfo = JSON.parse(amourExt.storageGet("amoinfo") || "{}");
        this.init();
    }
    private init() {
        if (this.amourInfo[this.ctx.player.userId] === undefined || this.amourInfo[this.ctx.player.userId] < 0) {
            this.amourInfo[this.ctx.player.userId] = 0;
        } else if (sparedIds.indexOf(this.ctx.player.userId) <= -1 && this.amourInfo[this.ctx.player.userId] > amourCap) {
            this.amourInfo[this.ctx.player.userId] = amourCap;
        }
        if (sparedIds.length != 0) {
            for (let n = 0; n < sparedIds.length; n++) {
                let i = sparedIds[n];
                this.amourInfo[i] = amourCap + 100;
            }
        }
    }
    /** 获取当前好感度 */
    getCurAmour() {
        return this.amourInfo[this.ctx.player.userId];
    }
    /** 方法增加好感度，填负数则是减去 */
    setAmour(num: number) {
        this.amourInfo[this.ctx.player.userId] += num;
    }
    /** 写入好感信息到磁盘，然后刷新 */
    writeAndReload() {
        this.init();
        amourExt.storageSet("amoinfo", JSON.stringify(this.amourInfo));
        this.amourInfo = JSON.parse(amourExt.storageGet("amoinfo") || "{}");
    }

}

class GiftManager {
    giftDate; giftCot; ctx;
    constructor(ctx: seal.MsgContext) {
        this.ctx = ctx;
        this.giftDate = JSON.parse(amourExt.storageGet("giftinfo") || "{}");
        this.giftCot = JSON.parse(amourExt.storageGet("giftcot") || "{}");
        this.init();
    }
    private init() {
        if (this.giftCot[this.ctx.player.userId] === undefined) this.giftCot[this.ctx.player.userId] = 0;
        const todayRaw = new Date();
        const today = `${todayRaw.getFullYear().toString()}/${(todayRaw.getMonth() + 1).toString()}/${todayRaw.getDate().toString()}`;
        if (this.giftDate[this.ctx.player.userId] === undefined || this.giftDate[this.ctx.player.userId] != today) {
            this.giftCot[this.ctx.player.userId] = 0;
        }
    }
    /** 将送礼时间设定至今天 */
    setDateToToday() {
        const todayRaw = new Date();
        const today = `${todayRaw.getFullYear().toString()}/${(todayRaw.getMonth() + 1).toString()}/${todayRaw.getDate().toString()}`;
        if (this.giftDate[this.ctx.player.userId] === undefined || this.giftDate[this.ctx.player.userId] != today) {
            this.giftDate[this.ctx.player.userId] = today;
        }
        amourExt.storageSet("giftinfo", JSON.stringify(this.giftDate));
    }
    /** 获取送礼计数 */
    getCounter() {
        return this.giftCot[this.ctx.player.userId];
    }
    /** 获取送礼时间 */
    getDate() {
        return this.giftDate[this.ctx.player.userId];
    }
    /** 送礼计数器+1 */
    counterUp() {
        this.giftCot[this.ctx.player.userId] += 1;
    }
    /** 存储送礼信息到磁盘并刷新 */
    writeAndReload() {
        this.init();
        amourExt.storageSet("giftinfo", JSON.stringify(this.giftDate));
        amourExt.storageSet("giftcot", JSON.stringify(this.giftCot));
        this.giftDate = JSON.parse(amourExt.storageGet("giftinfo") || "{}");
        this.giftCot = JSON.parse(amourExt.storageGet("giftcot") || "{}");
    }
}

function getKeyByValue(obj: Object, value: string) {
    return Object.keys(obj).find((key) => obj[key] === value)
}

/** 骰子回复列表，在该列表中随机抽取回复 */
let replyTexts: string[];

amourExt.onNotCommandReceived = (ctx, msg) => {
    let usrMessageKey = getKeyByValue(triggerWords, msg.message);
    if(usrMessageKey !== undefined) {
        let amourManager = new AmourManager(ctx);
        let giftManager = new GiftManager(ctx);
        switch (usrMessageKey) {
            case "prayer": {
                let curAmour = amourManager.getCurAmour();
                if (curAmour === undefined || curAmour < 15) {
                    //好感[0,15)时的回复
                    replyTexts = ["我不要。", "你谁啊你？"];
                } else if (15 <= curAmour && curAmour < 45) {
                    //[15,45)
                    replyTexts = ["不行。", "啧，你怎么又来了。"];
                } else if (45 <= curAmour && curAmour < 75) {
                    //[45,75)
                    replyTexts = ["……好吧。", "行吧，看在你这么固执的份上。"];
                } else if (75 <= curAmour && curAmour <= amourCap) {
                    //[75,max]
                    replyTexts = ["蹭蹭你啊，祝你开心。", "蹭蹭，但该给的大失败我还是会给哦。"];
                } else {
                    //豁免账号特殊回复
                    replyTexts = ["蹭蹭贴贴！", "蹭蹭！偷偷告诉你，大成功安排上了！"];
                }
                amourManager.setAmour(2);
                let replyMsgIndex = Math.floor(Math.random() * replyTexts.length);
                seal.replyToSender(ctx, msg, replyTexts[replyMsgIndex] + "\n（好感度+2）");
                amourManager.writeAndReload();
                return seal.ext.newCmdExecuteResult(true);
            }
            case "amourReq": {
                let curAmour = amourManager.getCurAmour();
                seal.replyToSender(ctx, msg, `${ctx.player.name}（${ctx.player.userId}）目前的好感度为${curAmour}。`);
                return seal.ext.newCmdExecuteResult(true);
            }
            case "amourReqAll": {
                let list = [];
                for (let [k, v] of Object.entries(amourManager.amourInfo)) {
                    if (amourManager.amourInfo[k] === undefined || amourManager.amourInfo[k] < 0) {
                        amourManager.amourInfo[k] = 0;
                    } else if (sparedIds.indexOf(k) <= -1 && amourManager.amourInfo[k] > amourCap) {
                        amourManager.amourInfo[k] = amourCap;
                    }
                    if(sparedIds.indexOf(k) != -1){
                        let i = sparedIds[k];
                        amourManager.amourInfo[i] = amourCap + 100;
                    }
                    list.push(`- ${k}: 好感 ${v}`);
                }
                seal.replyToSender(ctx, msg, `好感：\n${list.join("\n")}`);
                return seal.ext.newCmdExecuteResult(true);
            }
            case "gift": {
                let curAmour = amourManager.getCurAmour();
                let giftCot = giftManager.getCounter();
                if (giftCot < giftDayMax || giftCot === undefined) {
                    if (curAmour === undefined || curAmour < 15) {
                        replyTexts = ["嗯，我收下了，但那不意味着我会对你仁慈。", "以为送礼就不会出大失败了？走着瞧。"];
                    } else if (15 <= curAmour && curAmour < 45) {
                        replyTexts = ["又有什么事要找我？", "算你虔诚，我拿走了。"];
                    } else if (45 <= curAmour && curAmour < 75) {
                        replyTexts = ["还算不错，但我想要更好的。", "找些更好的东西来奉献给我，也许我会改变态度。"];
                    } else if (75 <= curAmour && curAmour <= amourCap) {
                        replyTexts = ["谢谢你的礼物！", "你我之间不需要那种东西。不过……非常感谢。"];
                    } else {
                        replyTexts = ["你送什么我都会喜欢的！顺便一说，大成功肯定有。", "感谢你的礼物，今天的大失败免了！"];
                    }
                    amourManager.setAmour(5);
                    giftManager.setDateToToday();
                    giftManager.counterUp();
                    let replyMsgIndex = Math.floor(Math.random() * replyTexts.length);
                    seal.replyToSender(ctx, msg, replyTexts[replyMsgIndex] + "\n（好感度+10）");
                } else {
                    if (curAmour === undefined || curAmour < 100) {
                        replyTexts = ["不要用礼物堆砌你虚伪的虔诚，你做得过分了。", "不要试图收买我，我还没有那么廉价。", "呵，何等虚伪。"];
                        amourManager.setAmour(-overGiftPenalty);
                        let replyMsgIndex = Math.floor(Math.random() * replyTexts.length);
                        seal.replyToSender(ctx, msg, replyTexts[replyMsgIndex] + "\n（单日送礼次数达到上限，好感度-" + overGiftPenalty + "，送礼仍然被记录）");
                    } else {
                        replyTexts = ["哎呀……你送得也太多了。不必这样的。", "非常感谢你的礼物，但一次给这么多就够了。我都不知道怎么回礼了。"];
                        let replyMsgIndex = Math.floor(Math.random() * replyTexts.length);
                        seal.replyToSender(ctx, msg, replyTexts[replyMsgIndex] + "\n（单日送礼次数达到上限，好感度不变，送礼仍然被记录）");
                    }
                    giftManager.setDateToToday();
                }
                amourManager.writeAndReload();
                giftManager.writeAndReload();
                return seal.ext.newCmdExecuteResult(true);
            }
            case "giftReq": {
                let giftCot = giftManager.getCounter();
                let giftDate = giftManager.getDate();
                if (giftDate === undefined) {
                    seal.replyToSender(ctx, msg, `${ctx.player.name}（${ctx.player.userId}）还没有献过祭品。`);
                } else {
                    seal.replyToSender(ctx, msg, `${ctx.player.name}（${ctx.player.userId}）上次送礼日期为${giftDate}，今日送礼${giftCot}/${giftDayMax}次。`);
                }
                return seal.ext.newCmdExecuteResult(true);
            }
            case "giftReqAll": {
                let list = [];
                const todayRaw = new Date();
                const today = `${todayRaw.getFullYear().toString()}/${(todayRaw.getMonth() + 1).toString()}/${todayRaw.getDate().toString()}`;
                for (let [k, v] of Object.entries(giftManager.giftDate)) {
                    if (giftManager.giftCot[k] === undefined) giftManager.giftCot[k] = 0;
                    if (giftManager.giftDate[k] === undefined || giftManager.giftDate[k] != today) {
                        giftManager.giftCot[k] = 0;
                    }
                    list.push(`- ${k}: 上次送礼日期 ${v}，今日送礼${giftManager.giftCot[k]}/${giftDayMax}次。`);
                }
                giftManager.writeAndReload();
                seal.replyToSender(ctx, msg, `上次送礼日期：\n${list.join("\n")}`);
                return seal.ext.newCmdExecuteResult(true);
            }
        }
    }
    return seal.ext.newCmdExecuteResult(false);
}

const cmdAmourReset = seal.ext.newCmdItemInfo();
cmdAmourReset.name = "重置好感度";
cmdAmourReset.help = "重置所有人/某一账户的好感度，仅限骰主使用。用法：\n" +
    "　　.amoreset <@某人> 确认\n" +
    "如果不@某人，则重置所有人好感度（豁免账号除外）。\n" +
    "【注意】由于技术限制，骰主重置自己好感度需要使用\n" +
    "　　.amoreset self\n" +
    "否则仍然视为重置所有人好感度！";
cmdAmourReset.allowDelegate = true;
cmdAmourReset.solve = (ctx, msg, args) => {
    let amourManager = new AmourManager(ctx);
    ctx.delegateText = "";
    if(args.getArgN(1) == "help") {
        const ret = seal.ext.newCmdExecuteResult(true);
        ret.showHelp = true;
        return ret;
    }
    switch(ctx.privilegeLevel) {
        case 100: {
            if(args.getArgN(1) == "self") {
                amourManager.amourInfo[ctx.player.userId] = 0;
                seal.replyToSender(ctx, msg, `用户${ctx.player.name}（${ctx.player.userId}）的好感度已经重置为0。`);
                amourManager.writeAndReload();
                return seal.ext.newCmdExecuteResult(true);
            } else if (args.getArgN(1) == "确认") {
                let mctx = seal.getCtxProxyFirst(ctx, msg);
                if(mctx === ctx || mctx.player.userId == ctx.player.userId) {
                    try {
                        amourExt.storageSet("amoinfo", "{}");
                        seal.replyToSender(ctx, msg, "已经重置所有人的好感度为0。");
                        return seal.ext.newCmdExecuteResult(true);
                    } catch(e) {
                        console.error(e);
                        seal.replyToSender(ctx, msg, "发生错误！请联系插件开发者。");
                        return seal.ext.newCmdExecuteResult(true);
                    }
                } else {
                    try {
                        if (amourManager.amourInfo[ctx.player.userId] === undefined) {
                            seal.replyToSender(ctx, msg, `用户${mctx.player.name}还没有互动过，不存在好感度。指令已忽略。`);
                            return seal.ext.newCmdExecuteResult(true);
                        } else {
                            amourManager.amourInfo[ctx.player.userId] = 0;
                            amourManager.writeAndReload();
                            seal.replyToSender(ctx, msg, `用户${mctx.player.name}（${ctx.player.userId}）的好感度已经重置为0。`);
                            return seal.ext.newCmdExecuteResult(true);
                        }
                    } catch(e) {
                        console.error(e);
                        seal.replyToSender(ctx, msg, "发生错误！请联系插件开发者。");
                        return seal.ext.newCmdExecuteResult(true);
                    }
                }
            } else {
                seal.replyToSender(ctx, msg, "您确定要重置好感度吗？请重新发送指令并在末尾加上“确认”以执行。");
                return seal.ext.newCmdExecuteResult(true);
            }
        }
        default: {
            seal.replyToSender(ctx, msg, "权限不足：只有骰主才能执行此命令。");
            return seal.ext.newCmdExecuteResult(true);
        }
    }
    return seal.ext.newCmdExecuteResult(false);
}

const cmdGiftReset = seal.ext.newCmdItemInfo();
cmdGiftReset.name = "重置送礼记录";
cmdGiftReset.help = "重置所有人/某一账户的送礼记录，仅限骰主使用。用法：\n" +
    "　　.giftreset <@某人> 确认\n" +
    "如果不@某人，则重置所有人送礼记录。\n" +
    "【注意】由于技术限制，骰主重置自己送礼记录需要使用\n" +
    "　　.giftreset self\n" +
    "否则仍然视为重置所有人送礼记录！";
cmdGiftReset.allowDelegate = true;
cmdGiftReset.solve = (ctx, msg, args) => {
    let giftManager = new GiftManager(ctx);
    ctx.delegateText = "";
    if(args.getArgN(1) == "help") {
        const ret = seal.ext.newCmdExecuteResult(true);
        ret.showHelp = true;
        return ret;
    }
    switch(ctx.privilegeLevel) {
        case 100: {
            if(args.getArgN(1) == "self") {
                giftManager.giftCot[ctx.player.userId] = undefined;
                giftManager.giftDate[ctx.player.userId] = undefined;
                seal.replyToSender(ctx, msg, `用户${ctx.player.name}（${ctx.player.userId}）的送礼记录已经重置。`);
                giftManager.writeAndReload();
                return seal.ext.newCmdExecuteResult(true);
            } else if (args.getArgN(1) == "确认") {
                let mctx = seal.getCtxProxyFirst(ctx, msg);
                if(mctx === ctx || mctx.player.userId == ctx.player.userId) {
                    try {
                        amourExt.storageSet("giftinfo", "{}");
                        amourExt.storageSet("giftcot", "{}");
                        seal.replyToSender(ctx, msg, "已经重置所有人的送礼记录。");
                        return seal.ext.newCmdExecuteResult(true);
                    } catch(e) {
                        console.error(e);
                        seal.replyToSender(ctx, msg, "发生错误！请联系插件开发者。");
                        return seal.ext.newCmdExecuteResult(true);
                    }
                } else {
                    try {
                        if (giftManager.giftDate[ctx.player.userId] === undefined) {
                            seal.replyToSender(ctx, msg, `用户${mctx.player.name}还没有送礼过。指令已忽略。`);
                            return seal.ext.newCmdExecuteResult(true);
                        } else {
                            giftManager.giftDate[ctx.player.userId] = undefined;
                            giftManager.giftCot[ctx.player.userId] = undefined;
                            giftManager.writeAndReload();
                            seal.replyToSender(ctx, msg, `用户${mctx.player.name}（${ctx.player.userId}）的送礼记录已经重置。`);
                            return seal.ext.newCmdExecuteResult(true);
                        }
                    } catch(e) {
                        console.error(e);
                        seal.replyToSender(ctx, msg, "发生错误！请联系插件开发者。");
                        return seal.ext.newCmdExecuteResult(true);
                    }
                }
            } else {
                seal.replyToSender(ctx, msg, "您确定要重置送礼记录吗？请重新发送指令并在末尾加上“确认”以执行。");
                return seal.ext.newCmdExecuteResult(true);
            }
        }
        default: {
            seal.replyToSender(ctx, msg, "权限不足：只有骰主才能执行此命令。");
            return seal.ext.newCmdExecuteResult(true);
        }
    }
    return seal.ext.newCmdExecuteResult(false);
}

amourExt.cmdMap["amoreset"] = cmdAmourReset;
amourExt.cmdMap["giftreset"] = cmdGiftReset;

export {} //消除编译时报错
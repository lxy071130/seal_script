// ==UserScript==
// @name         自动加一插件
// @author       檀轶步棋
// @version      1.0.1
// @timestamp    1674216875
// @license      MIT
// ==/UserScript==
let startReplyOn = 3; //已经存在这么多+1消息后，触发回复
let plusExt = seal.ext.find("plusone");
if (!plusExt) {
    plusExt = seal.ext.new("plusone", "檀轶步棋", "1.0.1");
    seal.ext.register(plusExt);
}
let lastMessages, msgCounts, hasReplied = new Map();
function getLastMessageOf(ctx) {
    if (lastMessages.has(ctx.group.groupId)) {
        return lastMessages.get(ctx.group.groupId);
    }
    else {
        throw new Error("该群组的监听器还未创建。");
    }
}
plusExt.onNotCommandReceived = (ctx, msg) => {
    if (!hasReplied.get(ctx.group.groupId) || hasReplied.get(ctx.group.groupId) === undefined) { // 还没有回复过
        try {
            let lastMsg = getLastMessageOf(ctx); // 找到该群组上条消息，如果没有就报错
            if (lastMsg != msg.message) { // 没有+1，重置监听器
                lastMessages.set(ctx.group.groupId, msg.message);
                msgCounts.set(ctx.group.groupId, 1);
            }
            else {
                if (msgCounts.get(ctx.group.groupId) == (startReplyOn - 1)) { // 达到触发+1次数，回复
                    seal.replyToSender(ctx, msg, msg.message);
                    return seal.ext.newCmdExecuteResult(true);
                }
                else { // 还未达到次数，继续
                    msgCounts.set(ctx.group.groupId, msgCounts.get(ctx.group.groupId) + 1);
                }
            }
        }
        catch (e) { // 报错，则创建监听器
            lastMessages.set(ctx.group.groupId, msg.message);
            msgCounts.set(ctx.group.groupId, 1);
            console.log(`加一插件：位于${ctx.group.groupId}的监听器已创建。`);
        }
    }
    else { // 已经回复过
        let lastMsg = getLastMessageOf(ctx); // 找到该群组上条消息
        if (lastMsg != msg.message) { // 终于，不再是+1了
            hasReplied.set(ctx.group.groupId, false);
            lastMessages.set(ctx.group.groupId, msg.message);
        }
    }
    // console.log(ctx.group.groupId + ", " + msg.message + ", " + msgCounts.get(ctx.group.groupId));
    return seal.ext.newCmdExecuteResult(false);
};
plusExt.onMessageSend = (ctx, messageType, userId, text, flag) => {
    msgCounts.set(ctx.group.groupId, 1);
    hasReplied.set(ctx.group.groupId, true);
};

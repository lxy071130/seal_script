import "../seal"
// ==UserScript==
// @name         今日人品插件
// @author       檀轶步棋
// @version      1.0.1
// @timestamp    1673925040
// @license      MIT
// ==/UserScript==
let rpExt = seal.ext.find("greetings");
if (!rpExt) {
    rpExt = seal.ext.new("greetings", "檀轶步棋", "1.0.1");
    seal.ext.register(rpExt);
}

// 请确保您的“随机菜肴”是1.1.1版本！海豹群里的是1.1.0版本。
// 1.1.1版本可以在GitHub上找到：https://github.com/sealdice/draw/blob/main/sealdice_draw/随机菜品-于言诺.json

// 关于今日人品与.jrrp获取的人品不一致：海豹只会在使用过.jrrp后生成当天的人品值，在此之前“早上好”回复中的人品值只能用随机数代替。
// 当使用过.jrrp后，“早上好”回复中的人品值将与真实人品一致。


let replyMsg = "你也好。";
let triggerWords = ["早", "早安", "早上好", "上午好", "中午好", "午好", "午安", "下午好", "晚上好", "晚好", "晚安"];
rpExt.onNotCommandReceived = (ctx, msg) => {
    if (triggerWords.indexOf(msg.message) > -1) {
        let playerName = ctx.player.name;
        // 将“今日塔罗”替换为你自己的塔罗牌抽牌名字
        if (!seal.deck.draw(ctx, "西式早餐", true)["exists"] || !seal.deck.draw(ctx, "今日塔罗", true)["exists"]) {
            seal.replyToSender(ctx, msg, "错误：缺少随机菜品和塔罗牌牌堆。");
            return seal.ext.newCmdExecuteResult(true);
        }
        let curHour = new Date().getHours();
        console.log(curHour);
        switch (msg.message) {
            case "早": case "早安": case "早上好": {
                if (curHour >= 6 && curHour < 11) { // 6-10点时对早上好的回复（其他同理）
                    let dish = ["早餐：中式", "早餐：西式"];
                    let dishIndex = Math.floor(Math.random() * dish.length);
                    let breakf = seal.deck.draw(ctx, dish[dishIndex], true)["result"];
                    // 记得下面一行的塔罗牌抽牌也要改
                    let tarot = seal.deck.draw(ctx, "今日塔罗", true)["result"];
                    replyMsg = seal.format(ctx, `早安，${playerName}，我们来看一下你今天的人品。\n\n{% if $t人品==0 {$t人品=d100} %}{娱乐:今日人品}\n\n你早饭可以吃${breakf}，当然，一条龙的餐饮品味仅供参考（笑）。\n\n来抽一张塔罗牌吧，${tarot}`);
                } else if (curHour < 6) { //0-5点
                    replyMsg = seal.format(ctx, `这tm才几点钟……你不睡我还要睡。`);
                } else { // 其他
                    replyMsg = seal.format(ctx, `都这个点了，早什么早……你不会才起床吧？`);
                }
                break;
            }
            case "上午好": {
                if (curHour < 11 && curHour > 6) { // 7-10点
                    let activities = ["打游戏", "看书", "画画", "跑团", "睡回笼觉"];
                    let actiIndex = Math.floor(Math.random() * activities.length);
                    let todo = activities[actiIndex];
                    replyMsg = seal.format(ctx, `上午好，${playerName}。今天上午适合${todo}，你说呢？`);
                } else if (curHour >= 11 && curHour < 13) { //11-12点
                    replyMsg = seal.format(ctx, `已经中午了，赶紧去吃午饭吧。`);
                } else {
                    replyMsg = seal.format(ctx, `神tm上午好，你看看现在几点？`);
                }
                break;
            }
            case "中午好": case "午安": {
                if (curHour >= 11 && curHour < 14) { //11-13点
                    let dish = ["中式：主食、点心", "中式：素", "中式：小荤", "中式：大荤", "中式：汤", "印度式：咖喱炖菜", "日式：刺身", "日式：寿司", "日式：面类", "日式：饭类", "日式：菜肴", "东南亚式：菜肴", "东南亚式：主食", "西式正餐：主菜", "西式正餐：汤", "西式快餐：主食"];
                    let dishIndex = Math.floor(Math.random() * dish.length);
                    let lunch = seal.deck.draw(ctx, dish[dishIndex], true)["result"];
                    replyMsg = seal.format(ctx, `中午好啊，${playerName}，我觉得你午饭可以吃${lunch}，我也喜欢这道菜。`);
                } else if (curHour >= 14 && curHour < 16) { // 14-15点
                    replyMsg = seal.format(ctx, `已经这么晚了，忙得没空吃饭吗？`);
                } else {//其他时间
                    replyMsg = seal.format(ctx, `现在怎么说也不算中午吧……`);
                }
                break;
            }
            case "下午好": {
                if (curHour >= 12 && curHour < 19) { // 12-18点
                    let activities = ["打游戏", "看书", "画画", "出去玩", "跑团", "刷手机", "看视频", "睡午觉"];
                    let actiIndex = Math.floor(Math.random() * activities.length);
                    let todo = activities[actiIndex];
                    let dish = ["西式快餐：小食", "西式快餐：甜品", "东南亚式：甜品", "日式：甜品", "日式：美式卷", "日式：街头小吃", "中式：甜品", "中式：小吃", "中式：方便食品", "饮品与甜品：甜品", "饮品与甜品：甜味零食", "饮品与甜品：咸味零食"];
                    let dishIndex = Math.floor(Math.random() * dish.length);
                    let snack = seal.deck.draw(ctx, dish[dishIndex], true)["result"];
                    replyMsg = seal.format(ctx, `下午好，${playerName}。今天下午很适合${todo}。顺便来点小零食吧，${snack}怎么样？`);
                } else if (curHour < 12) { // 0-11点
                    replyMsg = seal.format(ctx, `现在还不是下午……虽然我们很期待。`);
                } else {//其他时间
                    replyMsg = seal.format(ctx, `这都多晚了，你一个下午都很忙吗？`);
                }
                break;
            }
            case "晚上好": case "晚好": {
                if (curHour > 17 && curHour < 22) { // 18-21
                    let activities = ["打游戏", "看书", "画画", "出去玩", "看视频", "看电视", "听歌"];
                    let actiIndex = Math.floor(Math.random() * activities.length);
                    let todo = activities[actiIndex];
                    let dish = ["中式：主食、点心", "中式：素", "中式：小荤", "中式：大荤", "中式：汤", "印度式：咖喱炖菜", "日式：刺身", "日式：寿司", "日式：面类", "日式：饭类", "日式：菜肴", "东南亚式：菜肴", "东南亚式：主食", "西式正餐：主菜", "西式正餐：汤", "西式快餐：主食"];
                    let dishIndex = Math.floor(Math.random() * dish.length);
                    let diner = seal.deck.draw(ctx, dish[dishIndex], true)["result"];
                    replyMsg = seal.format(ctx, `晚上好，${playerName}，不知道你一天过得怎么样？晚饭的话我推荐${diner}。晚上要不要${todo}？`);
                } else if (curHour > 21) { // 22+
                    replyMsg = seal.format(ctx, `有点晚了呢，快准备上床睡觉吧。`);
                } else if (curHour < 19 && curHour > 5) { // 6-18
                    replyMsg = seal.format(ctx, `现在说这个话是不是有点早了？`);
                } else { // 其他（0-5)
                    replyMsg = seal.format(ctx, `zzzzzzzz#打鼾了#`);
                }
                break;
            }
            case "晚安": {
                if (curHour > 21 || curHour < 2) { // 22-23，或 0-1
                    replyMsg = seal.format(ctx, `晚安，早点休息吧。祝你明天好运。`);
                } else if (curHour > 18 && curHour < 22) { // 19-21
                    replyMsg = seal.format(ctx, `这么早就睡了吗？也行，好梦。`);
                } else if (curHour >= 2 && curHour < 6) { // 2-5
                    replyMsg = seal.format(ctx, `zzzzzzz#打鼾了#`);
                } else { // 其他时间（6点到18点）
                    replyMsg = seal.format(ctx, `你睡的也太早了。`);
                }
                break;
            }
        }
        seal.replyToSender(ctx, msg, replyMsg);
        return seal.ext.newCmdExecuteResult(true);
    }
    return seal.ext.newCmdExecuteResult(false);
}

export { }
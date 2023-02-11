// ==UserScript==
// @name        姓名插件进化版
// @author      檀轶步棋
// @version     1.0.0
// @timestamp   1675933550
// @license     MIT
// ==/UserScript==
/** 你的Behindthename.com的API密匙*/
const APIKey = "";
const LookupUrl = "https://www.behindthename.com/api/lookup.json";
const RelationUrl = "https://www.behindthename.com/api/related.json";
const GenerationUrl = "https://www.behindthename.com/api/random.json";
let extName = seal.ext.find("NameAdvanced");
if (!extName) {
    extName = seal.ext.new("姓名插件", "檀轶步棋", "1.0.0");
    seal.ext.register(extName);
}
function LookGender(gen) {
    switch (gen) {
        case "fm": return "男女通用";
        case "f": return "女";
        case "m": return "男";
    }
}
function CollectUsages(usages) {
    let list = [];
    for (let i = 0; i < usages.length; i++) {
        list.push(`来自${CountryNames[usages[i].usage_code]}，被用作${LookGender(usages[i].usage_gender)}名。`);
    }
    return list.join("\n");
}
const cmd = seal.ext.newCmdItemInfo();
cmd.name = "namep";
cmd.help = "基于 behindthename.com 的姓名插件，支持查找姓名来历、相关变体及生成各种语言的随机姓名" +
    "（网站只支持拉丁字母，对西方名支持较好，但中文姓氏不全。建议生成汉语名等使用内置的.name指令）。\n" +
    "【注意】使用该插件需要在网站中注册并获取 API 密匙并填写在代码中的相应位置。一个密匙每秒支持 2 次操作，每天支持 4000 次操作，请控制数量。" +
    "用例：\n" +
    "　.namep search 姓名 //查找姓名的适用性别与主要使用国家/地区\n" +
    "　.namep alias 姓名 (国家) (性别) //查找姓名在某一性别和国家/地区下的别名。数量、国家与性别参数可选，留空则随机。\n" +
    "　.namep (国家) (性别) (数量) //同 .namep gen\n" +
    "　.namep gen (国家) (性别) (数量) //生成不多于6个的某一国家/地区的某一性别的名字。数量、国家与性别参数可选，留空则随机。\n" +
    "关于网站使用的国家/地区代码请见 https://www.behindthename.com/api/appendix2.php。";
cmd.solve = (ctx, msg, args) => {
    if (APIKey === "" || APIKey === undefined) {
        seal.replyToSender(ctx, msg, "错误：未检测到 API 密匙。");
        return seal.ext.newCmdExecuteResult(true);
    }
    let NameForSearch = "", Country = "", Gender = "", Quantity = 1;
    switch (args.getArgN(1)) {
        case "help": {
            const ret = seal.ext.newCmdExecuteResult(true);
            ret.showHelp = true;
            return ret;
        }
        case "search": {
            NameForSearch = args.getArgN(2);
            if (NameForSearch === "" || NameForSearch === undefined) {
                seal.replyToSender(ctx, msg, "错误：请输入要查询的姓或名。");
            }
            else {
                fetch(`${LookupUrl}?name=${NameForSearch}&key=${APIKey}`)
                    .then(resp => {
                    if (!resp.ok) {
                        seal.replyToSender(ctx, msg, `错误：网络请求失败，返回码${resp.status}。`);
                        return "[]";
                    }
                    else
                        return resp.json();
                })
                    .then(ParsedData => {
                    if (ParsedData.error !== undefined) {
                        seal.replyToSender(ctx, msg, `错误：${ParsedData.error}。`);
                    }
                    if (ParsedData[0] !== "" && ParsedData[0] !== undefined) {
                        seal.replyToSender(ctx, msg, `对姓名 ${NameForSearch} 的查询结果：\n` +
                            `${CollectUsages(ParsedData[0].usages)}`);
                    }
                })
                    .catch(e => {
                    seal.replyToSender(ctx, msg, `错误，详情：\n${e}`);
                });
            }
            return seal.ext.newCmdExecuteResult(true);
        }
        case "alias": {
            //TODO: Rewrite this!
            let appendices = `?key=${APIKey}`;
            NameForSearch = args.getArgN(2);
            appendices += `&name=${NameForSearch}`;
            switch (args.args.length) {
                case 2: {
                    break;
                }
                case 3: {
                    if (GenderList.indexOf(args.getArgN(3)) > -1) {
                        Gender = args.getArgN(3);
                        if (Gender === "mf")
                            Gender = "fm";
                        appendices += `&gender=${Gender}`;
                    }
                    else if (CountryNames[args.getArgN(3)] !== undefined) {
                        Country = args.getArgN(3);
                        appendices += `&usage=${Country}`;
                    }
                    else {
                        seal.replyToSender(ctx, msg, `错误：未知参数${args.getArgN(3)}。`);
                        return seal.ext.newCmdExecuteResult(true);
                    }
                    break;
                }
                case 4: {
                    if (GenderList.indexOf(args.getArgN(4)) > -1) {
                        Gender = args.getArgN(4);
                        if (Gender === "mf")
                            Gender = "fm";
                        appendices += `&gender=${Gender}`;
                    }
                    else {
                        seal.replyToSender(ctx, msg, `错误：${args.getArgN(4)}不是合法的性别参数（f, m, fm）。`);
                        return seal.ext.newCmdExecuteResult(true);
                    }
                    if (CountryNames[args.getArgN(3)] !== undefined) {
                        Country = args.getArgN(3);
                        appendices += `&usage=${Country}`;
                    }
                    else {
                        seal.replyToSender(ctx, msg, `错误：${args.getArgN(3)}不是合法的国家/地区代码。`);
                        return seal.ext.newCmdExecuteResult(true);
                    }
                }
            }
            fetch(RelationUrl + appendices)
                .then(resp => {
                if (!resp.ok) {
                    seal.replyToSender(ctx, msg, `错误：网络请求失败，返回码${resp.status}。`);
                    return "[]";
                }
                else
                    return resp.json();
            })
                .then(ParsedData => {
                if (ParsedData.error !== undefined) {
                    seal.replyToSender(ctx, msg, `错误：${ParsedData.error}。`);
                }
                if (ParsedData[0] !== "" && ParsedData[0] !== undefined) {
                    seal.replyToSender(ctx, msg, `错误：${ParsedData.error}。`);
                }
                else {
                    let list = [];
                    for (let i = 0; i < ParsedData.names.length; i++) {
                        list.push(ParsedData.names[i]);
                    }
                    seal.replyToSender(ctx, msg, `姓名${NameForSearch}的别名有：\n` +
                        `${list.join("\n")}`);
                }
            })
                .catch(e => {
                seal.replyToSender(ctx, msg, `错误，详情：\n${e}`);
            });
            return seal.ext.newCmdExecuteResult(true);
        }
        case "gen": {
            let appendices = `?key=${APIKey}`;
            switch (args.args.length) {
                case 1: {
                    break;
                }
                case 2: {
                    if (!isNaN(Number(args.getArgN(2)))) {
                        Quantity = Number(args.getArgN(2));
                    }
                    else if (GenderList.indexOf(args.getArgN(2)) > -1) {
                        Gender = args.getArgN(2);
                        if (Gender === "mf")
                            Gender = "fm";
                        appendices += `&gender=${Gender}`;
                    }
                    else if (CountryNames[args.getArgN(2)] !== undefined) {
                        Country = args.getArgN(2);
                        appendices += `&usage=${Country}`;
                    }
                    else {
                        seal.replyToSender(ctx, msg, `错误：未知参数${args.getArgN(2)}。`);
                        return seal.ext.newCmdExecuteResult(true);
                    }
                    break;
                }
                case 3: {
                    if (!isNaN(Number(args.getArgN(3)))) {
                        Quantity = Number(args.getArgN(3));
                    }
                    else if (GenderList.indexOf(args.getArgN(3)) > -1) {
                        Gender = args.getArgN(3);
                        if (Gender === "mf")
                            Gender = "fm";
                        appendices += `&gender=${Gender}`;
                    }
                    else {
                        seal.replyToSender(ctx, msg, `错误：未知参数${args.getArgN(3)}。`);
                        return seal.ext.newCmdExecuteResult(true);
                    }
                    if (CountryNames[args.getArgN(2)] !== undefined) {
                        Country = args.getArgN(2);
                        appendices += `&usage=${Country}`;
                    }
                    else {
                        seal.replyToSender(ctx, msg, `错误：${args.getArgN(2)}不是合法的国家/地区代码。`);
                        return seal.ext.newCmdExecuteResult(true);
                    }
                    break;
                }
                case 4: {
                    if (!isNaN(Number(args.getArgN(4)))) {
                        Quantity = Number(args.getArgN(4));
                    }
                    else {
                        seal.replyToSender(ctx, msg, `错误：参数${args.getArgN(4)}不是合法的数字。`);
                        return seal.ext.newCmdExecuteResult(true);
                    }
                    if (GenderList.indexOf(args.getArgN(3)) > -1) {
                        Gender = args.getArgN(3);
                        if (Gender === "mf")
                            Gender = "fm";
                        appendices += `&gender=${Gender}`;
                    }
                    else {
                        seal.replyToSender(ctx, msg, `错误：${args.getArgN(3)}不是合法的性别参数（f, m, fm）。`);
                        return seal.ext.newCmdExecuteResult(true);
                    }
                    if (CountryNames[args.getArgN(2)] !== undefined) {
                        Country = args.getArgN(2);
                        appendices += `&usage=${Country}`;
                    }
                    else {
                        seal.replyToSender(ctx, msg, `错误：${args.getArgN(2)}不是合法的国家/地区代码。`);
                        return seal.ext.newCmdExecuteResult(true);
                    }
                    break;
                }
            }
            if (Quantity > 6) {
                seal.replyToSender(ctx, msg, `错误：最多只能生成 6 个姓名。`);
                return seal.ext.newCmdExecuteResult(true);
            }
            appendices += `&number=${Quantity}`;
            fetch(GenerationUrl + appendices)
                .then(resp => {
                if (!resp.ok) {
                    seal.replyToSender(ctx, msg, `错误：网络请求失败，返回码${resp.status}。`);
                    return "[]";
                }
                else
                    return resp.json();
            })
                .then(ParsedData => {
                if (ParsedData.error !== undefined) {
                    seal.replyToSender(ctx, msg, `错误：${ParsedData.error}。`);
                }
                if (ParsedData[0] !== "" && ParsedData[0] !== undefined) {
                    seal.replyToSender(ctx, msg, `错误：${ParsedData.error}。`);
                }
                else {
                    let list = [];
                    for (let i = 0; i < ParsedData.names.length; i++) {
                        list.push(ParsedData.names[i]);
                    }
                    seal.replyToSender(ctx, msg, `为${ctx.player.name}生成以下姓名：\n` +
                        `${list.join("\n")}`);
                }
            })
                .catch(e => {
                seal.replyToSender(ctx, msg, `错误，详情：\n${e}`);
            });
            return seal.ext.newCmdExecuteResult(true);
        }
        default: {
            let appendices = `?key=${APIKey}`;
            switch (args.args.length) {
                case 0: {
                    break;
                }
                case 1: {
                    if (!isNaN(Number(args.getArgN(1)))) {
                        Quantity = Number(args.getArgN(1));
                    }
                    else if (GenderList.indexOf(args.getArgN(1)) > -1) {
                        Gender = args.getArgN(1);
                        if (Gender === "mf")
                            Gender = "fm";
                        appendices += `&gender=${Gender}`;
                    }
                    else if (CountryNames[args.getArgN(1)] !== undefined) {
                        Country = args.getArgN(1);
                        appendices += `&usage=${Country}`;
                    }
                    else {
                        seal.replyToSender(ctx, msg, `错误：未知参数${args.getArgN(2)}。`);
                        return seal.ext.newCmdExecuteResult(true);
                    }
                    break;
                }
                case 2: {
                    if (!isNaN(Number(args.getArgN(2)))) {
                        Quantity = Number(args.getArgN(2));
                    }
                    else if (GenderList.indexOf(args.getArgN(2)) > -1) {
                        Gender = args.getArgN(2);
                        if (Gender === "mf")
                            Gender = "fm";
                        appendices += `&gender=${Gender}`;
                    }
                    else {
                        seal.replyToSender(ctx, msg, `错误：未知参数${args.getArgN(2)}。`);
                        return seal.ext.newCmdExecuteResult(true);
                    }
                    if (CountryNames[args.getArgN(1)] !== undefined) {
                        Country = args.getArgN(1);
                        appendices += `&usage=${Country}`;
                    }
                    else {
                        seal.replyToSender(ctx, msg, `错误：${args.getArgN(1)}不是合法的国家/地区代码。`);
                        return seal.ext.newCmdExecuteResult(true);
                    }
                    break;
                }
                case 3: {
                    if (!isNaN(Number(args.getArgN(3)))) {
                        Quantity = Number(args.getArgN(3));
                    }
                    else {
                        seal.replyToSender(ctx, msg, `错误：参数${args.getArgN(3)}不是合法的数字。`);
                        return seal.ext.newCmdExecuteResult(true);
                    }
                    if (GenderList.indexOf(args.getArgN(2)) > -1) {
                        Gender = args.getArgN(2);
                        if (Gender === "mf")
                            Gender = "fm";
                        appendices += `&gender=${Gender}`;
                    }
                    else {
                        seal.replyToSender(ctx, msg, `错误：${args.getArgN(2)}不是合法的性别参数（f, m, fm）。`);
                        return seal.ext.newCmdExecuteResult(true);
                    }
                    if (CountryNames[args.getArgN(1)] !== undefined) {
                        Country = args.getArgN(1);
                        appendices += `&usage=${Country}`;
                    }
                    else {
                        seal.replyToSender(ctx, msg, `错误：${args.getArgN(1)}不是合法的国家/地区代码。`);
                        return seal.ext.newCmdExecuteResult(true);
                    }
                    break;
                }
            }
            if (Quantity > 6) {
                seal.replyToSender(ctx, msg, `错误：最多只能生成 6 个姓名。`);
                return seal.ext.newCmdExecuteResult(true);
            }
            appendices += `&number=${Quantity}`;
            fetch(GenerationUrl + appendices)
                .then(resp => {
                if (!resp.ok) {
                    seal.replyToSender(ctx, msg, `错误：网络请求失败，返回码${resp.status}。`);
                    return "[]";
                }
                else
                    return resp.json();
            })
                .then(ParsedData => {
                if (ParsedData.error !== undefined) {
                    seal.replyToSender(ctx, msg, `错误：${ParsedData.error}。`);
                }
                if (ParsedData[0] !== "" && ParsedData[0] !== undefined) {
                    seal.replyToSender(ctx, msg, `错误：${ParsedData.error}。`);
                }
                else {
                    let list = [];
                    for (let i = 0; i < ParsedData.names.length; i++) {
                        list.push(ParsedData.names[i]);
                    }
                    seal.replyToSender(ctx, msg, `为${ctx.player.name}生成以下姓名：\n` +
                        `${list.join("\n")}`);
                }
            })
                .catch(e => {
                seal.replyToSender(ctx, msg, `错误，详情：\n${e}`);
            });
            return seal.ext.newCmdExecuteResult(true);
        }
    }
};
extName.cmdMap["namep"] = cmd;
const GenderList = ["f", "m", "fm", "mf"];
const CountryNames = {
    "afk": "南非荷兰语",
    "afr": "非洲",
    "aka": "几内亚阿坎族",
    "alb": "阿尔巴尼亚",
    "alg": "北美印第安阿尔衮琴部",
    "ame": "美洲土著",
    "amem": "New World Mythology（幻想世界）",
    "amh": "阿姆哈拉语",
    "anci": "古代",
    "apa": "阿帕奇语",
    "ara": "阿拉伯语",
    "arm": "阿美尼亚",
    "asm": "印度阿萨姆族",
    "ast": "阿斯图尼亚斯语",
    "astr": "天文学",
    "aus": "澳大利亚土著",
    "ava": "高加索阿瓦尔语",
    "aym": "南美艾玛拉族",
    "aze": "阿塞拜疆",
    "bal": "巴厘语",
    "bas": "巴斯克语",
    "bel": "白俄罗斯语",
    "ben": "孟加拉",
    "ber": "西北非柏柏尔族",
    "bhu": "不丹",
    "bibl": "圣经",
    "bos": "波斯尼亚",
    "bre": "布列塔尼语",
    "bsh": "土耳其巴什基尔族",
    "bul": "保加利亚",
    "bur": "缅甸语",
    "cat": "加泰罗尼亚语",
    "cela": "古凯尔特语",
    "celm": "凯尔特神话",
    "cew": "非洲东南切瓦族",
    "cha": "查莫罗语",
    "che": "车臣语",
    "chi": "汉语",
    "chk": "北美切洛基族",
    "cht": "北美乔克托族",
    "chy": "北美夏延族",
    "cir": "高加索切尔克斯族",
    "cmr": "科摩罗",
    "com": "北美科曼奇族",
    "cop": "北非科普特族",
    "cor": "英国康沃尔语",
    "cre": "加拿大克里族",
    "cro": "克罗地亚",
    "crs": "科西嘉语",
    "cze": "捷克",
    "dan": "丹麦",
    "dgs": "俄罗斯达吉斯坦",
    "dhi": "马尔代夫迪维希族",
    "dut": "荷兰",
    "egya": "古埃及",
    "egym": "埃及神话",
    "eng": "英语",
    "enga": "盎格鲁-撒克逊语",
    "esp": "世界语",
    "est": "爱沙尼亚",
    "eth": "埃塞俄比亚",
    "ewe": "非洲埃维语",
    "fae": "法罗语",
    "fairy": "Fairy（幻想世界）",
    "fij": "斐济",
    "fil": "菲律宾",
    "fin": "芬兰",
    "fle": "佛拉芒语",
    "fntsg": "Gluttakh（幻想世界）",
    "fntsm": "Monstrall（幻想世界）",
    "fntsr": "Romanto（幻想世界）",
    "fntss": "Simitiq（幻想世界）",
    "fntst": "Tsang（幻想世界）",
    "fntsx": "Xalaxxi（幻想世界）",
    "fre": "法语",
    "fri": "弗里斯兰语",
    "ful": "西非富拉尼人",
    "gaa": "加纳",
    "gal": "加利西亚语",
    "gan": "乌干达",
    "geo": "格鲁吉亚",
    "ger": "德语",
    "gmca": "古日耳曼语",
    "goth": "Goth（幻想世界）",
    "gre": "希腊语",
    "grea": "古希腊",
    "grem": "希腊神话",
    "grn": "格陵兰",
    "gua": "南美瓜拉尼族",
    "guj": "古吉拉特语",
    "hau": "豪萨语",
    "haw": "夏威夷语",
    "hb": "Hillbilly（幻想世界）",
    "heb": "希伯来语",
    "hin": "印地语",
    "hippy": "Hippy（幻想世界）",
    "hist": "历史人物",
    "hmo": "苗语",
    "hun": "匈牙利",
    "ibi": "尼日利亚伊比比奥族",
    "ice": "冰岛",
    "igb": "尼日利亚伊博族",
    "ind": "印度",
    "indm": "印度神话",
    "ing": "俄罗斯印古什",
    "ins": "印度尼西亚",
    "inu": "因纽特族",
    "iri": "爱尔兰",
    "iro": "北美易洛魁语",
    "ita": "意大利语",
    "jap": "日语",
    "jav": "爪哇语",
    "jer": "泽西语",
    "jew": "犹太族",
    "kan": "印度坎纳达族",
    "kaz": "哈萨克族",
    "khm": "高棉语",
    "kig": "奇加语",
    "kik": "肯尼亚基库尤族",
    "kk": "Kreatyve（幻想世界）",
    "kon": "刚果",
    "kor": "朝鲜语",
    "kur": "库尔德",
    "kyr": "吉尔吉斯斯坦",
    "lao": "老挝",
    "lat": "拉脱维亚",
    "lim": "林堡语",
    "lite": "文学",
    "litk": "亚瑟王传奇",
    "lth": "立陶宛语",
    "luh": "东非卢希亚族",
    "luo": "东非卢奥族",
    "mac": "马其顿语",
    "mag": "菲律宾马京达努",
    "mal": "马耳他",
    "man": "马恩盖尔语",
    "mao": "毛利语",
    "map": "马普切族",
    "may": "玛雅族",
    "mbu": "翁本杜语",
    "medi": "中世纪",
    "mlm": "印度马拉雅拉姆语",
    "mly": "马来语",
    "moh": "北美莫霍克族",
    "mon": "蒙古语",
    "morm": "基督教摩尔门派",
    "mrt": "印度玛拉地语",
    "mwe": "非洲姆韦拉族",
    "myth": "神话",
    "nah": "纳瓦特尔语",
    "nav": "美洲纳瓦霍族",
    "nde": "南非恩德贝莱族",
    "neaa": "古代近东地区",
    "neam": "近东神话",
    "nep": "尼泊尔",
    "nor": "挪威",
    "nrm": "诺曼语",
    "nuu": "加拿大努查努阿特族",
    "occ": "奥克语",
    "odi": "印度奥利亚语（乌荼语）",
    "oji": "奥吉布瓦语",
    "one": "北美奥奈达族",
    "oro": "埃塞俄比亚奥罗莫族",
    "oss": "高加索奥塞梯族",
    "pas": "普什图语",
    "pcd": "法国皮卡第语",
    "per": "波斯语",
    "pets": "宠物名称",
    "pin": "澳洲宾图比族",
    "pol": "波兰语",
    "popu": "流行文化",
    "por": "葡萄牙语",
    "pow": "北美波瓦坦族",
    "pun": "旁遮普语",
    "que": "南美克丘亚语（奇楚瓦语）",
    "rap": "Rapper（幻想世界）",
    "rmn": "罗马尼亚语",
    "roma": "古罗曼语",
    "romm": "罗马神话",
    "rus": "俄语",
    "sam": "北欧萨米族",
    "sar": "撒丁语",
    "sax": "低地德语",
    "scaa": "古斯堪的纳维亚语",
    "scam": "北欧神话",
    "sco": "苏格兰",
    "sct": "苏格兰语",
    "sen": "北美塞尼卡族",
    "ser": "塞尔维亚",
    "sha": "北美肖尼族",
    "sho": "南非邵纳族",
    "sic": "西西里语",
    "sik": "北美西科西卡族（黑脚联盟）",
    "sin": "僧伽罗语",
    "sio": "北美苏族",
    "sla": "斯拉夫",
    "slam": "斯拉夫神话",
    "slk": "斯洛伐克",
    "sln": "斯洛文尼亚",
    "smn": "萨摩亚",
    "som": "索马里",
    "sor": "索布语（文德语）",
    "sot": "南索托语",
    "spa": "西班牙语",
    "swa": "斯瓦西里语",
    "swe": "瑞典语",
    "swz": "斯威士兰",
    "tag": "他加禄语",
    "tah": "塔希提",
    "taj": "塔吉克族",
    "tam": "泰米尔族",
    "tat": "鞑靼族",
    "tau": "菲律宾陶苏格族",
    "tel": "印度泰卢固语",
    "tha": "泰语",
    "theo": "神明",
    "tib": "藏语",
    "tkm": "土库曼斯坦",
    "ton": "汤加",
    "too": "土柔王国",
    "trans": "Transformer（幻想世界）",
    "tsw": "茨瓦纳族",
    "tum": "非洲通布卡族",
    "tup": "巴西图皮人",
    "tur": "土耳其语",
    "ukr": "乌克兰语",
    "urd": "乌尔都语",
    "urh": "尼日利亚乌尔霍博族",
    "usa": "美国",
    "uyg": "维吾尔族",
    "uzb": "乌兹别克斯坦",
    "vari": "很多地区",
    "vie": "越南",
    "wel": "威尔士",
    "witch": "Witch（幻想世界）",
    "wrest": "Wrestler（幻想世界）",
    "xho": "南非科萨族",
    "yao": "非洲亚沃族",
    "yol": "澳洲土著",
    "yor": "非洲约鲁巴族",
    "zap": "南美萨波特克族",
    "zul": "祖鲁",
    //我杀这个API，POST和GET使用的国家代码不一样你想干什么
    "rom-myth": "罗马神话",
    "sla-myth": "斯拉夫神话",
    "gre-myth": "希腊神话",
    "sca-myth": "北欧神话",
    "cel-myth": "凯尔特神话",
    "egy-myth": "埃及神话",
    "ind-myth": "印度神话",
    "nea-myth": "近东神话"
};

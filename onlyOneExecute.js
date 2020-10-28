const exec = require("child_process").execSync;
const fs = require("fs");
const download = require("download");
const smartReplace = require("./smartReplace");

// 公共变量
const Secrets = {
    JD_COOKIE: process.env.JD_COOKIE, //cokie,多个用&隔开即可
    SyncUrl: process.env.SYNCURL, //签到地址,方便随时变动
    PUSH_KEY: process.env.PUSH_KEY, //server酱推送消息
    BARK_PUSH: process.env.BARK_PUSH, //Bark推送
    TG_BOT_TOKEN: process.env.TG_BOT_TOKEN, //TGBot推送Token
    TG_USER_ID: process.env.TG_USER_ID, //TGBot推送成员ID
    MarketCoinToBeanCount: process.env.JDMarketCoinToBeans, //京小超蓝币兑换京豆数量
    JoyFeedCount: process.env.JDJoyFeedCount, //宠汪汪喂食数量
    FruitShareCodes: process.env.FruitShareCodes, //京东农场分享码
    Unsubscribe: process.env.UNSUBSCRIBE, //取关商铺
    LOCATION: process.env.LOCATION, //第几个yml
};

async function downFile() {
    await download(Secrets.SyncUrl, "./", { filename: "temp.js" });
    console.log("下载代码完毕");
}

async function changeFiele() {
    let content = await fs.readFileSync("./temp.js", "utf8");
    content = await smartReplace.replaceWithSecrets(content, Secrets);
    await fs.writeFileSync("./execute.js", content, "utf8");
    console.log("替换变量完毕");
}

async function start() {
    console.log(`当前执行时间:${new Date().toString()}`);
    let CookieJDs = [];
    CookieJDs = Secrets.JD_COOKIE.split('&');
    Secrets.JD_COOKIE = CookieJDs[Number(Secrets.LOCATION)-1]
    if (!Secrets.JD_COOKIE) {
        console.log("请填写 JD_COOKIE 后在继续");
        return;
    }
    if (!Secrets.SyncUrl) {
        console.log("请填写 SYNCURL 后在继续");
        return;
    }
    console.log(`当前共${Secrets.JD_COOKIE.split("&").length}个账号需要签到,只执行第${Number(Secrets.LOCATION)}个`);
    function startTime(){
        let targetTimezone = -8     // 目标时区，东8区
        // 当前时区与中时区时差，以min为维度
        let _dif = new Date().getTimezoneOffset()
        // 本地时区时间 + 时差  = 中时区时间
        // 目标时区时间 + 时差 = 中时区时间
        // 目标时区时间 = 本地时区时间 + 本地时区时差 - 目标时区时差
        // 东9区时间
        let east8time = new Date().getTime() + _dif * 60 * 1000 - (targetTimezone * 60 * 60 * 1000)
        let today=new Date(east8time);
        let h=today.getHours();
        let m=today.getMinutes();
        let s=today.getSeconds();// 在小于10的数字前加一个‘0’
        m=checkTime(m);
        s=checkTime(s);
        console.log(h+":"+m+":"+s)
    }
    function checkTime(i){
        if (i<10){
            i="0" + i;
        }
        return i;
    }
    startTime();
    try {
        await downFile();
        await changeFiele();
        await exec("node execute.js", { stdio: "inherit" });
    } catch (e) {
        console.log("执行异常:" + e);
    }
    console.log("执行完毕");
}

start();

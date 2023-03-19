/******** discord.js v13.x *******/
/******** node.js version 16~ **********/
/******** Please create .env file and write token and channelID on it********/

//discordの関数定義
const http = require("http");
const querystring = require("querystring");
const { Client, Intents } = require("discord.js");
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
    ],
});

//ifttt(webhooks)の関数定義
const fetch = require("node-fetch");
const event = "Discord_Call_Start"; // イベント名を指定
const key = "bcFB6zmYKtC_Mjle1VHvmw12KhGI_zjCSQB3DzK3YJO"; // IFTTT WebhooksのAPIキーを指定
const url = `https://maker.ifttt.com/trigger/${event}/with/key/${key}`;

//叩き起こすサーバーの準備
http
    .createServer(function (req, res) {
        if (req.method == "POST") {
            var data = "";
            req.on("data", function (chunk) {
                data += chunk;
            });
            req.on("end", function () {
                if (!data) {
                    res.end("No post data");
                    return;
                }
                var dataObject = querystring.parse(data);
                console.log("post:" + dataObject.type);
                if (dataObject.type == "wake") {
                    console.log("Woke up in post");
                    res.end();
                    return;
                }
                res.end();
            });
        } else if (req.method == "GET") {
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end("Discord Bot is active now\n");
        }
    })
    .listen(3000);

//ボット稼働
client.on("ready", (message) => {
    console.log("Bot_Ready");
    client.user.setActivity("怠惰な人生", { type: "PLAYING" });
});

//ここから通知処理開始

var start_buf = Date.now();
var end_buf = Date.now();

client.on("voiceStateUpdate", (oldGuildMember, newGuildMember) => {
    if (
        oldGuildMember.channelId == undefined &&
        newGuildMember.channelId != undefined
    ) {
        if (
            oldGuildMember.channelId == process.env.VOICE_CHANNEL_ID_1 ||
            oldGuildMember.channelId == process.env.VOICE_CHANNEL_ID_2 ||
            oldGuildMember.channelId == process.env.VOICE_CHANNEL_ID_3
        ) {
            console.log("特定のボイスチャットチャンネルのみ反映");
            if (
                client.channels.cache.get(newGuildMember.channelId).members.size == 1
            ) {
                console.log("通話開始かどうかの条件判定");
                let text =
                    "//" +
                    "<" +
                    newGuildMember.member.displayName +
                    ">" +
                    "が通話を開始しました" +
                    "//" +
                    "\n";
                client.channels.cache.get(process.env.TEXT_CHANNEL_ID).send(text);
                start_buf = Date.now();
                /*iftttに通知送信開始*/
                const value1 = "Discord"; // 通知のタイトルを指定
                const value2 = `${newGuildMember.member.displayName}が通話を開始しました`; // 通知の本文を指定
                fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ value1, value2 }),
                })
                    .then((response) => response.json())
                    .then((data) => console.log(data))
                    .catch((error) => console.error(error));
                /*iftttに通知送信終了*/
            }
        }
    }

    if (
        newGuildMember.channelId == undefined &&
        oldGuildMember.channelId != undefined
    ) {
        console.log("通話終了の判定");
        let text = "通話が終了しました。\n";
        if (
            oldGuildMember.channelId == process.env.VOICE_CHANNEL_ID_1 ||
            oldGuildMember.channelId == process.env.VOICE_CHANNEL_ID_2 ||
            oldGuildMember.channelId == process.env.VOICE_CHANNEL_ID_3
        ) {
            console.log("特定のボイスチャンネル判定終了");
            if (
                client.channels.cache.get(oldGuildMember.channelId).members.size == 0
            ) {
                console.log("最後の判定");
                client.channels.cache.get(process.env.TEXT_CHANNEL_ID).send(text);
            }
        }
    }
});


//ログイン用関数
client.login(process.env.DISCORD_BOT_TOKEN);
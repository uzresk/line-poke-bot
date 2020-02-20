const line = require('@line/bot-sdk');
const config = {
    channelSecret: process.env.CHANNEL_SECRET,
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
};
const lineClient = new line.Client(config);

const CosmosClient = require('@azure/cosmos').CosmosClient;
const CosmosDBDao = require('./CosmosDBDao');

const crypto = require('crypto');

module.exports = async function (context, req) {

    // ローカルで起動していない場合は署名の検証を行う。
    if (!context.bindings.req.url.includes('localhost')) {
        if (!verifySignature(req)) {
            context.log('署名の検証に失敗')
            return;
        } else {
            context.log('署名の検証に成功');
        }
    } else {
        context.log('ローカル起動');
    }
    req.body.events.map(event => {
        handleMessage(context, event)
    });
};

const verifySignature = (req) => {
    const signature = crypto
        .createHmac('SHA256', config.channelSecret)
        .update(Buffer.from(JSON.stringify(req.body)))
        .digest('base64');
    const headerSignature = req.headers['x-line-signature'];
    return signature === headerSignature;
};

const handleMessage = async(context, event) => {

    const message = event.message.text.trim();
    let returnMsg = {};
    if (message.includes('アプリ')) {
        const APP_URL = process.env.APP_URL
        returnMsg = {
            type: 'text',
            text: 'アプリケーションを開きます。\n' + APP_URL
        };
        return sendMessage(context, event, returnMsg);
    }

    if (message.includes('スタンプ')) {
        returnMsg = {
            type: 'sticker',
            packageId: '11539',
            stickerId: '52114142'
        };
        return sendMessage(context, event, returnMsg);
    }

    // ポケモンの情報を検索する
    const pokemon = await findPokemon(context, message);
    context.log('pokemon:', pokemon);
    if (pokemon.length === 0) {
        returnMsg = {
            type: 'text',
            text: '[' + message + ']というポケモンは見つかりませんでした。'
        }
    } else {
        returnMsg = {
            type: 'text',
            text: '[' + message + '] は、' + pokemon[0].types + 'タイプです。'
        }
    }
    context.log('msg:', returnMsg);
    return sendMessage(context, event, returnMsg);
};

const sendMessage = (context, event, message) => {
    context.log("USERID:" + event.source.userId)
    // return lineClient.pushMessage(event.source.userId, message).catch(err => { console.log(err)});
    return lineClient.replyMessage(event.replyToken, message).catch(e => {
        context.log(e)
    });
};

const hiragana2katakana = (str) => {
    return str.replace(/[\u3041-\u3096]/g, function (match) {
        var chr = match.charCodeAt(0) + 0x60;
        return String.fromCharCode(chr);
    });
};

const findPokemon = async (context, message) => {
    const cosmosClient = new CosmosClient({
        endpoint: process.env.COSMOSDB_ENDPOINT,
        key: process.env.COSMOSDB_KEY,
    });
    const dao = new CosmosDBDao(cosmosClient, "pokemon", "data");
    await dao.init();
    querySpec = {
        query: "SELECT * FROM data d WHERE d.name=@name",
        parameters: [
            {
                name: "@name",
                value: hiragana2katakana(message)
            }
        ]
    };
    return dao.find(querySpec);
};
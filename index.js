const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const LINE_CHANNEL_ACCESS_TOKEN = 'FHIvugGVcjhQD4Ah9QY++K06xjoDFE+kWhY2YeW3kFTpcG/4iP7ONXCnlGvk3vVrVjVMNblDoftaRnjqGlOXDtyIs3gXun9TLCNcvkfsfNKMqGTV+CAAkJzPsjzt7p7ts4oVqpzu9NAMEqzMIM+l7gdB04t89/1O/w1cDnyilFU=';
const LINE_CHANNEL_SECRET = '7922b0f2df73260a8625eed93318374f';
const AZURE_AI_API_KEY = 'ce5a477a5f4c4a75b745ed4fde3f23f3';
const AZURE_AI_ENDPOINT = 'https://openn.openai.azure.com/';

app.post('/webhook', async (req, res) => {
    const events = req.body.events;
    for (let event of events) {
        if (event.type === 'message' && event.message.type === 'text') {
            const userMessage = event.message.text;
            const replyToken = event.replyToken;

            // 呼叫Azure AI Studio的聊天服務
            const response = await axios.post(
                AZURE_AI_ENDPOINT,
                {
                    query: userMessage,
                    key: AZURE_AI_API_KEY
                }
            );

            const botMessage = response.data.reply;

            // 回應LINE使用者
            await axios.post(
                'https://api.line.me/v2/bot/message/reply',
                {
                    replyToken: replyToken,
                    messages: [
                        {
                            type: 'text',
                            text: botMessage
                        }
                    ]
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
                    }
                }
            );
        }
    }
    res.sendStatus(200);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

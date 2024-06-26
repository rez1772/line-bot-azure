const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
const AZURE_AI_API_KEY = process.env.AZURE_AI_API_KEY;
const AZURE_AI_ENDPOINT = process.env.AZURE_AI_ENDPOINT;

app.post('/webhook', async (req, res) => {
    const events = req.body.events;
    for (let event of events) {
        if (event.type === 'message' && event.message.type === 'text') {
            const userMessage = event.message.text;
            const replyToken = event.replyToken;

            // 呼叫Azure AI Studio的聊天服務
            try {
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
            } catch (error) {
                console.error('Error calling Azure AI:', error);
            }
        }
    }
    res.sendStatus(200);  // 確保返回狀態碼200
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

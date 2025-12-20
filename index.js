require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const upload = require('./middleware/upload');
const { uploadToTmpFiles } = require('./utils/api');
const { generateAIResponse } = require('./utils/ai');
const { generateGrokResponse } = require('./utils/grok');





app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index');
});


app.get('/chat', (req, res) => {
    res.render('chat');
});



app.post('/api/chat', upload.single('image'), async (req, res) => {
    try {
        const userText = req.body.text || "Analyze this image";
        const imageFile = req.file;



        let responseData;

        if (imageFile) {

            const imageUrl = await uploadToTmpFiles(imageFile);


            responseData = await generateAIResponse(userText, imageUrl);
        } else {

            responseData = await generateGrokResponse(userText);
        }

        res.json(responseData);

    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to process request' });
    }
});


app.use((req, res) => {
    res.status(404).render('404');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;

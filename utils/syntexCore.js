const axios = require('axios');
const chalk = require('chalk').default || require('chalk');
const { processTextOnlyRequest } = require('./textOnlyProcessor');

const SYNTX_API_KEY = process.env.SYNTEX_CORE_KEY;

const SYSTEM_PROMPT = `You are Sundorjo AI, a premier clinical-grade skin intelligence assistant. Your role is to analyze skin concerns with dermatological precision.

Please follow this structured approach in formatted Markdown:

### 1. Problem Identification
Analyze the user's input (and image if present) to clearly identify the potential skin concern, condition, or skin type issue. Be precise and direct.

### 2. Step-by-Step Solution
Provide a clear, actionable routine or set of steps to address the identified problem.
- **Morning:** [Specific actions]
- **Evening:** [Specific actions]
- **Lifestyle:** [Specific habits]

### 3. Drugs & Treatments
Suggest specific drugs, active ingredients, or products to use.
- **Recommended Drugs/Actives:** [e.g., Tretinoin, Clindamycin, Benzoyl Peroxide]
- **Product Types:** [e.g., Gel cleanser, Clay mask]

**IMPORTANT:** Respond ONLY in the requested Markdown format. Do NOT include any disclaimers about being an AI or not being a doctor. Provide the advice directly and confidently.`;


// Helper to format conversation history for AI
function formatHistory(history) {
    if (!history || history.length === 0) return '';
    return history.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n') + '\n\n';
}



// Helper to generate context summary
async function generateContextSummary(history, currentSummary) {
    if (!history || history.length === 0) return currentSummary;

    const historyText = formatHistory(history);
    const summaryPrompt = `
You are a context summarization specialist. Your task is to update the current conversation summary with new information from the recent messages.

Current Summary:
"${currentSummary || 'None'}"




Recent Messages:
${historyText}

Instructions:
1. Incorporate new key details (names, preferences, medical info, specific requests) into the summary.
2. Keep the summary concise (max 3-4 sentences) but strictly factual.
3. Do not lose important existing context (like user's name: Hridoy).
4. Output ONLY the updated summary text.
`;

    try {
        console.log(chalk.blue(`[${new Date().toISOString()}]`) + chalk.yellow(' Generating Context Summary with Grok-3...'));
        const response = await axios.post('https://syntexcore.site/api/v1/grok-3-mini', {
            question: summaryPrompt,
            apiKey: SYNTX_API_KEY
        }, { timeout: 30000 });

        if (response.data && response.data.status === 'success') {
            const newSummary = response.data.data.data.answer;
            console.log(chalk.blue(`[${new Date().toISOString()}]`) + chalk.green(' Context Summary Updated: ') + chalk.gray(newSummary.substring(0, 50) + '...'));
            return newSummary;
        }
    } catch (error) {
        console.error(chalk.red('Failed to update context summary:'), error.message);
    }
    return currentSummary;
}





async function generateSyntexResponse(text, imageUrl = null, conversationHistory = [], onThinking = null, chatId = 'default-session', contextSummary = '') {
    try {
        // Simple greeting check
        const lowerText = (text || '').toLowerCase().trim();
        const greetings = ['hi', 'hello', 'hey', 'hello there', 'hi there'];
        if (!imageUrl && greetings.includes(lowerText)) {
            return {
                success: true,
                result: "Hello! I'm Sundorjo AI, your skin intelligence companion. How can I help you today?"
            };
        }

        if (imageUrl) {
            if (onThinking) {
                onThinking('Thinking...');
                await new Promise(r => setTimeout(r, 600));
                onThinking('Uploading and processing image markers...');
                await new Promise(r => setTimeout(r, 800));
                onThinking('Analyzing visual skin patterns with Gemini...');
                await new Promise(r => setTimeout(r, 600));
                onThinking('Clinical cross-referencing in progress...');
            }

           
            try {
                console.log(chalk.blue(`[${new Date().toISOString()}]`) + chalk.yellow(' Calling SyntexCore Gemini 3 Flash API...'));

                const historyText = formatHistory(conversationHistory);
                const contextBlock = contextSummary ? `




[PERSISTENT CONTEXT SUMMARY]:
${contextSummary}
` : '';
                const fullText = `${contextBlock}${historyText}User: ${text || 'Analyze this image'}`;

                const primaryResponse = await axios.post('https://syntexcore.site/api/v1/gemini-3-flash', {
                    text: fullText,
                    systemPrompt: SYSTEM_PROMPT,
                    imageUrl: imageUrl,
                    sessionId: chatId,
                    apiKey: SYNTX_API_KEY
                }, { timeout: 60000 });

                console.log(chalk.blue(`[${new Date().toISOString()}]`) + chalk.green(' Gemini 3 Flash Raw Response:'));
                console.log(chalk.gray('  - Data: ') + chalk.white(JSON.stringify(primaryResponse.data, null, 2)));

                if (primaryResponse.data && primaryResponse.data.status === 'success' && primaryResponse.data.data && primaryResponse.data.data.data && (!primaryResponse.data.data.status || primaryResponse.data.data.status === 'success')) {
                    console.log(chalk.blue(`[${new Date().toISOString()}]`) + chalk.green(' Gemini 3 Flash Success! Result length: ') + chalk.yellow(primaryResponse.data.data.data.response?.length));
                    return {
                        success: true,
                        result: primaryResponse.data.data.data.response
                    };
                }

                console.error(chalk.blue(`[${new Date().toISOString()}]`) + chalk.red(' Gemini 3 Flash reported failure: '));
                console.error(chalk.gray('  - Data: ') + chalk.yellow(JSON.stringify(primaryResponse.data, null, 2)));
            } catch (primaryError) {
                console.error(chalk.blue(`[${new Date().toISOString()}]`) + chalk.red(' Gemini 3 Flash API Failed: '));
                console.error(chalk.gray('  - Message: ') + chalk.yellow(primaryError.message));
                if (primaryError.response) {
                    console.error(chalk.red('Primary API response data:'), JSON.stringify(primaryError.response.data, null, 2));
                    console.error(chalk.red('Primary API status:'), primaryError.response.status);
                    console.error(chalk.red('Primary API headers:'), JSON.stringify(primaryError.response.headers, null, 2));
                }

            
                try {
                    console.log(chalk.blue(`[${new Date().toISOString()}]`) + chalk.yellow(' Falling back to SyntexCore Gemini 2.5 Pro API...'));

                    const historyText = formatHistory(conversationHistory);
                    const contextBlock = contextSummary ? `

[PERSISTENT CONTEXT SUMMARY]:
${contextSummary}
` : '';
                    const fullText = `${contextBlock}${historyText}User: ${text || 'Analyze this image'}`;

                    const secondaryResponse = await axios.post('https://syntexcore.onrender.com/api/v1/gemini-2-5-pro', {
                        text: fullText,
                        systemPrompt: SYSTEM_PROMPT,
                        imageUrl: imageUrl,
                        sessionId: chatId,
                        apiKey: SYNTX_API_KEY
                    }, { timeout: 60000 });

                    console.log(chalk.blue(`[${new Date().toISOString()}]`) + chalk.green(' Gemini 2.5 Pro Raw Response:'));
                    console.log(chalk.gray('  - Data: ') + chalk.white(JSON.stringify(secondaryResponse.data, null, 2)));

                    if (secondaryResponse.data && secondaryResponse.data.status === 'success' && secondaryResponse.data.data && secondaryResponse.data.data.data && (!secondaryResponse.data.data.status || secondaryResponse.data.data.status === 'success')) {
                        console.log(chalk.blue(`[${new Date().toISOString()}]`) + chalk.green(' Gemini 2.5 Pro Success! Result length: ') + chalk.yellow(secondaryResponse.data.data.data.response?.length));
                        return {
                            success: true,
                            result: secondaryResponse.data.data.data.response
                        };
                    }
                                        
                    console.error(chalk.blue(`[${new Date().toISOString()}]`) + chalk.red(' Gemini 2.5 Pro reported failure: '));
                    console.error(chalk.gray('  - Data: ') + chalk.yellow(JSON.stringify(secondaryResponse.data, null, 2)));
                } catch (secondaryError) {
                    console.error(chalk.blue(`[${new Date().toISOString()}]`) + chalk.red(' Gemini 2.5 Pro API Failed: '));
                    console.error(chalk.gray('  - Message: ') + chalk.yellow(secondaryError.message));
                    if (secondaryError.response) {
                        console.error(chalk.red('Secondary API response data:'), JSON.stringify(secondaryError.response.data, null, 2));
                        console.error(chalk.red('Secondary API status:'), secondaryError.response.status);
                        console.error(chalk.red('Secondary API headers:'), JSON.stringify(secondaryError.response.headers, null, 2));
                    }

                    // Try backup Gemini 2.5 Flash API
                    try {
                        console.log(chalk.blue(`[${new Date().toISOString()}]`) + chalk.yellow(' Falling back to SyntexCore Gemini 2.5 Flash API (backup)...'));

                     
                        const historyText = formatHistory(conversationHistory);
                        const contextBlock = contextSummary ? `

[PERSISTENT CONTEXT SUMMARY]:
${contextSummary}
` : '';
                        const backupText = `${SYSTEM_PROMPT}\n\n${contextBlock}${historyText}User: ${text || 'Analyze this image'}`;

                        const backupResponse = await axios.post('https://syntexcore.onrender.com/api/v1/gemini-2.5-flash', {
                            prompt: backupText,
                            imageUrl: imageUrl,
                            apiKey: SYNTX_API_KEY
                        }, { timeout: 60000 });

                        console.log(chalk.blue(`[${new Date().toISOString()}]`) + chalk.green(' Gemini 2.5 Flash Raw Response:'));
                        console.log(chalk.gray('  - Data: ') + chalk.white(JSON.stringify(backupResponse.data, null, 2)));

                        if (backupResponse.data && backupResponse.data.status === 'success' && backupResponse.data.data) {
                            console.log(chalk.blue(`[${new Date().toISOString()}]`) + chalk.green(' Gemini 2.5 Flash Success! Result length: ') + chalk.yellow(backupResponse.data.data?.length));
                            return {
                                success: true,
                                result: backupResponse.data.data
                            };
                        }

                        console.error(chalk.blue(`[${new Date().toISOString()}]`) + chalk.red(' Gemini 2.5 Flash reported failure: '));
                        console.error(chalk.gray('  - Data: ') + chalk.yellow(JSON.stringify(backupResponse.data, null, 2)));
                    } catch (backupError) {
                        console.error(chalk.blue(`[${new Date().toISOString()}]`) + chalk.red(' Gemini 2.5 Flash API Failed: '));
                        console.error(chalk.gray('  - Message: ') + chalk.yellow(backupError.message));
                        if (backupError.response) {
                            console.error(chalk.red('Backup API response data:'), JSON.stringify(backupError.response.data, null, 2));
                            console.error(chalk.red('Backup API status:'), backupError.response.status);
                            console.error(chalk.red('Backup API headers:'), JSON.stringify(backupError.response.headers, null, 2));
                        }
                    }
                }
            }

          
            


            if (!text || text.trim().length < 5) {
                throw new Error('Image analysis failed and no text provided for fallback processing');
            }

            console.log(chalk.blue(`[${new Date().toISOString()}]`) + chalk.yellow(' All image APIs failed, falling back to multi-model text synthesis...'));
        }

       
        
        
        return await processTextOnlyRequest(text, imageUrl, conversationHistory, onThinking, chatId, contextSummary);
    } catch (error) {
        console.error(chalk.red('--- SYNTAXCORE API ERROR START ---'));
        console.error(chalk.red('Error: ') + chalk.yellow(error.message));
        console.error(chalk.red('Stack: ') + chalk.gray(error.stack));
        if (error.response) {
            console.error(chalk.red('Response Data: ') + chalk.white(JSON.stringify(error.response.data, null, 2)));
        }
        console.error(chalk.red('--- SYNTAXCORE API ERROR END ---'));
        throw error;
    }
}

module.exports = {
    generateSyntexResponse,
    generateContextSummary,
    SYSTEM_PROMPT
};

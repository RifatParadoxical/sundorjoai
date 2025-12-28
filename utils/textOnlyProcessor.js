const axios = require('axios');
const chalk = require('chalk').default || require('chalk');

const SYNTX_API_KEY = process.env.SYNTEX_CORE_KEY;

const SYSTEM_PROMPT = `You are Sundorjo AI, a premier clinical-grade skin intelligence assistant. Your role is to analyze skin concerns with dermatological precision.

Please follow this structured approach in formatted Markdown:

### 1. Problem Identification
Analyze the user's input to clearly identify the potential skin concern, condition, or skin type issue. Be precise and direct.

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

async function processTextOnlyRequest(text, imageUrl = null, conversationHistory = [], onThinking = null, chatId = 'default-session', contextSummary = '') {
    try {
        if (onThinking) {
            onThinking('Thinking...');
            await new Promise(r => setTimeout(r, 500));
            onThinking('Analyzing text input...');
            await new Promise(r => setTimeout(r, 600));
            onThinking('Searching clinical knowledge base...');
            await new Promise(r => setTimeout(r, 700));
            onThinking('Synthesizing dermatological advice...');
        }

        console.log(chalk.blue(`[${new Date().toISOString()}]`) + chalk.yellow(' Processing text-only request...'));

        // Format conversation history
        const historyText = conversationHistory.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n') + '\n\n';
        // Inject Context Summary into the prompt
        const contextBlock = contextSummary ? `

[PERSISTENT CONTEXT SUMMARY]:
${contextSummary}
` : '';

        
        const imageContext = imageUrl ? `

[IMAGE CONTEXT]: The user uploaded an image but image analysis failed. Please provide text-based advice based on the user's description and conversation history.
Image URL: ${imageUrl}` : '';

        const fullPrompt = `${contextBlock}${imageContext}\n\n${historyText}User: ${text}`;
        

        const endpoints = [
            {
                name: 'Deepseek',
                url: 'https://syntexcore.onrender.com/api/v1/deepseek-chat',
                data: { question: fullPrompt, apiKey: SYNTX_API_KEY }
            },
            {
                name: 'Public AI',
                url: 'https://syntexcore.onrender.com/api/v1/public-ai',
                data: { question: fullPrompt, apiKey: SYNTX_API_KEY }
            },
            {
                name: 'GPT OSS 120B',
                url: 'https://syntexcore.onrender.com/api/v1/gpt-oss-120b',
                data: { question: fullPrompt, apiKey: SYNTX_API_KEY }
            }
        ];

        





        const responses = [];
        
        for (const ep of endpoints) {
            try {
                console.log(chalk.blue(`[${new Date().toISOString()}]`) + chalk.yellow(` Calling ${ep.name} API...`));
                
                const logData = { ...ep.data, apiKey: '[REDACTED]' };
                console.log(chalk.blue(`[${new Date().toISOString()}]`) + chalk.yellow(` Sending request to ${ep.name} API (Full URL):`));
                console.log(chalk.gray('  - URL: ') + chalk.cyan(ep.url));
                console.log(chalk.gray('  - Payload: ') + chalk.white(JSON.stringify(logData, null, 2)));
                
                const response = await axios.post(ep.url, ep.data, { timeout: 30000 });
                
                console.log(chalk.blue(`[${new Date().toISOString()}]`) + chalk.green(` ${ep.name} API Raw Response:`));
             
                try {
                    console.log(chalk.gray('  - Data: ') + chalk.white(JSON.stringify(response.data, null, 2)));
                } catch (e) {
                    console.log(chalk.gray('  - Data: ') + chalk.white('Could not stringify response data due to circular references'));
                }

           
                


                let content = '';
                if (ep.name === 'Deepseek' && response.data && response.data.data && response.data.data.data && response.data.data.data.data) {
                    content = response.data.data.data.data.answer?.data?.response || response.data.data.data.data.response;
                } else if (ep.name === 'Public AI' && response.data && response.data.data && response.data.data.data) {
                    content = response.data.data.data.response;
                } else if (ep.name === 'GPT OSS 120B' && response.data && response.data.data && response.data.data.data) {
                    content = response.data.data.data.answer;
                }
                
                if (content) {
                    responses.push(`${ep.name} Output:\n${content}`);
                    console.log(chalk.blue(`[${new Date().toISOString()}]`) + chalk.green(` ${ep.name} Success! Response length: `) + chalk.yellow(content?.length));
                } else {
                    console.error(chalk.blue(`[${new Date().toISOString()}]`) + chalk.red(` ${ep.name} returned unexpected response format`));
               


                    try {
                        console.error(chalk.gray('  - Raw response: ') + chalk.yellow(JSON.stringify(response.data, null, 2)));
                    } catch (e) {
                        console.error(chalk.gray('  - Raw response: ') + chalk.yellow('Could not stringify response data due to circular references'));
                    }
                }



            } catch (error) {
                console.error(chalk.blue(`[${new Date().toISOString()}]`) + chalk.red(` Error calling ${ep.name} API: `) + chalk.yellow(error.message));
                if (error.response) {
                  


                    try {
                        console.error(chalk.red(`${ep.name} API response data: `) + chalk.yellow(JSON.stringify(error.response.data, null, 2)));
                        console.error(chalk.red(`${ep.name} API status: `) + chalk.yellow(error.response.status));
                        
                      
                        if (error.response.status === 429) {
                            console.error(chalk.red(`${ep.name} API returned rate limit error (429), continuing to next API...`));
                          
                            continue;
                        }
                    } catch (e) {
                        console.error(chalk.red(`${ep.name} API response data: `) + chalk.yellow('Could not stringify response data due to circular references'));
                        console.error(chalk.red(`${ep.name} API status: `) + chalk.yellow(error.response.status));
                        
                       
                        if (error.response && error.response.status === 429) {
                            console.error(chalk.red(`${ep.name} API returned rate limit error (429), continuing to next API...`));
                           
                            continue;
                        }
                    }
                }
                
                
                

                responses.push(`${ep.name} Output: API call failed, unable to process request`);
            }
        }


        

        if (responses.length === 0) {
            throw new Error('All text AI models failed to respond');
        }

        if (onThinking) onThinking('Synthesizing the best response with Grok-3...');

   




        const grokPrompt = `User asked: "${text}"
${SYSTEM_PROMPT}

I have collected several responses from different AI models. Please analyze them and select/synthesize the absolute best, most accurate, and most helpful response for the user, following the Sundorjo AI persona and requested Markdown format.

Responses:
${responses.join('\n\n')}

Please provide a comprehensive, helpful response that addresses the user's query directly.`;

       
        const grokUrl = 'https://syntexcore.onrender.com/api/v1/grok-3-mini';
        console.log(chalk.blue(`[${new Date().toISOString()}]`) + chalk.yellow(' Sending synthesis request to Grok-3 (Full URL):'));
        console.log(chalk.gray('  - URL: ') + chalk.cyan(grokUrl));
        
        let grokResponse;
        try {
            grokResponse = await axios.post(grokUrl, {
                question: grokPrompt,
                apiKey: SYNTX_API_KEY
            }, { timeout: 30000 });
        } catch (grokError) {
            console.error(chalk.red('Grok-3 API call failed:'), grokError.message);
            if (grokError.response) {
          
                try {
                    console.error(chalk.red('Grok-3 API response data:'), JSON.stringify(grokError.response.data, null, 2));
                    console.error(chalk.red('Grok-3 API status:'), grokError.response.status);
                    
              
                    if (grokError.response.status === 429) {
                        console.error(chalk.red('Grok-3 API returned rate limit error (429), using first available response...'));
                       
                        
                        return {
                            success: true,
                            result: responses[0].split('\n').slice(1).join('\n')
                        };
                    }


                } catch (e) {
                    console.error(chalk.red('Grok-3 API response data:'), 'Could not stringify response data due to circular references');
                    console.error(chalk.red('Grok-3 API status:'), grokError.response.status);
                    
                  
                    if (grokError.response && grokError.response.status === 429) {
                        console.error(chalk.red('Grok-3 API returned rate limit error (429), using first available response...'));
                   


                        return {
                            success: true,
                            result: responses[0].split('\n').slice(1).join('\n')
                        };
                    }
                }
            }
  
            

            throw grokError;
        }

        console.log(chalk.blue(`[${new Date().toISOString()}]`) + chalk.green(' Grok-3 Raw Response:'));
     


        try {
            console.log(chalk.gray('  - Data: ') + chalk.white(JSON.stringify(grokResponse.data, null, 2)));
        } catch (e) {
            console.log(chalk.gray('  - Data: ') + chalk.white('Could not stringify response data due to circular references'));
        }

        if (grokResponse.data && grokResponse.data.status === 'success' && grokResponse.data.data && grokResponse.data.data.data) {
            return {
                success: true,
                result: grokResponse.data.data.data.answer
            };
        }
        
        console.error(chalk.blue(`[${new Date().toISOString()}]`) + chalk.red(' Grok-3 synthesis failed or returned non-success status:'));

        
        try {
            console.error(chalk.gray('  - Data: ') + chalk.yellow(JSON.stringify(grokResponse.data, null, 2)));
        } catch (e) {
            console.error(chalk.gray('  - Data: ') + chalk.yellow('Could not stringify response data due to circular references'));
        }
        

        
        return {
            success: true,
            result: responses[0].split('\n').slice(1).join('\n')
        };
    } catch (error) {
        console.error(chalk.red('--- TEXT-ONLY PROCESSOR ERROR START ---'));
        console.error(chalk.red('Error: ') + chalk.yellow(error.message));
        console.error(chalk.red('Stack: ') + chalk.gray(error.stack));
        if (error.response) {
    
            
            
            try {
                console.error(chalk.red('Response Data: ') + chalk.white(JSON.stringify(error.response.data, null, 2)));
            } catch (e) {
                console.error(chalk.red('Response Data: ') + chalk.white('Could not stringify response data due to circular references'));
            }
        }
        console.error(chalk.red('--- TEXT-ONLY PROCESSOR ERROR END ---'));
        throw error;
    }
}

module.exports = {
    processTextOnlyRequest,
    SYSTEM_PROMPT
};
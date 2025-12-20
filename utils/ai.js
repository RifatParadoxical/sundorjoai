const axios = require('axios');

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

/**
 * Generates AI response using xqc-api
 * @param {string} text - User's query text
 * @param {string} imageUrl - URL of the image to analyze
 * @returns {Promise<Object>} - The API response data
 */
async function generateAIResponse(text, imageUrl) {
    try {
        console.log('Sending request to AI...');
        const apiPayload = {
            text: text,
            systemPrompt: SYSTEM_PROMPT,
            imageUrl: imageUrl,
            sessionId: Math.random().toString(36).substring(7)
        };

        const gptRes = await axios.post('https://xqc-api.vercel.app/api/v1/generate', apiPayload);
        return gptRes.data;
    } catch (error) {
        console.error('Error calling AI API:', error.message);
        throw error;
    }
}

module.exports = {
    generateAIResponse
};

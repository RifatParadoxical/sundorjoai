const axios = require('axios');

const API_KEY = process.env.SYNTEX_CORE_KEY;
const API_URL = "https://syntexcore.onrender.com/api/v1/grok-3-mini";

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





async function generateGrokResponse(text) {
    try {
        console.log('Sending request to Grok AI...');
        const apiPayload = {
            question: `${SYSTEM_PROMPT}\n\nUser Query: ${text}`,
            apiKey: API_KEY
        };

        const response = await axios.post(API_URL, apiPayload);




        if (response.data && response.data.data && response.data.data.data && response.data.data.data.answer) {
            return {
                success: true,
                result: response.data.data.data.answer
            };
        }

        throw new Error("Invalid response structure from Grok API");

    } catch (error) {
        console.error('Error calling Grok API:', error.message);
        throw error;
    }
}

module.exports = {
    generateGrokResponse
};

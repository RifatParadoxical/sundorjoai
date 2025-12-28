# Sundorjo AI - Skin Intelligence Assistant

## Overview
Sundorjo AI is an AI-powered skin intelligence assistant that provides personalized skincare advice through image analysis and text-based queries. The application integrates with multiple AI services to provide clinical-grade dermatological insights.

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB
- Cloudinary account (for image uploads)
- API keys for AI services (SyntexCore, OpenRouter, gemini etc.)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ScriptySphere/sundorjoai.git
cd sundorjo

# (if you are using vs code)
code .
# or (if using vs code insiders)
code-insiders .
# or (if using codium)
codium .
# or (if using kate code editor)
kate .
# or (if using notepad)
notepad .
# or (if using sublime text)
subl .
```

2. Install dependencies:
```bash
npm install 
```

3. Create a `.env` file in the root directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
CLOUDINARY_URL=your_cloudinary_url
SYNTEX_CORE_KEY=your_syntex_core_api_key
OPEN_ROUTER=your_open_router_api_key
AI_MODEL=your_preferred_ai_model
APP_URL=http://localhost:3000
```

4. Start the application:
```bash
npm start
# or
node .
```

## About the Tailwind CSS Error

You may see the following warning in your browser console:
```
cdn.tailwindcss.com should not be used in production. To use Tailwind CSS in production, install it as a PostCSS plugin or use the Tailwind CLI: https://tailwindcss.com/docs/installation
```

### Why This Error Occurs

This warning appears because the application is currently using Tailwind CSS via CDN for development purposes. This approach is convenient for rapid development but not recommended for production.

### How to Fix This Error

To resolve this warning and properly implement Tailwind CSS for production:

1. Install Tailwind CSS and its dependencies:
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

2. Configure `tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.{html,js,ejs}",
    "./public/**/*.{html,js,ejs}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

3. Add Tailwind directives to your CSS:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

4. Update your build process to compile Tailwind CSS instead of using the CDN.

## Features

- AI-powered skin analysis with image upload capability
- Multi-model AI integration (Deepseek, Perplexity, Venice, Grok-3)
- Cloudinary integration for image uploads
- Conversation history and chat persistence
- Responsive design with professional UI

## API Endpoints

- `GET /` - Home page
- `GET /chat` - Chat interface
- `GET /chat/:chatId` - Specific chat session
- `POST /api/chat/:chatId` - Send messages to AI
- `GET /api/chat/:chatId/messages` - Get chat history
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `POST /auth/logout` - User logout

## Troubleshooting

### Common Issues

1. **500 Internal Server Error during image upload**:
   - Check that your Cloudinary credentials are properly configured
   - Verify your API keys are valid
   - Check the server console for detailed error information

2. **API Connection Errors**:
   - Ensure all required API keys are set in your `.env` file
   - Check that your internet connection is stable
   - Verify that the AI service endpoints are accessible

3. **Session/Authentication Issues**:
   - Make sure your MongoDB connection is working
   - Verify that SESSION_SECRET is set in your environment variables

### Detailed Error Logging

The application logs detailed error information to the server console, including:
- Error type and stack trace
- Chat ID and User ID
- User text and image information
- Detailed image file information (original name, size, mimetype)
- API response status, data, and headers if available

## Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `SESSION_SECRET` - Secret key for session encryption
- `CLOUDINARY_URL` - Cloudinary configuration URL
- `SYNTEX_CORE_KEY` - API key for SyntexCore services
- `OPEN_ROUTER` - API key for OpenRouter (fallback option)
- `AI_MODEL` - Preferred AI model identifier
- `APP_URL` - Application URL

## Contributing

Feel free to submit issues and enhancement requests. Pull requests are welcome.

## License

This project is licensed under the MIT License.

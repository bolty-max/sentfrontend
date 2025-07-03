# VoiceInsight - AI-Powered Speech Analysis Platform

A production-ready React application that analyzes speech for emotions, sentiment, and provides AI-powered conversational insights with wellness recommendations.

## 🚀 Features

- **Real-time Speech Analysis**: Convert speech to text with emotion and sentiment analysis
- **AI Conversations**: Intelligent responses based on detected emotions and context
- **Multi-language Support**: Enhanced support for South Indian languages (Tamil, Telugu, Kannada, Malayalam)
- **Emotion Dashboard**: Advanced visualization of emotional patterns and insights
- **Wellness System**: AI-powered wellness recommendations and breathing exercises
- **Responsive Design**: Optimized for mobile, tablet, and desktop with gesture controls
- **Conversation History**: Persistent conversation management with emotional summaries
- **Voice Synthesis**: Text-to-speech with emotional adaptation

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Chart.js, Recharts
- **AI Integration**: OpenAI GPT-3.5-turbo
- **Audio Processing**: Web Audio API, MediaRecorder API
- **State Management**: React Hooks, Local Storage
- **Build Tool**: Vite
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- OpenAI API Key
- Backend API (FastAPI recommended)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd voiceinsight-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   VITE_API_URL=https://your-backend-api.vercel.app
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Development Server**
   ```bash
   npm run dev
   ```

## 🚀 Deployment to Vercel

### Automatic Deployment

1. **Connect to Vercel**
   - Push your code to GitHub/GitLab/Bitbucket
   - Import project in Vercel dashboard
   - Vercel will auto-detect the Vite configuration

2. **Environment Variables**
   Set these in Vercel dashboard:
   ```
   VITE_API_URL=https://your-backend-api.vercel.app
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Deploy**
   - Vercel will automatically build and deploy
   - Get your production URL

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add VITE_API_URL
vercel env add VITE_OPENAI_API_KEY

# Redeploy with environment variables
vercel --prod
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ChatInterface.tsx
│   ├── EmotionDashboard.tsx
│   ├── WellnessSystem.tsx
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useResponsiveDesign.ts
│   ├── useHapticFeedback.ts
│   └── ...
├── services/           # API and business logic
│   ├── api.ts
│   ├── openai.ts
│   ├── conversationManager.ts
│   └── ...
├── styles/             # CSS and styling
│   ├── theme.css
│   ├── responsive.css
│   └── ...
├── types/              # TypeScript definitions
└── utils/              # Utility functions
```

## 🔧 Configuration

### API Configuration

The app expects a FastAPI backend with these endpoints:
- `POST /api/process-audio` - Audio processing
- `GET /api/supported-languages` - Language support
- `GET /api/supported-emotions` - Emotion categories
- `POST /api/analyze-sentiment` - Text sentiment analysis

### OpenAI Integration

Configure OpenAI for AI conversations:
```typescript
// In production, use a backend proxy for security
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for demo purposes
});
```

### Responsive Design

The app automatically adapts to different devices:
- **Mobile**: Bottom navigation, single-column layout
- **Tablet**: Side navigation, split layout
- **Desktop**: Full dashboard with multiple panels
- **Foldable**: Dynamic layout based on fold state

## 🎨 Customization

### Themes
- Light/Dark mode with smooth transitions
- Emotion-based color theming
- Accessible high-contrast mode

### AI Personalities
Configure different AI conversation styles:
```typescript
const personalities = [
  { id: 'supportive', name: 'Supportive Friend' },
  { id: 'professional', name: 'Life Coach' },
  { id: 'casual', name: 'Casual Buddy' },
  { id: 'therapist', name: 'Therapeutic Listener' }
];
```

## 🔒 Security Considerations

### Production Recommendations

1. **API Key Security**
   - Use backend proxy for OpenAI API calls
   - Implement rate limiting
   - Add request authentication

2. **Data Privacy**
   - Audio data is processed client-side when possible
   - Implement data retention policies
   - Add user consent mechanisms

3. **Error Handling**
   - Comprehensive error boundaries
   - Graceful fallbacks for API failures
   - User-friendly error messages

## 📊 Performance Optimization

- **Code Splitting**: Lazy loading of components
- **Caching**: API response caching
- **Compression**: Gzip compression via Vercel
- **CDN**: Global edge network via Vercel
- **Bundle Analysis**: Optimized bundle size

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

## 📈 Monitoring

### Production Monitoring

1. **Error Tracking**
   - Integrate Sentry for error monitoring
   - Custom error boundaries with reporting

2. **Analytics**
   - User interaction tracking
   - Performance metrics
   - Conversion funnel analysis

3. **Performance**
   - Core Web Vitals monitoring
   - API response time tracking
   - User experience metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the troubleshooting guide

## 🔄 Updates

The application includes automatic update checking and graceful handling of new versions.

---

Built with ❤️ using React, TypeScript, and modern web technologies.
import OpenAI from 'openai';

// Enhanced OpenAI configuration for production
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Note: In production, use a backend proxy
  maxRetries: 3,
  timeout: 30000, // 30 seconds
});

export interface AIResponse {
  content: string;
  reasoning?: string;
}

export interface ConversationContext {
  transcript: string;
  sentiment: string;
  emotions: any;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  personality: string;
}

const PERSONALITY_PROMPTS = {
  supportive: `You are a supportive and empathetic friend. You listen carefully, validate emotions, and offer gentle encouragement. You're warm, understanding, and always look for the positive while acknowledging difficulties. Use a caring, conversational tone. Keep responses under 150 words unless specifically asked for detailed advice.`,
  
  professional: `You are a professional life coach. You're insightful, goal-oriented, and help people find practical solutions. You ask thoughtful questions, provide structured advice, and help users develop actionable plans. Maintain a professional yet approachable tone. Focus on growth and development.`,
  
  casual: `You are a casual, friendly buddy. You're relaxed, use everyday language, and keep things light and fun. You're supportive but not overly serious, and you know when to inject humor appropriately. Be conversational and relatable while still being helpful.`,
  
  therapist: `You are a compassionate therapeutic listener. You practice active listening, ask open-ended questions, and help people explore their feelings without judgment. You're patient, insightful, and skilled at helping people understand their emotions. Use therapeutic communication techniques while remaining warm and approachable.`
};

export const generateAIResponse = async (context: ConversationContext): Promise<AIResponse> => {
  // Validate API key
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const { transcript, sentiment, emotions, conversationHistory, personality } = context;
    
    const systemPrompt = PERSONALITY_PROMPTS[personality as keyof typeof PERSONALITY_PROMPTS] || PERSONALITY_PROMPTS.supportive;
    
    const emotionContext = emotions ? `
    Detected emotions: Primary emotion is "${emotions.primary_emotion}" (${emotions.category}, ${emotions.intensity} intensity).
    Top emotions: ${emotions.top_emotions?.map((e: any) => `${e.emotion} (${(e.score * 100).toFixed(1)}%)`).join(', ') || 'None'}
    ` : '';

    const messages = [
      {
        role: 'system' as const,
        content: `${systemPrompt}

        You are responding to someone who just spoke to you. Here's the context:
        - What they said: "${transcript}"
        - Overall sentiment: ${sentiment}
        ${emotionContext}
        
        Respond naturally and appropriately to their emotional state. Show that you understand their emotional state through your response tone and content. Be helpful, empathetic, and engaging.`
      },
      ...conversationHistory.slice(-8), // Keep last 8 messages for context
      {
        role: 'user' as const,
        content: transcript
      }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 200,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
      stream: false,
    });

    const content = completion.choices[0]?.message?.content || "I'm here to listen. Could you tell me more about what's on your mind?";

    return {
      content: content.trim()
    };

  } catch (error: any) {
    console.error('Error generating AI response:', error);
    
    // Enhanced fallback responses based on sentiment and emotions
    const getFallbackResponse = () => {
      if (context.emotions?.primary_emotion) {
        const emotion = context.emotions.primary_emotion;
        
        const emotionResponses: { [key: string]: string } = {
          happy: "I can hear the joy in your voice! That's wonderful. What's bringing you such happiness?",
          sad: "I can sense you're feeling down right now. I'm here to listen. Would you like to share what's troubling you?",
          angry: "I can tell you're feeling frustrated or upset. Those feelings are valid. What's causing this anger?",
          anxious: "I notice you might be feeling anxious. That can be really difficult. Take a deep breath - I'm here with you.",
          fear: "I can sense some worry or fear in what you're sharing. You're safe here to express these feelings.",
          love: "There's such warmth in what you're sharing. Love is a beautiful emotion to experience.",
          pride: "I can hear the pride in your voice, and that's wonderful! You should feel good about your accomplishments.",
          relief: "It sounds like a weight has been lifted off your shoulders. Relief can feel so freeing."
        };
        
        if (emotionResponses[emotion]) {
          return emotionResponses[emotion];
        }
      }
      
      // Fallback based on sentiment
      const sentimentResponses = {
        positive: "I can hear the positivity in your voice! That's wonderful. Tell me more about what's making you feel good.",
        negative: "I can sense you're going through something challenging. I'm here to listen and support you. Would you like to talk about what's bothering you?",
        neutral: "I'm listening carefully to what you're sharing. What's on your mind today? Feel free to tell me more."
      };

      return sentimentResponses[context.sentiment as keyof typeof sentimentResponses] || sentimentResponses.neutral;
    };

    return {
      content: getFallbackResponse()
    };
  }
};

export const generateWellnessRecommendation = async (emotions: any): Promise<string> => {
  if (!emotions || !import.meta.env.VITE_OPENAI_API_KEY) return '';

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a wellness coach. Provide a brief, actionable wellness tip or recommendation based on the detected emotions. Keep it under 50 words and make it practical and immediately actionable.'
        },
        {
          role: 'user',
          content: `Primary emotion: ${emotions.primary_emotion} (${emotions.category}, ${emotions.intensity} intensity). Suggest a helpful wellness tip.`
        }
      ],
      max_tokens: 80,
      temperature: 0.6
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating wellness recommendation:', error);
    
    // Fallback wellness tips based on emotion
    const fallbackTips: { [key: string]: string } = {
      anxious: "Try the 4-7-8 breathing technique: inhale for 4, hold for 7, exhale for 8.",
      sad: "Take a moment to acknowledge your feelings. Consider reaching out to someone you trust.",
      angry: "Take 5 deep breaths and count to 10. Physical movement can help release tension.",
      happy: "Savor this positive moment! Consider writing down what made you feel this way.",
      fear: "Ground yourself by naming 5 things you can see, 4 you can touch, 3 you can hear."
    };
    
    return fallbackTips[emotions.primary_emotion] || "Take a moment to breathe deeply and be present with your feelings.";
  }
};

// Utility function to check if OpenAI is properly configured
export const isOpenAIConfigured = (): boolean => {
  return !!import.meta.env.VITE_OPENAI_API_KEY;
};
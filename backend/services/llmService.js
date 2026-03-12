const Groq = require('groq-sdk');
const NodeCache = require('node-cache');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

function extractJsonObject(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty LLM response');
  }

  const trimmed = rawText.trim();

  try {
    return JSON.parse(trimmed);
  } catch (error) {
    const cleaned = trimmed
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch (innerError) {
      const match = cleaned.match(/\{[\s\S]*\}/);

      if (!match) {
        throw new Error('Invalid JSON response from LLM');
      }

      return JSON.parse(match[0]);
    }
  }
}

// Cache for LLM responses (TTL: 1 hour)
const cache = new NodeCache({ stdTTL: 3600 });

class LLMService {
  static async analyzeJournalText(text) {
    // Create a cache key based on the text hash
    const cacheKey = `analysis_${Buffer.from(text).toString('base64').slice(0, 32)}`;
    
    // Check cache first
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      console.log('Returning cached LLM analysis');
      return cachedResult;
    }

    const prompt = `Analyze the following journal entry and return ONLY a valid JSON object with the following structure:
{
  "emotion": "primary emotion from: happy, sad, calm, anxious, excited, frustrated, peaceful, angry, hopeful, confused",
  "keywords": ["array", "of", "3-5", "relevant", "keywords"],
  "summary": "brief one-sentence summary of the entry"
}

Journal entry: "${text}"

Rules:
- Return raw JSON only
- Do not use markdown code fences
- Keep keywords short and lowercase
- Pick the closest emotion from the allowed list

Return only the JSON object, no other text:`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert in emotional analysis of personal journal entries. Always respond with valid raw JSON only. Do not wrap JSON in markdown."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: DEFAULT_MODEL,
        temperature: 0.3,
        max_tokens: 200,
      });

      const responseText = completion.choices[0]?.message?.content?.trim();
      
      if (!responseText) {
        throw new Error('No response from LLM');
      }

      // Parse and validate the JSON response
      let analysis;
      try {
        analysis = extractJsonObject(responseText);
      } catch (parseError) {
        console.error('Failed to parse LLM response:', responseText);
        throw parseError;
      }

      // Validate required fields
      if (!analysis.emotion || !analysis.keywords || !analysis.summary) {
        throw new Error('Incomplete analysis response from LLM');
      }

      // Ensure keywords is an array
      if (!Array.isArray(analysis.keywords)) {
        analysis.keywords = [];
      }

      analysis.emotion = String(analysis.emotion).toLowerCase().trim();
      analysis.summary = String(analysis.summary).trim();
      analysis.keywords = analysis.keywords
        .map((keyword) => String(keyword).toLowerCase().trim())
        .filter(Boolean)
        .slice(0, 5);

      // Cache the result
      cache.set(cacheKey, analysis);
      
      return analysis;
    } catch (error) {
      console.error('Error in LLM analysis:', error.message);
      console.error('Full error details:', error);
      
      // Fallback response if LLM fails
      return {
        emotion: 'neutral',
        keywords: ['journal', 'reflection'],
        summary: 'Unable to analyze this entry at the moment'
      };
    }
  }

  static getCacheStats() {
    return {
      keys: cache.keys().length,
      hits: cache.getStats().hits,
      misses: cache.getStats().misses
    };
  }
}

module.exports = LLMService;
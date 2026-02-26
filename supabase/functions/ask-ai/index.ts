// ⚡ SUPABASE EDGE FUNCTION: ask-ai
// Deploy instructions:
// 1. supabase functions new ask-ai
// 2. Paste this code into index.ts
// 3. supabase secrets set GEMINI_API_KEY=your_key_here
// 4. supabase functions deploy ask-ai

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// Fixed: Using the correct @google/genai SDK as per guidelines
import { GoogleGenAI } from "https://esm.sh/@google/genai";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, config, history } = await req.json();
    
    // Fixed: Always initialize with GoogleGenAI and obtain API key from process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    let textResponse = '';

    if (history && history.length > 0) {
      // Fixed: Using ai.chats.create for conversational tasks
      const chat = ai.chats.create({
        model: config?.model || 'gemini-3-flash-preview',
        history: history.map((h: any) => ({
          role: h.role === 'model' ? 'model' : 'user',
          parts: [{ text: h.text }],
        })),
        config: {
            maxOutputTokens: config?.maxOutputTokens || 500,
        }
      });
      
      const result = await chat.sendMessage({ message: prompt });
      // Fixed: Access result.text property directly
      textResponse = result.text || "NO_DATA_PACKET";
    } else {
      // Fixed: Using ai.models.generateContent directly for single prompt mode
      const response = await ai.models.generateContent({
        model: config?.model || 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          maxOutputTokens: config?.maxOutputTokens || 500,
        }
      });
      // Fixed: Access response.text property directly
      textResponse = response.text || "NO_DATA_PACKET";
    }

    return new Response(JSON.stringify({ text: textResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
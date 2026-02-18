// ⚡ SUPABASE EDGE FUNCTION: ask-ai
// Deploy instructions:
// 1. supabase functions new ask-ai
// 2. Paste this code into index.ts
// 3. supabase secrets set GEMINI_API_KEY=your_key_here
// 4. supabase functions deploy ask-ai

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenAI } from "https://esm.sh/@google/genai@0.1.1";

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
    
    // Get API Key from Deno environment (Supabase Secrets)
    const apiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('API_KEY');
    
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY in environment variables");
    }

    const ai = new GoogleGenAI({ apiKey });

    let textResponse = '';

    if (history && history.length > 0) {
      // Conversational mode
      try {
        const chat = ai.chats.create({
          model: config?.model || 'gemini-2.0-flash-exp', // Fallback to a stable model if preview fails
          history: history.map((h: any) => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: [{ text: h.text }],
          })),
          config: {
            maxOutputTokens: config?.maxOutputTokens || 500,
          }
        });
        
        const result = await chat.sendMessage({ message: prompt });
        textResponse = result.text || "NO_DATA_PACKET";
      } catch (chatError: any) {
        console.error("Chat Error:", chatError);
        throw new Error(`Chat API Error: ${chatError.message}`);
      }
    } else {
      // Single prompt mode
      try {
        const response = await ai.models.generateContent({
          model: config?.model || 'gemini-2.0-flash-exp',
          contents: prompt,
          config: {
            maxOutputTokens: config?.maxOutputTokens || 500,
          }
        });
        textResponse = response.text || "NO_DATA_PACKET";
      } catch (genError: any) {
         console.error("Generate Error:", genError);
         throw new Error(`Generate API Error: ${genError.message}`);
      }
    }

    return new Response(JSON.stringify({ text: textResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

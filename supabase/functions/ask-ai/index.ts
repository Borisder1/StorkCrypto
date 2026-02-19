// ⚡ SUPABASE EDGE FUNCTION: ask-ai
// Deploy instructions:
// 1. supabase functions new ask-ai
// 2. Paste this code into index.ts
// 3. supabase secrets set GEMINI_API_KEY=your_key_here
// 4. supabase functions deploy ask-ai

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
      return new Response(JSON.stringify({
        text: "AI_API_KEY_NOT_CONFIGURED",
        error: "Missing GEMINI_API_KEY in environment variables"
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use Google GenAI REST API directly
    const modelName = config?.model || 'gemini-2.0-flash';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const requestBody: any = {
      contents: history && history.length > 0
        ? [...history.map((h: any) => ({
          role: h.role === 'model' ? 'model' : 'user',
          parts: [{ text: h.text }]
        })), { role: 'user', parts: [{ text: prompt }] }]
        : [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: config?.maxOutputTokens || 500,
        temperature: config?.temperature || 0.7,
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      return new Response(JSON.stringify({
        text: "AI_REQUEST_FAILED",
        error: `Gemini API Error: ${response.status}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "NO_DATA_PACKET";

    return new Response(JSON.stringify({ text: textResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Function Error:", error);
    return new Response(JSON.stringify({
      text: "AI_FUNCTION_ERROR",
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

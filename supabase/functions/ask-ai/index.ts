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
    
    // Забираємо ключ безпечно з середовища Supabase (НЕ З ФРОНТЕНДУ Cloudflare)
    const NVIDIA_API_KEY = Deno.env.get('NVIDIA_API_KEY');

    if (!NVIDIA_API_KEY) {
        throw new Error("Missing NVIDIA_API_KEY environment variable in Supabase Secrets");
    }

    let messages = [];

    // Формуємо контекст. NVIDIA використовує OpenAI-сумісний формат (role: system/user/assistant)
    if (config?.systemInstruction) {
        messages.push({ role: 'system', content: config.systemInstruction });
    }

    if (history && history.length > 0) {
      messages.push(...history.map((h: any) => ({
        role: h.role === 'model' ? 'assistant' : 'user',
        content: h.text
      })));
    }
    
    messages.push({ role: 'user', content: prompt });

    // Робимо запит до безкоштовного API NVIDIA
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${NVIDIA_API_KEY}`
        },
        body: JSON.stringify({
            model: "moonshotai/kimi-k2-thinking",
            messages: messages,
            temperature: config?.temperature || 0.7,
            top_p: 0.9,
            max_tokens: config?.maxOutputTokens || 2048,
            stream: false // Використовуємо stream: false для простоти інтеграції в існуючу архітектуру
        })
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`NVIDIA API Error: ${errorData}`);
    }

    const data = await response.json();
    let textResponse = data.choices?.[0]?.message?.content || "NO_DATA_PACKET";

    // Якщо увімкнене мислення (reasoning) в цій моделі, ми можемо додати його як <thinking>
    const reasoning = data.choices?.[0]?.message?.reasoning_content;
    if (reasoning) {
        textResponse = `<thinking>\n${reasoning}\n</thinking>\n${textResponse}`;
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
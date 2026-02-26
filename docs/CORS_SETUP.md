# Налаштування CORS для Supabase Edge Functions

## Проблема
При спробі виклику Supabase Edge Functions з веб-додатку виникає помилка CORS:
```
Access to fetch at 'https://ercabbqautbsktrgzbft.supabase.co/functions/v1/ask-ai' 
from origin 'https://af16ab13.storkcrypto-app.pages.dev' has been blocked by CORS policy
```

## Рішення

### 1. Налаштування CORS у Supabase Dashboard

1. Відкрийте [Supabase Dashboard](https://supabase.com/dashboard)
2. Перейдіть до вашого проекту
3. Виберіть **Edge Functions** у бічному меню
4. Клацніть на функцію `ask-ai`
5. Перейдіть до вкладки **Configuration** або **Settings**
6. Додайте наступні дозволені origins:

```
https://storkcrypto.netlify.app
https://af16ab13.storkcrypto-app.pages.dev
https://borisder1.github.io
http://localhost:5173
http://localhost:3000
*
```

### 2. Додавання CORS заголовків у код Function

Відредагуйте файл `supabase/functions/ask-ai/index.ts`:

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { GoogleGenAI } from "https://esm.sh/@google/genai@0.1.1";

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, config, history } = await req.json();
    
    // ... your AI logic here ...
    
    return new Response(
      JSON.stringify({ text: response }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
```

### 3. Деплой оновленої Function

```bash
# Встановіть Supabase CLI, якщо ще не встановлено
npm install -g supabase

# Авторизуйтесь
supabase login

# Підключіться до проекту
supabase link --project-ref ercabbqautbsktrgzbft

# Задеплойте функцію
supabase functions deploy ask-ai
```

### 4. Альтернатива: Використання Netlify Functions

Якщо Supabase Edge Functions продовжують мати проблеми з CORS, можна створити проксі через Netlify Functions:

Створіть файл `netlify/functions/ask-ai.ts`:

```typescript
import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  const response = await fetch('https://ercabbqautbsktrgzbft.supabase.co/functions/v1/ask-ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
    },
    body: event.body,
  });

  const data = await response.json();
  
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
```

### 5. Перевірка

Після налаштування перевірте, що CORS працює:

```bash
curl -X OPTIONS \
  https://ercabbqautbsktrgzbft.supabase.co/functions/v1/ask-ai \
  -H "Origin: https://storkcrypto.netlify.app" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Відповідь повинна містити заголовки:
```
< Access-Control-Allow-Origin: https://storkcrypto.netlify.app
< Access-Control-Allow-Methods: POST
```

## Поточний статус
- Fallback на локальний Gemini API працює
- Supabase Edge Functions потребують налаштування CORS
- Додаток продовжує працювати через fallback механізм

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    
    // Support multiple keys (comma separated) or multiple env vars
    const apiKeysString = env.NVIDIA_API_KEY || "";
    const keys = apiKeysString.split(',').map(k => k.trim()).filter(k => k);
    
    if (keys.length === 0) {
      return new Response(JSON.stringify({ error: 'No API keys configured' }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    // Select a random key to distribute load
    const selectedKey = keys[Math.floor(Math.random() * keys.length)];
    
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${selectedKey}`
      },
      body: JSON.stringify({
        model: body.model || "minimaxai/minimax-m2.7",
        messages: body.messages,
        temperature: body.temperature || 0.7,
        top_p: body.top_p || 0.95,
        max_tokens: body.max_tokens || 8192,
        stream: false
      })
    });
    
    const data = await response.text();
    
    return new Response(data, {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}

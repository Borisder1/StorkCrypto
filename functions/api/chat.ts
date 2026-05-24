export async function onRequestPost(context) {
  try {
    const NVIDIA_API_KEY = context.env.NVIDIA_API_KEY;
    
    if (!NVIDIA_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing NVIDIA_API_KEY environment variable in Cloudflare settings" }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const requestBody = await context.request.json();
    
    // Forward to Nvidia API
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.text();
        return new Response(JSON.stringify({ error: `NVIDIA API Error: ${errorData}` }), { 
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
  }
}

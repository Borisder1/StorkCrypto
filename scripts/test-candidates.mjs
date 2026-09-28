import https from 'https';

const candidateVideos = [
  { id: 'd8IBpfs9bf4', title: 'What are Crypto Wallets' },
  { id: 'a5XfQWUUZM8', title: 'What is Cryptocurrency' },
  { id: '3rL0OIXbMio', title: 'How Does Blockchain Work' },
  { id: 'Wnf2vKG90w8', title: 'What is Bitcoin' },
  { id: '2VtH-XAOjXw', title: 'What is Cryptocurrency Mining' },
  { id: 'URZuENfa8tI', title: 'Trading Fundamentals' },
  { id: 'YqoJ_fOHoH8', title: 'Trading Strategies' },
  { id: 'STFXi-FNzJM', title: 'BNB Vault' },
  { id: 'SSo_EIwHSd4', title: 'Blockchain Explained Binance' },
  { id: 'w_3B_wX-f2M', title: 'Spot vs Futures' },
  { id: 'B3nIq2m2j7c', title: 'Orders Guide' },
  { id: 'W3pB58_v6fA', title: 'Pinbar' }
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, contentType: res.headers['content-type'], data });
      });
    }).on('error', (err) => resolve({ status: 500, error: err.message }));
  });
}

async function run() {
  console.log('Testing candidates...');
  for (const v of candidateVideos) {
    const oembed = await checkUrl(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${v.id}&format=json`);
    const thumb = await checkUrl(`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`);
    let author = '';
    let title = '';
    if (oembed.status === 200) {
      try {
        const j = JSON.parse(oembed.data);
        author = j.author_name;
        title = j.title;
      } catch (e) {}
    }
    console.log(`[${v.id}] oEmbed: ${oembed.status} | Thumb: ${thumb.status} | Author: "${author}" | Title: "${title}"`);
  }
}

run();

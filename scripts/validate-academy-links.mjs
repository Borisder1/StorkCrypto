import https from 'https';

const ALLOWED_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'binance.com',
  'www.binance.com',
  'academy.binance.com',
  'bybit.com',
  'learn.bybit.com',
  'okx.com',
  'www.okx.com',
  'img.youtube.com'
]);

function validateUrl(urlStr) {
  if (!urlStr) return { valid: false, reason: 'Empty URL' };
  if (!urlStr.startsWith('https://')) return { valid: false, reason: 'Must start with https://' };
  if (urlStr.includes('javascript:') || urlStr.includes('data:') || urlStr.includes('blob:') || urlStr.includes('file:')) {
    return { valid: false, reason: 'Contains unsafe scheme' };
  }
  if (urlStr.includes('bit.ly') || urlStr.includes('t.me') || urlStr.includes('olx.ua') || urlStr.includes('olx.com')) {
    return { valid: false, reason: 'Contains forbidden domain or shortener' };
  }
  try {
    const parsed = new URL(urlStr);
    if (!ALLOWED_HOSTS.has(parsed.hostname)) {
      return { valid: false, reason: `Hostname not in allowlist: ${parsed.hostname}` };
    }
  } catch (e) {
    return { valid: false, reason: 'Invalid URL format' };
  }
  return { valid: true };
}

function checkHttps(urlStr) {
  return new Promise((resolve) => {
    try {
      const u = new URL(urlStr);
      const req = https.get(urlStr, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; StorkAcademyBot/1.0)' },
        timeout: 10000
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            contentType: res.headers['content-type'] || '',
            body
          });
        });
      });
      req.on('error', (err) => resolve({ status: 500, error: err.message }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ status: 408, error: 'Timeout' });
      });
    } catch (e) {
      resolve({ status: 400, error: e.message });
    }
  });
}

export async function validateLesson(lesson) {
  const errors = [];
  const warnings = [];

  // 1. Basic properties
  if (!lesson.id) errors.push('Missing lesson id');
  if (!lesson.fallbackUrl) errors.push('Missing required fallbackUrl');
  if (!lesson.provider || !['binance', 'bybit', 'okx'].includes(lesson.provider)) {
    errors.push(`Invalid provider: ${lesson.provider}`);
  }

  // 2. Strict check against deprecated ID
  const rawString = JSON.stringify(lesson);
  if (rawString.includes('g2w8y7n5L78')) {
    errors.push('CRITICAL: Deprecated video ID "g2w8y7n5L78" detected in lesson data!');
  }

  // 3. Validate variants model
  if (!lesson.variants || typeof lesson.variants !== 'object') {
    errors.push('Missing typed variants object');
  } else {
    for (const lang of ['uk', 'ru', 'en']) {
      const v = lesson.variants[lang];
      if (v) {
        if (!v.title) errors.push(`Variant [${lang}] missing title`);
        if (!v.fallbackUrl) errors.push(`Variant [${lang}] missing fallbackUrl`);
        if (v.officialArticleUrl) {
          const check = validateUrl(v.officialArticleUrl);
          if (!check.valid) errors.push(`Variant [${lang}] officialArticleUrl invalid: ${check.reason}`);
        }
        if (v.youtubeUrl) {
          const check = validateUrl(v.youtubeUrl);
          if (!check.valid) errors.push(`Variant [${lang}] youtubeUrl invalid: ${check.reason}`);
        }
        if (v.fallbackUrl) {
          const check = validateUrl(v.fallbackUrl);
          if (!check.valid) errors.push(`Variant [${lang}] fallbackUrl invalid: ${check.reason}`);
        }
      }
    }
  }

  // 4. URL allowlist validation on top-level
  if (lesson.officialArticleUrl) {
    const v = validateUrl(lesson.officialArticleUrl);
    if (!v.valid) errors.push(`officialArticleUrl invalid: ${v.reason}`);
  }
  if (lesson.youtubeUrl) {
    const v = validateUrl(lesson.youtubeUrl);
    if (!v.valid) errors.push(`youtubeUrl invalid: ${v.reason}`);
  }
  if (lesson.fallbackUrl) {
    const v = validateUrl(lesson.fallbackUrl);
    if (!v.valid) errors.push(`fallbackUrl invalid: ${v.reason}`);
  }

  // 5. YouTube validation if video is attached
  let oEmbedResult = null;
  let thumbResult = null;

  if (lesson.videoId) {
    if (typeof lesson.videoId !== 'string' || lesson.videoId.length !== 11) {
      errors.push(`videoId must be exactly 11 chars, got: "${lesson.videoId}"`);
    } else {
      const oembedRes = await checkHttps(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${lesson.videoId}&format=json`);
      if (oembedRes.status !== 200) {
        errors.push(`oEmbed check failed with status ${oembedRes.status}`);
      } else {
        try {
          const parsedJson = JSON.parse(oembedRes.body);
          if (!parsedJson.title || !parsedJson.author_name) {
            errors.push('oEmbed response missing title or author_name');
          }
          oEmbedResult = parsedJson;
        } catch (e) {
          errors.push('oEmbed returned invalid JSON');
        }
      }

      // Check Thumbnail
      const thumbRes = await checkHttps(`https://img.youtube.com/vi/${lesson.videoId}/hqdefault.jpg`);
      if (thumbRes.status !== 200) {
        errors.push(`Thumbnail check failed with status ${thumbRes.status}`);
      } else {
        thumbResult = { status: thumbRes.status, contentType: thumbRes.contentType };
      }
    }
  }

  return {
    id: lesson.id,
    provider: lesson.provider,
    language: lesson.spokenLanguage,
    videoId: lesson.videoId,
    oEmbedStatus: oEmbedResult ? 200 : (lesson.videoId ? 404 : 'N/A'),
    thumbStatus: thumbResult ? thumbResult.status : (lesson.videoId ? 404 : 'N/A'),
    author: oEmbedResult?.author_name || lesson.provider,
    variantsCount: Object.keys(lesson.variants || {}).length,
    errors
  };
}

async function runCli() {
  console.log('--- StorkCrypto Academy Validator ---');
  // Dynamic import of current academy database
  const { ACADEMY_LESSONS } = await import('../components/AcademyLessonsData.js').catch(() => ({ ACADEMY_LESSONS: [] }));
  
  if (!ACADEMY_LESSONS || ACADEMY_LESSONS.length === 0) {
    console.log('No ACADEMY_LESSONS found to validate. Run after creating config.');
    process.exit(1);
  }

  console.log(`Validating ${ACADEMY_LESSONS.length} lessons...`);
  let hasFailed = false;

  for (const lesson of ACADEMY_LESSONS) {
    const res = await validateLesson(lesson);
    if (res.errors.length > 0) {
      console.error(`FAIL: [${lesson.id}] - ${res.errors.join('; ')}`);
      hasFailed = true;
    } else {
      console.log(`PASS: [${lesson.id}] Provider: ${res.provider} | Video: ${res.videoId || 'none'} | Author: ${res.author}`);
    }
  }

  if (hasFailed) {
    console.error('\nValidation FAILED: Please fix errors above.');
    process.exit(1);
  } else {
    console.log('\nAll academy lessons VALIDATED successfully.');
  }
}

if (process.argv[1]?.endsWith('validate-academy-links.mjs')) {
  runCli();
}

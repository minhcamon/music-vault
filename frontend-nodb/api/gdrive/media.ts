import { rateLimiter, getClientIp } from './_lib/rate-limiter.js';

function decorateResponse(res: any) {
  if (!res.status) {
    res.status = function (statusCode: number) {
      res.statusCode = statusCode;
      return res;
    };
  }
  if (!res.json) {
    res.json = function (data: any) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
      return res;
    };
  }
  if (!res.send) {
    res.send = function (body: any) {
      if (Buffer.isBuffer(body) || typeof body === 'string') {
        res.end(body);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(body));
      }
      return res;
    };
  }
}

export default async function handler(req: any, res: any) {
  decorateResponse(res);

  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Kiểm tra Rate Limiting cho audio streaming (300 requests/phút mỗi IP)
  const clientIp = getClientIp(req);
  const rateLimit = rateLimiter.check(clientIp, 300, 60000);

  res.setHeader('X-RateLimit-Limit', rateLimit.limit.toString());
  res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString());
  res.setHeader('X-RateLimit-Reset', rateLimit.resetSeconds.toString());

  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', rateLimit.resetSeconds.toString());
    return res.status(429).json({
      error: 'Quá số lượng truy cập stream media (Too Many Requests). Vui lòng thử lại sau.',
    });
  }

  // 2. Lấy API Key từ biến môi trường server
  const apiKey = process.env.GDRIVE_API_KEY;
  if (!apiKey) {
    console.error('Server Configuration Error: GDRIVE_API_KEY chưa được thiết lập');
    return res.status(500).json({
      error: 'Server BFF chưa được cấu hình GDRIVE_API_KEY trong môi trường (.env.local hoặc Vercel Environment Variables).',
    });
  }

  // 3. Trích xuất fileId
  const { fileId } = req.query || {};
  if (!fileId || typeof fileId !== 'string') {
    return res.status(400).json({ error: 'Thiếu tham số fileId' });
  }

  try {
    const targetUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media&key=${apiKey}`;

    const headers: Record<string, string> = {
      'User-Agent':
        req.headers?.['user-agent'] ||
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };
    if (req.headers && req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    const gdriveRes = await fetch(targetUrl, { headers });

    if (!gdriveRes.ok && gdriveRes.status !== 206) {
      const contentType = gdriveRes.headers.get('content-type') || '';
      const errorText = await gdriveRes.text();

      // Check if Google returned Automated Queries protection HTML page
      if (contentType.includes('text/html') || errorText.includes('automated queries')) {
        console.warn(`Google Drive Anti-Bot Protection triggered (${gdriveRes.status}) for file ${fileId}`);
        return res.status(429).json({
          error: 'Google Drive tạm thời hạn chế download nhanh tự động (Automated Queries Protection).',
          status: 429,
        });
      }

      console.error(`Google Drive Media Error (${gdriveRes.status}):`, errorText.slice(0, 300));
      return res.status(gdriveRes.status).json({
        error: `Failed to fetch Google Drive media: ${gdriveRes.statusText}`,
      });
    }

    // Set HTTP Response status
    res.status(gdriveRes.status);

    // Chuyển tiếp các headers quan trọng về cho client (cho phép tua nhạc HTML5 Audio)
    const passthroughHeaders = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
      'cache-control',
      'etag',
    ];

    passthroughHeaders.forEach((h) => {
      const val = gdriveRes.headers.get(h);
      if (val) {
        res.setHeader(h, val);
      }
    });

    // Nếu không có cache-control từ upstream, set mặc định cache 1 giờ
    if (!res.getHeader('cache-control')) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }

    if (req.method === 'HEAD') {
      return res.end();
    }

    // Convert response body sang Buffer / ArrayBuffer và ghi ra res
    const arrayBuffer = await gdriveRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return res.send(buffer);
  } catch (err: any) {
    console.error('BFF Proxy Error in /api/gdrive/media:', err);
    return res.status(500).json({
      error: 'Lỗi máy chủ proxy khi stream media từ Google Drive',
      message: err.message || String(err),
    });
  }
}

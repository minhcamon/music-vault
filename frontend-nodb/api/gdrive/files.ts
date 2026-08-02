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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Kiểm tra Rate Limiting (Cho phép 60 requests/phút mỗi IP)
  const clientIp = getClientIp(req);
  const rateLimit = rateLimiter.check(clientIp, 60, 60000);

  res.setHeader('X-RateLimit-Limit', rateLimit.limit.toString());
  res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString());
  res.setHeader('X-RateLimit-Reset', rateLimit.resetSeconds.toString());

  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', rateLimit.resetSeconds.toString());
    return res.status(429).json({
      error: 'Quá số lượng truy cập cho phép (Too Many Requests). Vui lòng thử lại sau.',
      retryAfterSeconds: rateLimit.resetSeconds,
    });
  }

  // 2. Lấy API Key từ biến môi trường của server
  const apiKey = process.env.GDRIVE_API_KEY;
  if (!apiKey) {
    console.error('Server Configuration Error: GDRIVE_API_KEY chưa được thiết lập');
    return res.status(500).json({
      error: 'Server BFF chưa được cấu hình GDRIVE_API_KEY trong môi trường (.env.local hoặc Vercel Environment Variables).',
    });
  }

  // 3. Trích xuất folderId từ query params
  const { folderId } = req.query || {};
  if (!folderId || typeof folderId !== 'string') {
    return res.status(400).json({ error: 'Thiếu tham số folderId' });
  }

  // Trích xuất Folder ID chuẩn từ link hoặc chuỗi id
  let cleanFolderId = folderId.trim();
  const folderMatch = cleanFolderId.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch) {
    cleanFolderId = folderMatch[1];
  } else {
    const idMatch = cleanFolderId.match(/id=([a-zA-Z0-9_-]+)/);
    if (idMatch) cleanFolderId = idMatch[1];
  }

  try {
    const query = `'${cleanFolderId}' in parents and (mimeType contains 'audio/' or name contains '.flac' or name contains '.mp3' or name contains '.m4a' or name contains '.wav') and trashed = false`;
    const targetUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,webContentLink)&key=${apiKey}&pageSize=1000`;

    const gdriveRes = await fetch(targetUrl);

    if (!gdriveRes.ok) {
      const errorText = await gdriveRes.text();
      console.error(`Google Drive API Error (${gdriveRes.status}):`, errorText);
      return res.status(gdriveRes.status).json({
        error: `Google Drive API Error: ${gdriveRes.statusText}`,
        details: errorText,
      });
    }

    const data = await gdriveRes.json();
    return res.status(200).json(data);
  } catch (err: any) {
    console.error('BFF Proxy Error in /api/gdrive/files:', err);
    return res.status(500).json({
      error: 'Lỗi máy chủ proxy khi kết nối Google Drive API',
      message: err.message || String(err),
    });
  }
}

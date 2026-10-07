import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/favicon.svg', ['favicon.svg', 'image/svg+xml']],
]);
const port = Number(process.env.PORT || 3000);

createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    return response.end();
  }
  const path = new URL(request.url, 'http://localhost').pathname;
  if (path === '/health') {
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return response.end(request.method === 'HEAD' ? undefined : 'ok');
  }
  const entry = files.get(path);
  if (!entry) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return response.end('Not found');
  }
  try {
    const content = await readFile(new URL(entry[0], import.meta.url));
    response.writeHead(200, {
      'Content-Type': entry[1],
      'Content-Length': content.length,
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': entry[0] === 'index.html' ? 'no-cache' : 'public, max-age=86400',
    });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch {
    response.writeHead(500);
    response.end('Unable to load page');
  }
}).listen(port, '0.0.0.0', () => console.log(`Rainy Studio listening on port ${port}`));

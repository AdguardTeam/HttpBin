import {
  serveOptions,
  handleGet,
  handlePost,
  handlePut,
  handlePatch,
  handleDelete,
  handleHead,
  getIp,
  getHeaders,
  getUserAgent,
  getHostname,
  anythingResponse,
  delayResponse,
} from './handlers.js';
import {
  absoluteRedirect,
  serveRelativeRedirects,
  serveMultipleRedirects,
  serveRedirectTo,
} from './redirects.js';
import { challengeBasicAuth } from './auth.js';
import { decodeBase64, encodeBase64 } from './encoding.js';
import {
  checkCacheHeaders,
  setCacheControl,
  getCookies,
  checkCookie,
  deleteCookies,
  setCookies,
} from './cache-cookies.js';
import {
  serveImageBasedOnHeader,
  serveJpegImage,
  servePngImage,
  serveSvgImage,
  serveWebpImage,
} from './images.js';
import {
  serveJSON,
  serveJSONValue,
  serveXML,
  serveXMLValue,
  generateRandomBytes,
  serveRange,
  serveStatus,
  serveStatusNoResponse,
  serveResponseHeaders,
  serveWs,
} from './formats.js';
import { serveAvailableMethods, renderHTMLPage, renderHtmlForm, serveLinks } from './ui.js';
import { serveOhttpConfig, serveOhttpGateway } from './ohttp.js';

addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    (async function () {
      const response = await handleRequest(event.request);

      if (response.webSocket) {
        // No need to add CORS headers for WS.
        return response;
      }

      const newHeaders = new Headers(response.headers);
      newHeaders.set('Access-Control-Allow-Origin', '*');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    })(),
  );
});

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  switch (true) {
    case request.method === 'OPTIONS':
      return serveOptions();
    case path === '/':
      return serveAvailableMethods();
    case path.startsWith('/absolute-redirect/'):
      return absoluteRedirect(path, url);
    case path.startsWith('/anything'):
      return anythingResponse(request);
    case path.startsWith('/base64/decode/'):
      return decodeBase64(path);
    case path.startsWith('/base64/encode/'):
      return encodeBase64(path);
    case path.startsWith('/basic-auth/'):
      return challengeBasicAuth(request, path);
    case path.startsWith('/bytes/'):
      return generateRandomBytes(path, url);
    case path === '/cache':
      return checkCacheHeaders(request);
    case path.startsWith('/cache/'):
      return setCacheControl(request, path);
    case path === '/cookies':
      return getCookies(request);
    case path.startsWith('/cookies/get'):
      return checkCookie(request, url);
    case path.startsWith('/cookies/delete'):
      return deleteCookies(request, url);
    case path.startsWith('/cookies/set'):
      return setCookies(request, url);
    case path.startsWith('/delay/'):
      return delayResponse(path);
    case path === '/delete':
      return handleDelete(request);
    case path === '/forms/post':
      return renderHtmlForm();
    case path === '/get':
      return handleGet(request);
    case path === '/head':
      return handleHead(request);
    case path === '/headers':
      return getHeaders(request);
    case path === '/html':
      return renderHTMLPage();
    case path === '/hostname':
      return getHostname(request);
    case path === '/image':
      return serveImageBasedOnHeader(request);
    case path === '/image/jpeg':
      return serveJpegImage();
    case path === '/image/png':
      return servePngImage();
    case path === '/image/svg':
      return serveSvgImage();
    case path === '/image/webp':
      return serveWebpImage();
    case path === '/ip':
      return getIp(request);
    case path === '/json':
      return serveJSON();
    case path.startsWith('/json/'):
      return serveJSONValue(path);
    case path.startsWith('/links/'):
      return serveLinks(path);
    case path === '/patch':
      return handlePatch(request);
    case path === '/post':
      return handlePost(request);
    case path === '/put':
      return handlePut(request);
    case path.startsWith('/range/'):
      return serveRange(path, request);
    case path.startsWith('/redirect-to'):
      return serveRedirectTo(url.searchParams);
    case path.startsWith('/redirect/'):
      return serveMultipleRedirects(path);
    case path.startsWith('/relative-redirect/'):
      return serveRelativeRedirects(path);
    case path.startsWith('/response-headers'):
      return serveResponseHeaders(url.searchParams);
    case path.startsWith('/status/'):
      return serveStatus(path);
    case path.startsWith('/status-no-response/'):
      return serveStatusNoResponse(path);
    case path === '/user-agent':
      return getUserAgent(request);
    case path === '/ws':
      return serveWs(request);
    case path === '/xml':
      return serveXML();
    case path.startsWith('/xml/'):
      return serveXMLValue(path);
    case path === '/ohttp/config':
      return serveOhttpConfig();
    case path === '/ohttp/gateway':
      return serveOhttpGateway(request, handleRequest);
    default:
      return new Response('Endpoint not found', { status: 404 });
  }
}

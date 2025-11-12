# HTTPBin

This is a Cloudflare Worker port of httpbin.org HTTP request & response testing
service.

Available on `https://httpbin.agrd.workers.dev/`.

- Ideas for methods: <https://httpbingo.org/>.
- Code was mostly written by ChatGPT.

## How to debug

Install dependencies and build:

```bash
npm install
npm run build
```

Run tests and lints:

```bash
npm run lint
npm run test
```

Run the local server:

```bash
npm run start
```

## Development

This project is written in TypeScript and uses:

- **TypeScript** for type safety
- **esbuild** for fast bundling
- **Cloudflare Workers** runtime with type definitions

## Endpoints

- [/](https://httpbin.agrd.workers.dev/) - This page.
- [/absolute-redirect/:n](https://httpbin.agrd.workers.dev/absolute-redirect/2) - Absolute redirects n times.
- [/anything/:anything](https://httpbin.agrd.workers.dev/anything/test) - Returns anything that is passed to request.
- [/base64/decode/:value](https://httpbin.agrd.workers.dev/base64/decode/aGVsbG8gd29ybGQ=) - Decodes a Base64 encoded string.
- [/base64/encode/:value](https://httpbin.agrd.workers.dev/base64/encode/hello%20world) - Encodes a string into Base64.
- [/basic-auth/:user/:passwd](https://httpbin.agrd.workers.dev/basic-auth/admin/password) - Challenges HTTPBasic Auth.
- [/bytes/:n](https://httpbin.agrd.workers.dev/bytes/1024?seed=5) - Generates n random bytes of binary data, accepts optional seed integer parameter.
- [/cache](https://httpbin.agrd.workers.dev/cache) - Returns 200 unless an If-Modified-Since or If-None-Match header is provided, when it returns a 304.
- [/cache/:n](https://httpbin.agrd.workers.dev/cache/60) - Sets a Cache-Control header for n seconds.
- [/cookies](https://httpbin.agrd.workers.dev/cookies) - Returns cookie data.
- [/cookies/set?name=value](https://httpbin.agrd.workers.dev/cookies/set?k1=v1&k2=v2) - Sets one or more simple cookies.
- [/cookies/get?name](https://httpbin.agrd.workers.dev/cookies/get?k1) - Gets one or more simple cookies.
- [/cookies/delete?name](https://httpbin.agrd.workers.dev/cookies/delete?k1=&k2=) - Deletes one or more simple cookies.
- [/delay/:n](https://httpbin.agrd.workers.dev/delay/5) - Delays responding for min(n, 10) seconds.
- [/delete](https://httpbin.agrd.workers.dev/delete) - Returns request data. Allows only DELETE requests.
- [/forms/post](https://httpbin.agrd.workers.dev/forms/post) - HTML form that submits to `/post`.
- [/get](https://httpbin.agrd.workers.dev/get) - Returns request data. Allows only GET requests.
- [/head](https://httpbin.agrd.workers.dev/head) - Returns request data. Allows only HEAD requests.
- [/headers](https://httpbin.agrd.workers.dev/headers) - Returns request header dict.
- [/html](https://httpbin.agrd.workers.dev/html) - Renders an HTML Page.
- [/hostname](https://httpbin.agrd.workers.dev/hostname) - Returns the name of the host serving the request.
- [/image](https://httpbin.agrd.workers.dev/image) - Returns page containing an image based on sent Accept header.
- [/image/jpeg](https://httpbin.agrd.workers.dev/image/jpeg) - Returns a JPEG image.
- [/image/png](https://httpbin.agrd.workers.dev/image/png) - Returns a PNG image.
- [/image/svg](https://httpbin.agrd.workers.dev/image/svg) - Returns a SVG image.
- [/image/webp](https://httpbin.agrd.workers.dev/image/webp) - Returns a WEBP image.
- [/ip](https://httpbin.agrd.workers.dev/ip) - Returns Origin IP.
- [/json](https://httpbin.agrd.workers.dev/json) - Returns JSON.
- [/json/:value](https://httpbin.agrd.workers.dev/json/%7B%22test%22%3A1%7D) - Returns the specified JSON.
- [/links/:n](https://httpbin.agrd.workers.dev/links/:n) - Returns page containing n HTML links.
- [/patch](https://httpbin.agrd.workers.dev/patch) - Returns request data. Allows only PATCH requests.
- [/post](https://httpbin.agrd.workers.dev/post) - Returns request data. Allows only POST requests.
- [/put](https://httpbin.agrd.workers.dev/put) - Returns request data. Allows only PUT requests.
- [/range/:n](https://httpbin.agrd.workers.dev/range/1024) - Streams n bytes, and allows specifying a Range header to select a subset of the data.
- [/redirect-to?url=foo&status_code=307](https://httpbin.agrd.workers.dev/redirect-to?status_code=307&url=http%3A%2F%2Fexample.com%2F) - Redirects to the foo URL.
- [/redirect-to?url=foo](https://httpbin.agrd.workers.dev/redirect-to?url=http%3A%2F%2Fexample.com%2F) - 302 Redirects to the foo URL.
- [/redirect/:n](https://httpbin.agrd.workers.dev/redirect/3) - 302 Redirects n times.
- [/response-headers?key=val](https://httpbin.agrd.workers.dev/response-headers?Servername=httpbin&Content-Type=text%2Fplain%3B+charset%3DUTF-8) - Returns given response headers.
- [/status/:code](https://httpbin.agrd.workers.dev/status/200) - Returns given HTTP Status code.
- [/status-no-response/:code](https://httpbin.agrd.workers.dev/status-no-response/200) - Returns given HTTP Status code with empty body.
- [/user-agent](https://httpbin.agrd.workers.dev/user-agent) - Returns user-agent.
- [/xml](https://httpbin.agrd.workers.dev/xml) - Returns some XML.
- [/xml/:value](https://httpbin.agrd.workers.dev/xml/%3Ctest%2F%3E) - Returns the specified XML.

## Oblivious HTTP (OHTTP) Gateway Endpoints

Httpbin also includes Oblivious HTTP gateway endpoints as specified in [RFC 9458](https://www.ietf.org/rfc/rfc9458.html).

- `/ohttp/config` - Returns the OHTTP KeyConfig that clients use to encapsulate their requests.
- `/ohttp/gateway` - Accepts OHTTP-encapsulated requests, decapsulates them, processes them internally against httpbin endpoints (regardless of the target host), and returns OHTTP-encapsulated responses.

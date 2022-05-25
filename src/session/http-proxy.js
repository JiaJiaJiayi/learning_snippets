let http = require('http');
let httpProxy = require('http-proxy');
let auth = require('basic-auth');
//
// Create your proxy server and set the target in the options.
//
const origin = httpProxy.createProxyServer({
  target: 'http://10.4.164.242:9000',
  autoRewrite: true,
  hostRewrite: true,
  
});
origin.listen(8000);

//
// Create your target server
//
http
  .createServer({}, function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write(`${'request successfully proxied!' + '\n'}${JSON.stringify(req.headers, true, 2)}`);
    res.end();
  })
  .listen(9000);

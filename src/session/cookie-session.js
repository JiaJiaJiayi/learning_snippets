// 测试cookie-session middleware

let cookieSession = require('cookie-session');
let express = require('express');

let app = express();

app.use(
  cookieSession({
    // FIXME: 注入了sessionId这个对象
    name: 'session',
    keys: ['lovely cat'],
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

// Access the session as req.session
app.get('/', function (req, res, next) {
  req.session.views = (req.session.views || 0) + 1;
  // Write response
  res.end(`${req.session.views} views`);
});

let listener = app.listen(3000);
console.log('Your friendly Express server, listening on port %s', listener.address().port);

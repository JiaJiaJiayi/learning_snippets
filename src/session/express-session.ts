import session from 'express-session';
import express from 'express';
import { createClient, SchemaFieldTypes, RedisClientType, RedisClient } from 'redis';
import connectRedis from 'connect-redis';
import RedisSearch from '@node-redis/search';
import { Repository, Client } from 'redis-om';
import mustacheExpress from 'mustache-express';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import { userSchema, User } from './model/user';
import { wsWrapper } from './server/websocket';

const RedisStore = connectRedis(session);

// TODO: 加入一个本地代理

async function createUserIndex(redisClient: any) {
  try {
    await redisClient.ft.create(
      'idx:users',
      {
        '$.username': {
          type: SchemaFieldTypes.TEXT,
          AS: 'username',
        },
        '$.encryptedPassword': {
          type: SchemaFieldTypes.TEXT,
          AS: 'encryptedPassword',
        },
      },
      {
        ON: 'JSON',
        PREFIX: 'noderedis:users',
      }
    );
  } catch (e) {
    if (e.message === 'Index already exists') {
      console.log('Index exists already, skipped creation.');
    } else {
      // Something went wrong, perhaps RediSearch isn't installed...
      console.error(e);
      process.exit(1);
    }
  }
}

(async function () {
  // redis@v4

  // 通过远程配置，可以实现sessionCookie在一台机子上的访问
  const redisClient = createClient({ legacyMode: true, url: 'redis://localhost:6379', password: 'france' }); // 目标地址的需要加在redis config文件里
  await redisClient.connect();
  await createUserIndex(redisClient);

  const app = express();

  const redisStore = new RedisStore({ client: redisClient });

  app.use(
    session({
      // FIXME: 注入了sessionId这个对象
      store: redisStore,
      saveUninitialized: false,
      secret: 'keyboard cat',
      resave: false,
    })
  );

  // // Search all users under 30
  // console.log('Users under 30 years old:');
  // console.log(
  //   // https://oss.redis.com/redisearch/Commands/#ftsearch
  //   JSON.stringify(await redisClient.ft.search('idx:users', '@name: Bob'), null, 2)
  // );

  app.engine('mustache', mustacheExpress());
  app.set('view engine', 'mustache');
  app.set('views', `${__dirname}/views`);

  app.use(bodyParser.json()); // to support JSON-encoded bodies
  app.use(
    bodyParser.urlencoded({
      // to support URL-encoded bodies
      extended: true,
    })
  );

  app.get('/', (req, res, next) => {
    res.render('partials/login');
  });

  app.post('/login', async (req, res, next) => {
    const { body } = req;
    console.log(req.body);
    const { username, password } = body;

    if (!username || !password) {
      res.render('partials/login', { errorMessage: 'not enough info' });
    } else {
      const storedUser = await redisClient.ft.search('idx:users', `@username:${username}`);
      console.log('s', storedUser);
      if (storedUser.documents.length === 0) {
        const encryptedPassword = bcrypt.hashSync(password, 10);
        await redisClient.json.set(`noderedis:users:${username}`, '$', {
          username,
          encryptedPassword,
        });
        res.end();
        return;
      }

      const first = storedUser.documents[0];
      const result = bcrypt.compareSync(password, first.value.encryptedPassword as string);
      if (result) {
        console.log('verified ok');
        res.sendStatus(200);
        res.end();
      } else {
        res.status(200);
        res.json({ errorMessage: 'wrong password' });
        res.end();
      }
    }
  });

  app.get('/logout', (req, res, next) => {
    req.session.destroy(err => {
      // cannot access session here
      res.redirect('/');
    });
  });

  const server = app.listen(3000);

  const wsServer = wsWrapper(server);

  console.log('Your friendly Express server, listening on port %s', server.address().port);
  // Your friendly Express server, listening on port 3000
})();

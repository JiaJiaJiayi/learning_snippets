import {readFileSync} from 'fs';

import {Client} from 'ssh2';

const conn = new Client();

const readyCallback =  () => {
    console.log('Client :: ready');
    conn.exec('uptime', (err, stream) => {
      if (err) throw err;
      stream.on('close', (code, signal) => {
        console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
        conn.end();
      }).on('data', (data) => {
        console.log('STDOUT: ' + data);
      }).stderr.on('data', (data) => {
        console.log('STDERR: ' + data);
      });
    });
  };
conn.on('ready', readyCallback).connect({
  host: '192.168.100.100',
  port: 22,
  username: 'frylock',
  privateKey: readFileSync('/path/to/my/key')
});
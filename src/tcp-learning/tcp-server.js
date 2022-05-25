// 创建socket服务器 server.js
const net = require('net')
const server = net.createServer();

function getConnections(){
  server.getConnections((error, count) => {
    console.log("current connection count", count)
  });
}
server.on('connection', (stream) => {
  // remote means the client port 
  console.log('client connected', socket.remoteAddress, socket.remoteFamily, socket.remotePort);

  stream.on('data', (chunk) => {
    console.log("server receieved")
    socket.write("server: write data back");
  })

  stream.on('close', () => {
    console.log("server, connection close:" , socket.remotePort)
  });

  stream.on('end', (chunk) => {
    console.log("server, connection end:" , socket.remotePort)
  });

  getConnections();
});

server.listen(3001, () => {
  console.log(`server is on ${JSON.stringify(server.address())}`);
});

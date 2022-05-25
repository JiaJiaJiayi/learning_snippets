const net = require("net");
const client = net.connect({ port: 3001 });

let time = 0;
client.on("connect", () => {
  client.write("client: data from client");
});

client.on("close", () => {
  console.log("disconnected from server");
});
client.on("data", (chunk) => {
  console.log(typeof chunk, chunk.toString());
  client.write(`client: time ${time}, send back data`);
  time ++;

  if (time === 5) client.destroy();
});

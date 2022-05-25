import WebSocket from 'ws';
import queryString from 'query-string';

const wsWrapper = expressServer => {
  const websocketServer = new WebSocket.Server({
    noServer: true,
    path: '/websockets',
    perMessageDeflate: {
      zlibDeflateOptions: {
        // See zlib defaults.
        chunkSize: 1024,
        memLevel: 7,
        level: 3,
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024,
      },
    },
  });

  expressServer.on('upgrade', (request, socket, head) => {
    websocketServer.handleUpgrade(request, socket, head, websocket => {
      // 触发了以下的链接
      websocketServer.emit('connection', websocket, request);
    });
  });

  websocketServer.on('connection', function connection(websocketConnection: WebSocket.WebSocket, connectionRequest) {
    const [_path, params] = connectionRequest?.url?.split('?');
    const connectionParams = queryString.parse(params);

    // NOTE: connectParams are not used here but good to understand how to get
    // to them if you need to pass data with the connection to identify it (e.g., a userId).
    console.log(connectionParams);

    websocketConnection.on('message', message => {
      let parsedMessage = '';
      try {
        parsedMessage = JSON.parse(message);
      } catch {
        parsedMessage = message.toString();
      }

      console.log(parsedMessage);
      websocketConnection.send(`return${parsedMessage}`);
    });
  });

  return websocketServer;
};

export { wsWrapper };

import app from '.';
import debug from 'debug';
import http from 'http';
import { normalizePort, onError } from './utils';

const debugFn = debug('flight-logger-reboot:server');

const port = normalizePort(process.env.PORT ?? '3000');
app.set('port', port);

const server = http.createServer(app);

export const onListening = (): void => {
  const addr = server.address();
  const bind =
    typeof addr === 'string' ? 'pipe ' + addr : `port ${addr?.port ?? ''}`;
  debugFn('Listening on ' + bind);
};

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

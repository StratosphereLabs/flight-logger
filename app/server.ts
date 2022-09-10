import http from 'http';
import type { HttpError } from 'http-errors';

import app from '.';
import { prisma } from './db';
import { normalizePort } from './utils';

const port = normalizePort(process.env.PORT ?? '3000');
app.set('port', port);

/* eslint-disable-next-line @typescript-eslint/require-await */
const main = async (): Promise<void> => {
  const server = http.createServer(app);

  server.listen(port);
  server.on('listening', (): void => {
    const addr = server.address();
    const bind =
      typeof addr === 'string' ? 'pipe ' + addr : `port ${addr?.port ?? ''}`;
    console.log(`Server listening on ${bind}`);
  });
  server.on('error', (error: HttpError): void => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind =
      typeof port === 'string' ? `Pipe ${port}` : `Port ${port ?? ''}`;

    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  });
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

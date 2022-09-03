import type { HttpError } from 'http-errors';

export const normalizePort = (val: string): string | number | undefined => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }
};

export const onError = (error: HttpError): void => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const port = normalizePort(process.env.PORT ?? '3000');

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port ?? ''}`;

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
};

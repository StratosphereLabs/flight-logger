export const excludeKeys = <Model, Key extends keyof Model>(
  model: Model,
  ...keys: Key[]
): Omit<Model, Key> => {
  for (const key of keys) {
    /* eslint-disable-next-line @typescript-eslint/no-dynamic-delete */
    delete model[key];
  }
  return model;
};

export const normalizePort = (val: string): string | number | undefined => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }
};

import { url } from 'gravatar';

export const fetchGravatarUrl = (email: string): string =>
  url(email, { s: '200' }, true);

import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../db';

export const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    callbackURL: '/api/auth/google/callback',
  },
  async (_, __, profile, done) => {
    const email = profile.emails?.[0].value;
    if (email === undefined) {
      return done(new Error('No email defined'));
    }
    try {
      const newUser = await prisma.user.upsert({
        where: {
          email,
        },
        create: {
          username: profile.username ?? email?.split('@')[0] ?? '',
          email,
          firstName: profile.name?.givenName ?? '',
          lastName: profile.name?.familyName ?? '',
        },
        update: {},
      });
      done(null, newUser);
    } catch (err: unknown) {
      done(err as Error);
    }
  },
);

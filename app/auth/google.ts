import GoogleStrategy from 'passport-google-oidc';
import { prisma } from '../db';

export const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    callbackURL: '/api/auth/google/callback',
    scope: ['profile', 'email'],
  },
  async (_, profile, done) => {
    const email = profile.emails[0]?.value;
    if (email === undefined) {
      return done(
        new Error('No email found. Please try another authentication method.'),
        false,
      );
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      const user = await prisma.user.upsert({
        where: {
          email,
        },
        update: {},
        create: {
          username: profile.displayName,
          email,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
        },
      });
      done(null, user);
    } catch (err) {
      done(err as Error, false);
    }
  },
);

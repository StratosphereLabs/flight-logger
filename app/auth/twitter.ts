import { Strategy as TwitterStrategy } from 'passport-twitter';
import { prisma } from '../db';

export const twitterStrategy = new TwitterStrategy(
  {
    consumerKey: process.env.TWITTER_CONSUMER_KEY as string,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET as string,
    callbackURL: '/api/auth/twitter/callback',
  },
  async (_, __, profile, done) => {
    const email = profile.emails?.[0].value;
    const username = profile.username ?? email?.split('@')[0] ?? '';
    if (email === undefined) {
      return done(new Error('No email defined'));
    }
    try {
      const newUser = await prisma.user.upsert({
        where: {
          email,
        },
        create: {
          username,
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

import passport from 'passport';
import { prisma } from '../db';
import { googleStrategy } from './google';
import { jwtStrategy } from './jwt';

const myPassport = new passport.Passport();

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
myPassport.serializeUser<any, any>((_, user, done) => {
  done(null, user);
});

myPassport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: id as string,
      },
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

myPassport.use(googleStrategy);
myPassport.use(jwtStrategy);

export { myPassport as passport };

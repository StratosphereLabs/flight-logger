import { type inferRouterOutputs, TRPCError } from '@trpc/server';
import { format } from 'date-fns';
import { DATE_FORMAT_MONTH } from '../constants';
import { prisma } from '../db';
import { verifyAuthenticated } from '../middleware';
import {
  addFollowerSchema,
  getUserSchema,
  getUsersSchema,
  setFCMTokenSchema,
  togglePushNotificationsSchema,
} from '../schemas';
import { procedure, router } from '../trpc';
import { excludeKeys, fetchGravatarUrl } from '../utils';

export const usersRouter = router({
  getUser: procedure.input(getUserSchema).query(async ({ ctx, input }) => {
    if (input.username === undefined && ctx.user === null) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    const userData = await prisma.user.findUnique({
      where: {
        username: input?.username ?? ctx.user?.username,
      },
      include: {
        followedBy: true,
        following: true,
        _count: {
          select: {
            following: true,
            followedBy: true,
            flights: {
              where: {
                OR: [
                  {
                    inTimeActual: {
                      lte: new Date(),
                    },
                  },
                  {
                    inTime: {
                      lte: new Date(),
                    },
                  },
                ],
              },
            },
          },
        },
      },
      omit: {
        pushNotifications: false,
      },
      cacheStrategy: {
        ttl: 5 * 60,
      },
    });
    if (userData === null) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found.',
      });
    }
    const isFollowing =
      userData.followedBy.find(user => user.username === ctx.user?.username) !==
      undefined;
    const isFollowedBy =
      userData.following.find(user => user.username === ctx.user?.username) !==
      undefined;
    return {
      avatar: fetchGravatarUrl(userData.email),
      creationDate: format(userData.createdAt, DATE_FORMAT_MONTH),
      isFollowing,
      isFollowedBy,
      ...excludeKeys(userData, 'followedBy'),
    };
  }),
  getUsers: procedure
    .use(verifyAuthenticated)
    .input(getUsersSchema)
    .query(async ({ ctx, input }) => {
      const results = await prisma.user.findMany({
        take: 5,
        where: {
          OR: [
            {
              username: {
                contains: input.query,
                mode: 'insensitive',
              },
            },
            {
              firstName: {
                contains: input.query,
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: input.query,
                mode: 'insensitive',
              },
            },
          ],
          followedBy:
            input.followingUsersOnly === true
              ? {
                  some: {
                    username: ctx.user?.username,
                  },
                }
              : undefined,
          following:
            input.followingUsersOnly === true
              ? {
                  some: {
                    username: ctx.user?.username,
                  },
                }
              : undefined,
        },
        orderBy: {
          flights: {
            _count: 'desc',
          },
        },
        cacheStrategy: {
          ttl: 5 * 60,
        },
      });
      return results.map(user => ({
        ...user,
        id: user.username,
      }));
    }),
  searchUsers: procedure
    .use(verifyAuthenticated)
    .input(getUsersSchema)
    .query(async ({ input }) => {
      const results = await prisma.user.findMany({
        take: 10,
        where: {
          OR: [
            {
              username: {
                contains: input.query,
                mode: 'insensitive',
              },
            },
            {
              firstName: {
                contains: input.query,
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: input.query,
                mode: 'insensitive',
              },
            },
          ],
        },
        include: {
          _count: {
            select: {
              flights: {
                where: {
                  OR: [
                    {
                      inTimeActual: {
                        lte: new Date(),
                      },
                    },
                    {
                      inTime: {
                        lte: new Date(),
                      },
                    },
                  ],
                },
              },
            },
          },
        },
        orderBy: {
          flights: {
            _count: 'desc',
          },
        },
        cacheStrategy: {
          ttl: 5 * 60,
        },
      });
      return results.map(user => ({
        avatar: fetchGravatarUrl(user.email),
        numFlights: user._count.flights,
        ...excludeKeys(user, '_count'),
        id: user.username,
      }));
    }),
  addFCMToken: procedure
    .use(verifyAuthenticated)
    .input(setFCMTokenSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.token.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid FCM Token.',
        });
      }
      const tokens = await prisma.fcm_token.findMany({
        where: {
          userId: ctx.user.id,
        },
        select: {
          id: true,
          token: true,
        },
      });
      const token = tokens.find(({ token }) => token === input.token);
      if (token !== undefined) {
        await prisma.fcm_token.update({
          where: {
            id: token.id,
          },
          data: {
            timestamp: new Date(),
          },
        });
      } else {
        await prisma.fcm_token.create({
          data: {
            userId: ctx.user.id,
            token: input.token,
            timestamp: new Date(),
          },
        });
      }
    }),

  togglePushNotifications: procedure
    .use(verifyAuthenticated)
    .input(togglePushNotificationsSchema)
    .mutation(async ({ ctx, input }) => {
      await prisma.user.update({
        where: {
          id: ctx.user.id,
        },
        data: {
          pushNotifications: input.enabled,
        },
      });
    }),
  addFollower: procedure
    .use(verifyAuthenticated)
    .input(addFollowerSchema)
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await prisma.user.update({
        where: {
          id: ctx.user.id,
        },
        data: {
          following: {
            connect: {
              username: input.username,
            },
          },
        },
      });
      return updatedUser;
    }),
  removeFollower: procedure
    .use(verifyAuthenticated)
    .input(addFollowerSchema)
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await prisma.user.update({
        where: {
          id: ctx.user.id,
        },
        data: {
          following: {
            disconnect: {
              username: input.username,
            },
          },
        },
      });
      return updatedUser;
    }),
});

export type UsersRouter = typeof usersRouter;

export type UsersRouterOutput = inferRouterOutputs<UsersRouter>;

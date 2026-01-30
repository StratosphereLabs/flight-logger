import { TRPCError, type inferRouterOutputs } from '@trpc/server';
import { add, format, sub } from 'date-fns';

import { DATE_FORMAT_MONTH } from '../constants';
import { prisma } from '../db';
import { verifyAuthenticated } from '../middleware';
import {
  addFollowerSchema,
  getFollowingAndFollowersSchema,
  getUserSchema,
  getUsersSchema,
  setFCMTokenSchema,
  togglePushNotificationsSchema,
} from '../schemas';
import { procedure, router } from '../trpc';
import {
  excludeKeys,
  fetchGravatarUrl,
  getPaginatedResponse,
  parsePaginationRequest,
} from '../utils';

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
        id: false,
        pushNotifications: false,
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
      const flight =
        input.withoutFlightId !== undefined
          ? await prisma.flight.findUnique({
              where: {
                id: input.withoutFlightId,
              },
              select: {
                outTime: true,
                airlineId: true,
                flightNumber: true,
                departureAirportId: true,
                arrivalAirportId: true,
              },
            })
          : null;
      const results = await prisma.user.findMany({
        take: input.max,
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
          ...(input.withoutFlightId !== undefined &&
            flight !== null && {
              flights: {
                none: {
                  outTime: {
                    gt: sub(flight.outTime, { hours: 6 }),
                    lt: add(flight.outTime, { hours: 6 }),
                  },
                  airlineId: flight.airlineId,
                  flightNumber: flight.flightNumber,
                  departureAirportId: flight.departureAirportId,
                  arrivalAirportId: flight.arrivalAirportId,
                },
              },
            }),
        },
        orderBy: {
          flights: {
            _count: 'desc',
          },
        },
      });
      return results.map(user => ({
        ...user,
        avatar: fetchGravatarUrl(user.email),
        id: user.username,
      }));
    }),
  searchUsers: procedure
    .use(verifyAuthenticated)
    .input(getUsersSchema)
    .query(async ({ ctx, input }) => {
      if (input.query.length < 3 && input.query.length > 0) {
        return [];
      }
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
          followedBy:
            input.query.length === 0
              ? {
                  some: {
                    id: ctx.user.id,
                  },
                }
              : undefined,
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
      });
      return results.map(user => ({
        avatar: fetchGravatarUrl(user.email),
        numFlights: user._count.flights,
        ...excludeKeys(user, '_count'),
        id: user.username,
      }));
    }),
  getUserFollowingFollowers: procedure
    .use(verifyAuthenticated)
    .input(getFollowingAndFollowersSchema)
    .query(async ({ ctx, input }) => {
      if (input.username === undefined && ctx.user === null) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const { limit, page, skip, take } = parsePaginationRequest(input);
      const [results, count] = await prisma.$transaction([
        prisma.user.findMany({
          skip,
          take,
          where: {
            followedBy:
              input.type === 'following'
                ? {
                    some: {
                      username: input.username ?? ctx.user?.username,
                    },
                  }
                : undefined,
            following:
              input.type === 'followers'
                ? {
                    some: {
                      username: input.username ?? ctx.user?.username,
                    },
                  }
                : undefined,
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
        }),
        prisma.user.count({
          where: {
            followedBy:
              input.type === 'following'
                ? {
                    some: {
                      username: input.username ?? ctx.user?.username,
                    },
                  }
                : undefined,
            following:
              input.type === 'followers'
                ? {
                    some: {
                      username: input.username ?? ctx.user?.username,
                    },
                  }
                : undefined,
          },
        }),
      ]);
      return getPaginatedResponse({
        results: results.map(user => ({
          avatar: fetchGravatarUrl(user.email),
          numFlights: user._count.flights,
          ...excludeKeys(user, '_count'),
          id: user.username,
        })),
        itemCount: count,
        limit,
        page,
      });
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
      const tokens = await prisma.fcmToken.findMany({
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
        await prisma.fcmToken.update({
          where: {
            id: token.id,
          },
          data: {
            timestamp: new Date(),
          },
        });
      } else {
        await prisma.fcmToken.create({
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

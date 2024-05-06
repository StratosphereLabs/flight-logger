import { type inferRouterOutputs, TRPCError } from '@trpc/server';
import { format } from 'date-fns';
import { DATE_FORMAT_MONTH } from '../constants';
import { prisma } from '../db';
import { verifyAuthenticated } from '../middleware';
import { addFollowerSchema, getUserSchema, getUsersSchema } from '../schemas';
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
          },
        },
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
      ...excludeKeys(
        userData,
        'admin',
        'followedBy',
        'id',
        'password',
        'passwordResetToken',
        'passwordResetAt',
      ),
    };
  }),
  getUsers: procedure.input(getUsersSchema).query(async ({ ctx, input }) => {
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
    });
    return results.map(user => ({
      id: user.username,
      ...excludeKeys(
        user,
        'admin',
        'password',
        'id',
        'passwordResetToken',
        'passwordResetAt',
      ),
    }));
  }),
  searchUsers: procedure.input(getUsersSchema).query(async ({ input }) => {
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
                inTime: {
                  lte: new Date(),
                },
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
      id: user.username,
      avatar: fetchGravatarUrl(user.email),
      numFlights: user._count.flights,
      ...excludeKeys(
        user,
        'admin',
        'password',
        'id',
        'passwordResetToken',
        'passwordResetAt',
        '_count',
      ),
    }));
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
      return excludeKeys(
        updatedUser,
        'admin',
        'password',
        'id',
        'passwordResetToken',
        'passwordResetAt',
      );
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
      return excludeKeys(
        updatedUser,
        'admin',
        'password',
        'id',
        'passwordResetToken',
        'passwordResetAt',
      );
    }),
});

export type UsersRouter = typeof usersRouter;

export type UsersRouterOutput = inferRouterOutputs<UsersRouter>;

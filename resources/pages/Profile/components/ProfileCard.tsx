import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, Button, CardBody, LoadingCard } from 'stratosphere-ui';
import { UserOutlineIcon, UserSolidIcon } from '../../../common/components';
import { useProfilePage, useTRPCErrorHandler } from '../../../common/hooks';
import { getIsLoggedIn, useAuthStore } from '../../../stores';
import { trpc } from '../../../utils/trpc';

export const ProfileCard = (): JSX.Element => {
  const enabled = useProfilePage();
  const utils = trpc.useUtils();
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  const [confirmUnfollow, setConfirmUnfollow] = useState(false);
  const navigate = useNavigate();
  const { username } = useParams();
  const onError = useTRPCErrorHandler();
  const { data: currentUserData } = trpc.users.getUser.useQuery(
    { username: undefined },
    {
      enabled: isLoggedIn,
      staleTime: 5 * 60 * 1000,
      onError,
    },
  );
  const { data, isLoading } = trpc.users.getUser.useQuery(
    { username },
    {
      enabled,
      staleTime: 5 * 60 * 1000,
      onError,
    },
  );
  const { mutate: addFollower, isLoading: isAddFollowerLoading } =
    trpc.users.addFollower.useMutation({
      onSuccess: () => {
        utils.users.getUser.setData({ username }, oldUser =>
          oldUser !== undefined
            ? {
                ...oldUser,
                isFollowing: true,
                _count: {
                  ...oldUser._count,
                  followedBy: oldUser._count.followedBy + 1,
                },
              }
            : undefined,
        );
        void utils.users.getUser.invalidate({ username: undefined });
      },
      onError,
    });
  const { mutate: removeFollower, isLoading: isRemoveFollowingLoading } =
    trpc.users.removeFollower.useMutation({
      onSuccess: () => {
        setConfirmUnfollow(false);
        utils.users.getUser.setData({ username }, oldUser =>
          oldUser !== undefined
            ? {
                ...oldUser,
                isFollowing: false,
                _count: {
                  ...oldUser._count,
                  followedBy: oldUser._count.followedBy - 1,
                },
              }
            : undefined,
        );
        void utils.users.getUser.invalidate({ username: undefined });
      },
      onError,
    });
  const onOwnProfile = useMemo(
    () => username === undefined || username === currentUserData?.username,
    [currentUserData?.username, username],
  );
  return (
    <LoadingCard
      isLoading={isLoading}
      className="card-bordered card-compact h-[275px] w-full bg-base-200 shadow-md md:w-[350px]"
    >
      <CardBody className="justify-between gap-2">
        <div className="flex flex-row items-center gap-4">
          <Avatar shapeClassName="h-20 w-20 rounded-full">
            <img src={data?.avatar} alt="User Avatar" />
          </Avatar>
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="truncate text-2xl font-medium">{`${
              data?.firstName ?? ''
            } ${data?.lastName ?? ''}`}</div>
            <div className="text-sm opacity-75">{`@${
              data?.username ?? ''
            }`}</div>
            <div className="mt-1 text-xs opacity-50">
              Joined {data?.creationDate}
            </div>
            <div className="mt-1 flex gap-4">
              <div className="flex items-center">
                <Button color="ghost" size="xs" shape="circle">
                  <UserOutlineIcon className="h-3 w-3 text-info" />
                  <span className="sr-only">Following</span>
                </Button>
                {data?._count.following ?? 0}
              </div>
              <div className="flex items-center">
                <Button color="ghost" size="xs" shape="circle">
                  <UserSolidIcon className="h-3 w-3 text-info" />
                  <span className="sr-only">Followers</span>
                </Button>
                {data?._count.followedBy ?? 0}
              </div>
            </div>
          </div>
        </div>
        {onOwnProfile ? (
          <Button
            size="sm"
            color="neutral"
            onClick={() => {
              navigate('/account');
            }}
          >
            Edit Profile
          </Button>
        ) : confirmUnfollow ? (
          <div className="flex gap-2">
            <Button
              className="flex-1"
              size="sm"
              color="error"
              onClick={() => {
                setConfirmUnfollow(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              size="sm"
              color="neutral"
              onClick={() => {
                if (username !== undefined) removeFollower({ username });
              }}
              loading={isRemoveFollowingLoading}
            >
              Unfollow
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            color={data?.isFollowing === true ? 'neutral' : 'success'}
            loading={isAddFollowerLoading}
            onClick={() => {
              if (data?.isFollowing === true) {
                setConfirmUnfollow(true);
              } else if (username !== undefined) {
                addFollower({ username });
              }
            }}
          >
            {data?.isFollowing === true ? 'Following' : 'Follow'}
          </Button>
        )}
        <div className="stats flex bg-base-200">
          <div className="stat flex-1 place-items-center">
            <div className="stat-title">Trips</div>
            <div
              className="stat-value cursor-pointer text-success"
              onClick={() => {
                navigate(
                  username !== undefined ? `/user/${username}/trips` : '/trips',
                );
              }}
            >
              {data?.tripCount}
            </div>
          </div>
          <div className="stat flex-1 place-items-center">
            <div className="stat-title">Flights</div>
            <div
              className="stat-value cursor-pointer text-secondary"
              onClick={() => {
                navigate(
                  username !== undefined
                    ? `/user/${username}/flights`
                    : '/flights',
                );
              }}
            >
              {data?.completedFlightCount}
            </div>
          </div>
          <div className="stat flex-1 place-items-center">
            <div className="stat-title">Upcoming</div>
            <div
              className="stat-value cursor-pointer"
              onClick={() => {
                navigate(
                  username !== undefined
                    ? `/user/${username}/flights`
                    : '/flights',
                );
              }}
            >
              {data?.upcomingFlightCount}
            </div>
          </div>
        </div>
      </CardBody>
    </LoadingCard>
  );
};

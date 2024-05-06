import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, Button, Loading } from 'stratosphere-ui';
import {
  PencilIcon,
  PlusIcon,
  UserOutlineIcon,
  UserSolidIcon,
} from '../../../../common/components';
import {
  useLoggedInUserQuery,
  useProfileUserQuery,
  useTRPCErrorHandler,
} from '../../../../common/hooks';
import { getIsLoggedIn, useAuthStore } from '../../../../stores';
import { trpc } from '../../../../utils/trpc';

export const ProfileOverlay = (): JSX.Element => {
  const utils = trpc.useUtils();
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  const navigate = useNavigate();
  const { username } = useParams();
  const [confirmUnfollow, setConfirmUnfollow] = useState(false);
  const onError = useTRPCErrorHandler();
  const { onOwnProfile } = useLoggedInUserQuery();
  const { data: userData, isFetching } = useProfileUserQuery();
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
  return (
    <div className="pointer-events-auto flex min-w-[210px] flex-col items-start rounded-box bg-base-100/50 px-3 py-2 backdrop-blur-sm">
      {isFetching ? (
        <div className="flex w-full justify-center">
          <Loading />
        </div>
      ) : null}
      {!isFetching && userData !== undefined ? (
        <div className="flex flex-row items-center gap-1">
          <Avatar shapeClassName="h-12 w-12 sm:w-16 sm:h-16 rounded-full">
            <img src={userData.avatar} alt="User Avatar" />
          </Avatar>
          <div className="flex flex-1 flex-col">
            <div className="mb-1 ml-2 flex flex-col">
              <div className="text-base font-medium sm:text-xl">{`${userData.firstName} ${userData.lastName}`}</div>
              <div className="text-sm opacity-75">{`@${userData.username}`}</div>
            </div>
            {isLoggedIn ? (
              <div className="pl-2">
                {onOwnProfile ? (
                  <Button
                    className="w-full border-opacity-0 bg-opacity-75"
                    size="xs"
                    color="neutral"
                    onClick={() => {
                      navigate('/account');
                    }}
                  >
                    <PencilIcon className="h-3 w-3" />
                    Edit Profile
                  </Button>
                ) : confirmUnfollow ? (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 border-opacity-0 bg-opacity-75"
                      size="xs"
                      color="error"
                      onClick={() => {
                        setConfirmUnfollow(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 border-opacity-0 bg-opacity-75"
                      size="xs"
                      color="neutral"
                      onClick={() => {
                        if (username !== undefined)
                          removeFollower({ username });
                      }}
                      loading={isRemoveFollowingLoading}
                    >
                      {!isRemoveFollowingLoading ? 'Unfollow' : null}
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full border-opacity-0 bg-opacity-75"
                    size="xs"
                    color={userData.isFollowing ? 'neutral' : 'success'}
                    loading={isAddFollowerLoading}
                    onClick={() => {
                      if (userData.isFollowing) {
                        setConfirmUnfollow(true);
                      } else if (username !== undefined) {
                        addFollower({ username });
                      }
                    }}
                  >
                    {!userData.isFollowing ? (
                      <PlusIcon className="h-3 w-3" />
                    ) : null}
                    {userData.isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )}
              </div>
            ) : null}
            <div className="mt-1 flex flex-wrap">
              <Button color="ghost" size="xs">
                <UserOutlineIcon className="h-3 w-3 text-info" />
                <span>
                  {userData._count.following}
                  <span className="ml-1 opacity-60">Following</span>
                </span>
              </Button>
              <Button color="ghost" size="xs">
                <UserSolidIcon className="h-3 w-3 text-info" />
                <span>
                  {userData._count.followedBy}
                  <span className="ml-1 opacity-60">
                    Follower
                    {userData._count.followedBy !== 1 ? 's' : ''}
                  </span>
                </span>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

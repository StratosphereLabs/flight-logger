import classNames from 'classnames';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Avatar, Button, Loading, Modal } from 'stratosphere-ui';

import {
  UserCheckIcon,
  UserMinusIcon,
  UserOutlineIcon,
  UserPlusIcon,
  UserSolidIcon,
} from '../../../../common/components';
import {
  useLoggedInUserQuery,
  useProfileUserQuery,
  useSuccessResponseHandler,
  useTRPCErrorHandler,
} from '../../../../common/hooks';
import { getIsLoggedIn, useAuthStore } from '../../../../stores';
import { trpc } from '../../../../utils/trpc';

export const ProfileOverlay = (): JSX.Element => {
  const utils = trpc.useUtils();
  const isLoggedIn = useAuthStore(getIsLoggedIn);
  const { username } = useParams();
  const [isUnfollowDialogOpen, setIsUnfollowDialogOpen] = useState(false);
  const onSuccess = useSuccessResponseHandler();
  const onError = useTRPCErrorHandler();
  const { onOwnProfile } = useLoggedInUserQuery();
  const { data: userData, isFetching } = useProfileUserQuery();
  const { mutate: addFollower, isLoading: isAddFollowerLoading } =
    trpc.users.addFollower.useMutation({
      onSuccess: () => {
        onSuccess(`Now following @${username}`);
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
        void utils.flights.getFollowingFlights.invalidate();
      },
      onError,
    });
  const { mutate: removeFollower, isLoading: isRemoveFollowingLoading } =
    trpc.users.removeFollower.useMutation({
      onSuccess: () => {
        setIsUnfollowDialogOpen(false);
        onSuccess(`Unfollowed @${username}`);
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
        void utils.flights.getFollowingFlights.invalidate();
      },
      onError,
    });
  return (
    <>
      <div className="bg-base-100/50 rounded-box pointer-events-auto flex w-full flex-col gap-1 p-2 backdrop-blur-xs">
        {isFetching ? (
          <div className="flex w-full justify-center">
            <Loading />
          </div>
        ) : null}
        {!isFetching && userData !== undefined ? (
          <>
            <div className="flex flex-row items-center gap-3">
              <Avatar
                src={userData.avatar}
                alt="User Avatar"
                shapeClassName="h-10 w-10 rounded-full"
              />
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="truncate text-base font-medium sm:text-xl">{`${userData.firstName} ${userData.lastName}`}</div>
                <div className="truncate text-sm opacity-75">{`@${userData.username}`}</div>
              </div>
              {isLoggedIn && !onOwnProfile ? (
                <Button
                  className={classNames(
                    'group btn-sm h-auto py-2',
                    isUnfollowDialogOpen && 'btn-error',
                    !isUnfollowDialogOpen &&
                      userData.isFollowing &&
                      'border-transparent bg-transparent shadow-transparent',
                    userData.isFollowing ? 'hover:btn-error' : 'btn-success',
                  )}
                  disabled={isAddFollowerLoading}
                  loading={isAddFollowerLoading}
                  onClick={() => {
                    if (userData.isFollowing) {
                      setIsUnfollowDialogOpen(true);
                    } else if (username !== undefined) {
                      addFollower({ username });
                    }
                  }}
                  soft
                  title={
                    !userData.isFollowing ? 'Follow User' : 'Unfollow User'
                  }
                >
                  {!userData.isFollowing ? (
                    <>
                      {!isAddFollowerLoading ? (
                        <UserPlusIcon className="h-6 w-6" />
                      ) : null}
                    </>
                  ) : (
                    <div className="relative h-6 w-6">
                      <UserMinusIcon
                        className={classNames(
                          'absolute h-6 w-6 opacity-0 transition-opacity',
                          isUnfollowDialogOpen
                            ? 'opacity-100'
                            : 'group-hover:opacity-100',
                        )}
                      />
                      <UserCheckIcon
                        className={classNames(
                          'absolute h-6 w-6 transition-opacity',
                          isUnfollowDialogOpen
                            ? 'opacity-0'
                            : 'group-hover:opacity-0',
                        )}
                      />
                    </div>
                  )}
                  <span className="sr-only">
                    {!userData.isFollowing ? 'Follow User' : 'Unfollow User'}
                  </span>
                </Button>
              ) : null}
            </div>
            <div className="flex flex-wrap">
              <Button className="gap-1" color="ghost" size="xs">
                <UserOutlineIcon className="text-info h-3 w-3" />
                <span>
                  {userData._count.following}
                  <span className="ml-1 opacity-60">Following</span>
                </span>
              </Button>
              <Button className="gap-1" color="ghost" size="xs">
                <UserSolidIcon className="text-info h-3 w-3" />
                <span>
                  {userData._count.followedBy}
                  <span className="ml-1 opacity-60">
                    Follower
                    {userData._count.followedBy !== 1 ? 's' : ''}
                  </span>
                </span>
              </Button>
            </div>
          </>
        ) : null}
      </div>
      {userData !== undefined ? (
        <Modal
          actionButtons={[
            {
              children: 'Cancel',
              color: 'secondary',
              onClick: () => {
                setIsUnfollowDialogOpen(false);
              },
              outline: true,
            },
            {
              children: 'Unfollow',
              color: 'primary',
              disabled: isRemoveFollowingLoading,
              loading: isRemoveFollowingLoading,
              onClick: () => {
                if (username !== undefined) removeFollower({ username });
              },
            },
          ]}
          onClose={() => {
            setIsUnfollowDialogOpen(false);
          }}
          open={isUnfollowDialogOpen}
          title="Unfollow User"
        >
          <div className="flex flex-col gap-3 pt-3">
            <div className="flex w-full justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <Avatar
                  src={userData.avatar}
                  alt="User Avatar"
                  shapeClassName="h-12 w-12 rounded-full"
                />
                <div className="flex flex-col overflow-hidden">
                  <div className="text-base font-medium">{`${userData.firstName} ${userData.lastName}`}</div>
                  <div className="truncate text-sm opacity-75">{`@${userData.username}`}</div>
                </div>
              </div>
              <div className="flex items-center opacity-80">
                {userData._count.flights} Flight
                {userData._count.flights !== 1 ? 's' : ''}
              </div>
            </div>
            Are you sure you want to unfollow this user?
          </div>
        </Modal>
      ) : null}
    </>
  );
};

import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, Button, CardBody, LoadingCard } from 'stratosphere-ui';
import { UserOutlineIcon, UserSolidIcon } from '../../common/components';
import { useTRPCErrorHandler } from '../../common/hooks';
import { useAuthStore } from '../../stores';
import { trpc } from '../../utils/trpc';

export const ProfileCard = (): JSX.Element => {
  const isLoggedIn = useAuthStore(({ token }) => token !== null);
  const navigate = useNavigate();
  const { username } = useParams();
  const { data: currentUserData } = trpc.users.getUser.useQuery(
    { username: undefined },
    {
      enabled: isLoggedIn,
      staleTime: 5 * 60 * 1000,
    },
  );
  const { data, error, isFetching } = trpc.users.getUser.useQuery(
    { username },
    {
      staleTime: 5 * 60 * 1000,
    },
  );
  useTRPCErrorHandler(error);
  const onOwnProfile = useMemo(
    () => username === undefined || username === currentUserData?.username,
    [currentUserData?.username, username],
  );
  return (
    <LoadingCard
      isLoading={isFetching}
      className="card-bordered card-compact h-[300px] w-[350px] bg-base-200 shadow-md"
    >
      <CardBody className="justify-between gap-2">
        <div className="flex flex-row items-center gap-4">
          <Avatar shapeClassName="h-20 w-20 rounded-full">
            <img src={data?.avatar} alt="User Avatar" />
          </Avatar>
          <div className="flex flex-1 flex-col">
            <div className="text-2xl font-medium">{`${data?.firstName ?? ''} ${
              data?.lastName ?? ''
            }`}</div>
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
                0
              </div>
              <div className="flex items-center">
                <Button color="ghost" size="xs" shape="circle">
                  <UserSolidIcon className="h-3 w-3 text-info" />
                  <span className="sr-only">Followers</span>
                </Button>
                0
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
        ) : (
          <Button size="sm" color="success">
            Follow
          </Button>
        )}
        <div className="stats flex bg-base-200">
          <div className="stat flex-1 place-items-center">
            <div className="stat-title">Trips</div>
            <div
              className="stat-value cursor-pointer text-success"
              onClick={() => {
                navigate('/trips');
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
                navigate('/flights');
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
                navigate('/flights');
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

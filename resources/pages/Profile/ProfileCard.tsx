import { useParams } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Button,
  CardBody,
  CardTitle,
  LoadingCard,
} from 'stratosphere-ui';
import { useTRPCErrorHandler } from '../../common/hooks';
import { trpc } from '../../utils/trpc';

export const ProfileCard = (): JSX.Element => {
  const { username } = useParams();
  const { data, error, isFetching } = trpc.users.getUser.useQuery(
    { username },
    {
      staleTime: 5 * 60 * 1000,
    },
  );
  useTRPCErrorHandler(error);
  return (
    <LoadingCard
      isLoading={isFetching}
      className="card-bordered card-compact h-[300px] w-[350px] bg-base-200 shadow-md"
    >
      <CardBody className="justify-between gap-2">
        <div className="flex flex-row items-center gap-4">
          <Avatar shapeClassName="h-20 w-20 rounded-full">
            <img src={data?.avatar} />
          </Avatar>
          <div className="flex flex-1 flex-col">
            <CardTitle className="text-2xl font-medium">{`${
              data?.firstName ?? ''
            } ${data?.lastName ?? ''}`}</CardTitle>
            <div className="text-md opacity-75">{`@${
              data?.username ?? ''
            }`}</div>
            <div className="mt-1 text-xs opacity-50">
              Joined {data?.creationDate}
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-4">
          <Badge outline color="info">
            <span className="text-semibold">0</span> followers
          </Badge>
          <Badge color="info">
            <span className="text-semibold">0</span> following
          </Badge>
        </div>
        {username !== undefined ? (
          <Button size="sm" color="success">
            Follow
          </Button>
        ) : null}
        <div className="stats flex bg-base-200">
          <div className="stat flex-1 place-items-center">
            <div className="stat-title">Flights</div>
            <div className="stat-value text-secondary">
              {data?.completedFlightCount}
            </div>
          </div>
          <div className="stat flex-1 place-items-center">
            <div className="stat-title">Upcoming</div>
            <div className="stat-value">{data?.upcomingFlightCount}</div>
          </div>
        </div>
      </CardBody>
    </LoadingCard>
  );
};

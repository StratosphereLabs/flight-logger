import { useParams } from '@tanstack/react-router';
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
      className="card-bordered w-80 shadow-md"
    >
      <CardBody className="items-center justify-between">
        <div className="flex flex-col items-center gap-1">
          <CardTitle className="text-2xl font-medium">{`${
            data?.firstName ?? ''
          } ${data?.lastName ?? ''}`}</CardTitle>
          <div className="text-md opacity-75">{`@${data?.username ?? ''}`}</div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Avatar shapeClassName="h-40 w-40 rounded-full">
            <img src={data?.avatar} />
          </Avatar>
          <div className="inline space-x-2 font-bold">
            <Badge outline size="sm" color="info">
              <span className="text-semibold">0</span> followers
            </Badge>
            <Badge size="sm" color="info">
              <span className="text-semibold">0</span> following
            </Badge>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg">{data?.completedFlightCount} Flights</span>
          <span className="text-sm font-semibold opacity-60">
            {data?.upcomingFlightCount} Upcoming
          </span>
        </div>
        <div className="text-xs opacity-50">Joined {data?.creationDate}</div>
        {username !== undefined ? (
          <Button color="success" className="mt-4">
            Follow
          </Button>
        ) : null}
      </CardBody>
    </LoadingCard>
  );
};

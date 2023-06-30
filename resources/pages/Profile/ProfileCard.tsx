import { useParams } from 'react-router-dom';
import {
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
      <CardBody className="items-center">
        <CardTitle className="text-2xl font-medium">{`${
          data?.firstName ?? ''
        } ${data?.lastName ?? ''}`}</CardTitle>
        <p className="text-md opacity-75">{`@${data?.username ?? ''}`}</p>
        <div className="avatar">
          <div className="h-32 w-32">
            <img alt="Avatar" src={data?.avatar ?? undefined} />
          </div>
        </div>
        <div className="inline space-x-2 font-bold">
          <Badge size="sm" color="primary">
            0 followers
          </Badge>
          <Badge size="sm" color="secondary">
            0 following
          </Badge>
        </div>
        <p>{data?.flightCount} Flights</p>
        <p className="text-xs opacity-50">Joined {data?.creationDate}</p>
        {username !== undefined ? (
          <Button color="success" className="mt-4">
            Follow
          </Button>
        ) : null}
      </CardBody>
    </LoadingCard>
  );
};

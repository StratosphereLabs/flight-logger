import { Badge, Button, Card } from 'react-daisyui';
import { useParams } from 'react-router-dom';
import { LoadingCard } from 'stratosphere-ui';
import { useTRPCErrorHandler } from '../common/hooks';
import { trpc } from '../utils/trpc';

export const ProfileCard = (): JSX.Element => {
  const { username } = useParams();
  const { data, error, isFetching } = trpc.users.getUser.useQuery({ username });
  useTRPCErrorHandler(error);
  return (
    <LoadingCard isLoading={isFetching} className="w-80 bg-base-100 shadow-lg">
      <Card.Body className="items-center">
        <Card.Title className="text-2xl font-medium">{`${
          data?.firstName ?? ''
        } ${data?.lastName ?? ''}`}</Card.Title>
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
          <Badge size="sm" color="success">
            0 following
          </Badge>
        </div>
        <p>{data?.flightCount} Flights</p>
        <p className="text-xs opacity-50">Joined September 2022</p>
        {username !== undefined ? (
          <Button className="mt-4">Follow</Button>
        ) : null}
      </Card.Body>
    </LoadingCard>
  );
};

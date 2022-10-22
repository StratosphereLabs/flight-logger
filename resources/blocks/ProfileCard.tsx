import { Avatar, Badge, Button, Card } from 'react-daisyui';
import { useParams } from 'react-router-dom';
import { LoadingCard } from '../common/components';
import { useTRPCErrorHandler } from '../common/hooks';
import { trpc } from '../utils/trpc';

export const ProfileCard = (): JSX.Element => {
  const { username } = useParams();
  const { data, error, isLoading } = trpc.users.getUser.useQuery({ username });
  useTRPCErrorHandler(error?.data);
  return (
    <LoadingCard isLoading={isLoading} className="shadow-xl w-80 bg-base-200">
      <Card.Body className="items-center">
        <Card.Title className="font-medium text-2xl">{`${
          data?.firstName ?? ''
        } ${data?.lastName ?? ''}`}</Card.Title>
        <p className="text-md opacity-75">{`@${data?.username ?? ''}`}</p>
        <Avatar size="lg" src={data?.avatar ?? undefined} />
        <div className="inline space-x-2 font-bold">
          <Badge size="sm" color="primary">
            3 followers
          </Badge>
          <Badge size="sm" color="success">
            5 following
          </Badge>
        </div>
        <p>72 Flights (3 upcoming)</p>
        <p className="text-xs opacity-50">Joined September 2022</p>
        <Button className="mt-4">Follow</Button>
      </Card.Body>
    </LoadingCard>
  );
};

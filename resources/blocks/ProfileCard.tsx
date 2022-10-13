import { useIsFetching } from '@tanstack/react-query';
import { Avatar, Badge, Button, Card } from 'react-daisyui';
import { LoadingCard } from '../common/components';
import { useAppContext } from '../providers';

export const ProfileCard = (): JSX.Element => {
  const { user } = useAppContext();
  const isFetching = useIsFetching(['userData']);
  return (
    <LoadingCard
      isLoading={isFetching > 0}
      className="shadow-xl w-80 bg-base-200"
    >
      <Card.Body className="items-center">
        <Card.Title className="font-medium text-2xl">{`${
          user?.firstName ?? ''
        } ${user?.lastName ?? ''}`}</Card.Title>
        <p className="text-md opacity-75">{`@${user?.username ?? ''}`}</p>
        <Avatar size="lg" src={user?.avatar ?? undefined} />
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

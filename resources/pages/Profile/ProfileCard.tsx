import { Avatar, Badge, Button, Card } from 'react-daisyui';
import { LoadingCard } from '../../common/components';
import { useUserQuery } from '../../common/hooks';

export const ProfileCard = (): JSX.Element => {
  const { isLoading, data } = useUserQuery();
  return (
    <LoadingCard
      isLoading={isLoading}
      className="shadow w-80 bg-base-200 min-w-[200px]"
    >
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

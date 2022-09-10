import { Avatar, Badge, Button, Card } from 'react-daisyui';

export const ProfileCard = (): JSX.Element => (
  <Card className="shadow w-80 bg-base-200">
    <Card.Body className="items-center">
      <Card.Title className="font-medium text-2xl">Ethan Shields</Card.Title>
      <p className="text-md opacity-75">@shieldse</p>
      <Avatar
        size="lg"
        src="http://daisyui.com/tailwind-css-component-profile-1@94w.png"
      />
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
  </Card>
);

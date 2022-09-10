import { Avatar, Badge, Button, Card } from 'react-daisyui';

export const ProfileCard = (): JSX.Element => (
  <Card className="w-80">
    <Card.Body className="items-center">
      <Card.Title>Ethan Shields</Card.Title>
      <div className="inline space-x-2">
        <Badge size="sm" color="primary">
          3 followers
        </Badge>
        <Badge size="sm" color="success">
          5 following
        </Badge>
      </div>
      <Avatar
        size="lg"
        src="http://daisyui.com/tailwind-css-component-profile-1@94w.png"
      />
      <p>72 Flights (3 upcoming)</p>
      <p>Joined September 2022</p>
      <Button className="mt-4">Follow</Button>
    </Card.Body>
  </Card>
);

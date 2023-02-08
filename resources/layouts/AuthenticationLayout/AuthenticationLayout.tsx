import { Card, Hero } from 'react-daisyui';
import { Outlet } from 'react-router-dom';
import { AlertMessages } from 'stratosphere-ui';
import { DarkModeButton } from '../../common/components';

export const AuthenticationLayout = (): JSX.Element => (
  <Hero className="min-h-screen bg-base-200">
    <Hero.Content className="w-full flex-wrap justify-around">
      <div className="text-center lg:text-left">
        <div className="font-title inline-flex text-lg text-primary transition-all duration-200 md:text-5xl">
          <span>Flight</span> <span className="text-base-content">Logger</span>
        </div>
        <p className="py-6">
          Welcome! Please login to access your flights and trips
        </p>
      </div>
      <Card className="mx-10 w-full max-w-md flex-shrink-0 bg-base-100 shadow-2xl">
        <Card.Body>
          <Outlet />
        </Card.Body>
      </Card>
    </Hero.Content>
    <AlertMessages maxMessages={4} />
    <div className="absolute top-0 right-0">
      <DarkModeButton />
    </div>
  </Hero>
);

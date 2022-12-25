import classNames from 'classnames';
import { MouseEventHandler } from 'react';
import { Button, Card, CardProps, Hero } from 'react-daisyui';
import { ChartIcon, GlobeIcon, ListIcon } from '../../common/components';

export interface WelcomeCardProps extends CardProps {
  onGetStarted?: MouseEventHandler<HTMLButtonElement>;
}

export const WelcomeCard = ({
  className,
  onGetStarted,
  ...props
}: WelcomeCardProps): JSX.Element => (
  <Card
    className={classNames('bg-base-200', 'min-h-[75vh]', className)}
    {...props}
  >
    <Card.Body className="justify-center">
      <Hero>
        <Hero.Content className="text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Welcome!</h1>
            <p className="py-4">
              Your all-in-one personal flight logbook and trip planner
            </p>
            <ul className="py-4 space-y-1 text-sm text-gray-500">
              <li className="flex justify-center gap-2">
                <ListIcon />
                Log detailed flight information and organize them by trip
              </li>
              <li className="flex justify-center gap-2">
                <GlobeIcon />
                Create itineraries and share with family and friends easily
              </li>
              <li className="flex justify-center gap-2">
                <ChartIcon />
                Advanced data analytics
              </li>
            </ul>
            <Button className="mt-4" color="info" onClick={onGetStarted}>
              Get Started
            </Button>
          </div>
        </Hero.Content>
      </Hero>
    </Card.Body>
  </Card>
);

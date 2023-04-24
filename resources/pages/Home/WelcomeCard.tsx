import { Button, Card, Hero } from 'react-daisyui';
import { useItineraryFlightsContext } from './ItineraryFlightsProvider';
import { ChartIcon, GlobeIcon, ListIcon } from '../../common/components';

export const WelcomeCard = (): JSX.Element => {
  const { setIsCreateItineraryModalOpen } = useItineraryFlightsContext();
  return (
    <Card className="min-h-[75vh] bg-base-100 shadow-lg">
      <Card.Body className="justify-center">
        <Hero>
          <Hero.Content className="text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold">Welcome!</h1>
              <p className="py-4">
                Your all-in-one personal flight logbook and trip planner
              </p>
              <ul className="space-y-1 py-4 text-sm text-gray-500">
                <li className="flex justify-center gap-2">
                  <ListIcon className="h-5 w-5" />
                  Log detailed flight information and organize them by trip
                </li>
                <li className="flex justify-center gap-2">
                  <GlobeIcon className="h-5 w-5" />
                  Create itineraries and share with family and friends easily
                </li>
                <li className="flex justify-center gap-2">
                  <ChartIcon />
                  Advanced data analytics
                </li>
              </ul>
              <Button
                className="mt-4"
                color="info"
                onClick={() => setIsCreateItineraryModalOpen(true)}
              >
                Get Started
              </Button>
            </div>
          </Hero.Content>
        </Hero>
      </Card.Body>
    </Card>
  );
};

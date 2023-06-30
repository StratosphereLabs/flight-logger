import { Button, Card, CardBody } from 'stratosphere-ui';
import { ChartIcon, GlobeIcon, ListIcon } from '../../common/components';
import { useItineraryFlightsStore } from './itineraryFlightsStore';

export const WelcomeCard = (): JSX.Element => {
  const { setIsCreateItineraryModalOpen } = useItineraryFlightsStore();
  return (
    <Card className="min-h-[75vh] bg-base-100 shadow-md">
      <CardBody className="justify-center">
        <div className="hero">
          <div className="hero-content text-center">
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
                onClick={() => {
                  setIsCreateItineraryModalOpen(true);
                }}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

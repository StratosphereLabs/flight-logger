import { CreateItineraryModal } from './CreateItineraryModal';
import { WelcomeCard } from './WelcomeCard';
import { ItineraryFlightsProvider } from './ItineraryFlightsProvider';

export const Home = (): JSX.Element => (
  <ItineraryFlightsProvider>
    <div className="flex flex-1 flex-col gap-3 p-3">
      <WelcomeCard />
    </div>
    <CreateItineraryModal />
  </ItineraryFlightsProvider>
);

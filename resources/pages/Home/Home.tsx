import { CreateItineraryModal } from './CreateItineraryModal';
import { WelcomeCard } from './WelcomeCard';

export interface HomePageNavigationState {
  createItinerary: boolean | undefined;
}

export const Home = (): JSX.Element => (
  <>
    <div className="flex flex-1 flex-col gap-3 p-3">
      <WelcomeCard />
    </div>
    <CreateItineraryModal />
  </>
);

import { useState } from 'react';
import { CreateItineraryModal } from './CreateItineraryModal';
import { WelcomeCard } from './WelcomeCard';

export const Home = (): JSX.Element => {
  const [isItineraryModalOpen, setIsItineraryModalOpen] = useState(false);
  return (
    <div className="flex flex-1 flex-col gap-3 p-3">
      <WelcomeCard onGetStarted={() => setIsItineraryModalOpen(true)} />
      <CreateItineraryModal
        open={isItineraryModalOpen}
        onClose={() => setIsItineraryModalOpen(false)}
      />
    </div>
  );
};

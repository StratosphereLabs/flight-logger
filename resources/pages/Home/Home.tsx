import { useRef } from 'react';
import { ItineraryBuilderCard } from './ItineraryBuilderCard';
import { WelcomeCard } from './WelcomeCard';

export const Home = (): JSX.Element => {
  const itineraryCardRef = useRef<HTMLDivElement | null>(null);
  return (
    <>
      <WelcomeCard
        onGetStarted={() => itineraryCardRef.current?.scrollIntoView()}
      />
      <ItineraryBuilderCard ref={itineraryCardRef} />
    </>
  );
};

import { useRef } from 'react';
import { ItineraryBuilderCard } from './ItineraryBuilderCard';
import { WelcomeCard } from './WelcomeCard';

export const Home = (): JSX.Element => {
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const itineraryCardRef = useRef<HTMLDivElement | null>(null);
  return (
    <>
      <WelcomeCard
        onGetStarted={() => {
          itineraryCardRef.current?.scrollIntoView();
          firstFieldRef.current?.focus();
        }}
      />
      <ItineraryBuilderCard
        firstFieldRef={firstFieldRef}
        ref={itineraryCardRef}
      />
    </>
  );
};

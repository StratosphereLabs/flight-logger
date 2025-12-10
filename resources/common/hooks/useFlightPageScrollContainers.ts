import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';

export interface UseFlightPageScrollContainersOptions {
  setIsMapCollapsed: Dispatch<SetStateAction<boolean>>;
}

export interface UseFlightPageScrollContainersResult {
  scrollContainerRef: RefObject<HTMLDivElement>;
  scrollContainerMobileRef: RefObject<HTMLDivElement>;
  isScrolled: boolean;
}

export const useFlightPageScrollContainers = ({
  setIsMapCollapsed,
}: UseFlightPageScrollContainersOptions): UseFlightPageScrollContainersResult => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerMobileRef = useRef<HTMLDivElement | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container === null) return;
    const handleScroll = (): void => {
      const scrollThreshold = Math.floor(window.innerHeight / 2) - 305;
      setIsScrolled(container.scrollTop >= scrollThreshold + 200);
    };
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);
  useEffect(() => {
    const mobileContainer = scrollContainerMobileRef.current;
    if (mobileContainer === null) return;
    const handleMobileScroll = (): void => {
      const scrollThreshold = Math.floor(window.innerHeight / 2) - 305;
      setIsMapCollapsed(prevIsMapCollapsed =>
        prevIsMapCollapsed
          ? mobileContainer.scrollTop > 0
          : mobileContainer.scrollTop >= scrollThreshold,
      );
      setIsScrolled(mobileContainer.scrollTop >= scrollThreshold + 200);
    };
    mobileContainer.addEventListener('scroll', handleMobileScroll);
    return () => {
      mobileContainer.removeEventListener('scroll', handleMobileScroll);
    };
  }, [setIsMapCollapsed]);
  return {
    scrollContainerRef,
    scrollContainerMobileRef,
    isScrolled,
  };
};

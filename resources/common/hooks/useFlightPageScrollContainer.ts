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
  isScrolled: boolean;
}

export const useFlightPageScrollContainer = ({
  setIsMapCollapsed,
}: UseFlightPageScrollContainersOptions): UseFlightPageScrollContainersResult => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container === null) return;
    const handleScroll = (): void => {
      const scrollThreshold = Math.floor(window.innerHeight / 2) - 305;
      if (window.innerWidth < 768) {
        setIsMapCollapsed(prevIsMapCollapsed =>
          prevIsMapCollapsed
            ? container.scrollTop > 0
            : container.scrollTop >= scrollThreshold,
        );
      }
      setIsScrolled(container.scrollTop >= scrollThreshold + 200);
    };
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [setIsMapCollapsed]);
  return {
    scrollContainerRef,
    isScrolled,
  };
};

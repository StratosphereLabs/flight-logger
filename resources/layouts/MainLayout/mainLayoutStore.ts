import { type RefObject } from 'react';
import { create } from 'zustand';

interface MainLayoutState {
  previousPageName: string | null;
  setPreviousPageName: (previousPage: string) => void;
  clearPreviousPageName: () => void;
  scrollContainerRef: RefObject<HTMLDivElement> | null;
  setScrollContainerRef: (ref: RefObject<HTMLDivElement>) => void;
}

export const useMainLayoutStore = create<MainLayoutState>()(set => ({
  previousPageName: null,
  setPreviousPageName: previousPageName => {
    set({ previousPageName });
  },
  clearPreviousPageName: () => {
    set({ previousPageName: null });
  },
  scrollContainerRef: null,
  setScrollContainerRef: scrollContainerRef => {
    set({ scrollContainerRef });
  },
}));

import { type RefObject } from 'react';
import { create } from 'zustand';

interface MainLayoutState {
  scrollContainerRef: RefObject<HTMLDivElement> | null;
  setScrollContainerRef: (ref: RefObject<HTMLDivElement>) => void;
}

export const useMainLayoutStore = create<MainLayoutState>()(set => ({
  scrollContainerRef: null,
  setScrollContainerRef: scrollContainerRef => {
    set({ scrollContainerRef });
  },
}));

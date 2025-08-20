import { MAX_CLOUD_COLS } from './constants';

export const getCloudColumns = (cover: string): number => {
  if (cover === 'FEW') return Math.round(MAX_CLOUD_COLS * 0.25);
  if (cover === 'SCT') return Math.round(MAX_CLOUD_COLS * 0.5);
  if (cover === 'BKN') return Math.round(MAX_CLOUD_COLS * 0.75);
  if (cover === 'OVC') return MAX_CLOUD_COLS;
  return 0;
};

export const getRandomIntegers = (x: number, n: number): number[] => {
  const nums = new Set<number>();
  while (nums.size < x) {
    const rand = Math.floor(Math.random() * n) + 1;
    nums.add(rand);
  }
  return Array.from(nums);
};

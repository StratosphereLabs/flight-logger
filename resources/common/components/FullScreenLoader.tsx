import { Progress } from 'react-daisyui';

export const FullScreenLoader = (): JSX.Element => (
  <div className="flex-1 flex items-center justify-center">
    <Progress className="w-56 mt-4" />
  </div>
);

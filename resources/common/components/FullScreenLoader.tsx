import { Progress } from 'react-daisyui';

export const FullScreenLoader = (): JSX.Element => (
  <div className="h-full w-full flex items-center justify-center">
    <Progress className="w-56" />
  </div>
);

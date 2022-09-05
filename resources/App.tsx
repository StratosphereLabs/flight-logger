import { Button } from 'react-daisyui';

export const App = (): JSX.Element => (
  <div className="flex h-screen">
    <div className="m-auto">
      <div className="text-6xl text-red-600">1</div>
      <Button color="primary">Click me!</Button>
    </div>
  </div>
);

export default App;

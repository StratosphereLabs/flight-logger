import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MainLayout } from './layouts';
import { AddFlight, Data, Flights, Home } from './pages';

export const App = (): JSX.Element => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="add-flight" element={<AddFlight />} />
        <Route path="flights" element={<Flights />} />
        <Route path="data" element={<Data />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;

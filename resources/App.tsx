import { Route, Routes } from 'react-router-dom';
import { AuthenticationLayout, MainLayout } from './layouts';
import { AddFlight, Data, Flights, Home, Login } from './pages';

export const App = (): JSX.Element => (
  <Routes>
    <Route path="/" element={<MainLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="add-flight" element={<AddFlight />} />
      <Route path="flights" element={<Flights />} />
      <Route path="data" element={<Data />} />
    </Route>
    <Route path="auth" element={<AuthenticationLayout />}>
      <Route path="login" element={<Login />} />
    </Route>
  </Routes>
);

export default App;

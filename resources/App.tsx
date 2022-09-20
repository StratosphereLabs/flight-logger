import { Route, Routes } from 'react-router-dom';
import { AuthenticationLayout, MainLayout } from './layouts';
import {
  AddFlight,
  Data,
  Flights,
  ForgotPassword,
  Profile,
  Login,
  ResetPassword,
  Register,
} from './pages';

export const App = (): JSX.Element => (
  <Routes>
    <Route path="/" element={null} />
    <Route path="/" element={<MainLayout />}>
      <Route path="data" element={<Data />} />
      <Route path="profile" element={<Profile />} />
      <Route path="add-flight" element={<AddFlight />} />
      <Route path="flights" element={<Flights />} />
    </Route>
    <Route path="auth" element={<AuthenticationLayout />}>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="reset-password/:token" element={<ResetPassword />} />
    </Route>
  </Routes>
);

export default App;

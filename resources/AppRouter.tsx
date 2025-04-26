import { Route, Routes } from 'react-router-dom';

import { AuthenticationLayout, MainLayout, ProfileLayout } from './layouts';
import {
  Account,
  Data,
  Flight,
  ForgotPassword,
  Home,
  Login,
  Profile,
  Register,
  ResetPassword,
  Trips,
  Users,
} from './pages';
import { useProfileFilterForm } from './pages/Profile/hooks';

export const AppRouter = (): JSX.Element => {
  const methods = useProfileFilterForm();
  return (
    <Routes>
      <Route path="/" element={<MainLayout methods={methods} />}>
        <Route path="" element={<Home />} />
        <Route path="data" element={<Data />} />
        <Route path="users" element={<Users />} />
        {['', 'user/:username'].map(path => (
          <Route key={path} path={path} element={<ProfileLayout />}>
            <Route
              path={path === '' ? 'profile' : ''}
              element={<Profile filtersFormControl={methods.control} />}
            />
            <Route path="trips/:tripId?" element={<Trips />} />
            {path === '' ? (
              <Route path="account" element={<Account />} />
            ) : null}
          </Route>
        ))}
        <Route path="flight/:flightId" element={<Flight />} />
      </Route>
      <Route path="auth" element={<AuthenticationLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
      </Route>
    </Routes>
  );
};

import { Route, Routes } from 'react-router-dom';
import { AuthenticationLayout, MainLayout, ProfileLayout } from './layouts';
import {
  Account,
  AddFlight,
  Data,
  ForgotPassword,
  Home,
  Login,
  ResetPassword,
  Register,
  Profile,
  Trips,
  Users,
} from './pages';
import { useProfileFilterForm } from './pages/Profile/hooks';
import { Flight } from './pages/Flights/Flight';

export const AppRouter = (): JSX.Element => {
  const methods = useProfileFilterForm();
  return (
    <Routes>
      <Route path="/" element={<MainLayout methods={methods} />}>
        <Route path="" element={<Home />} />
        <Route path="data" element={<Data />} />
        <Route path="users" element={<Users />} />
        <Route path="add-flight" element={<AddFlight />} />
        <Route path="flights/:flightId?" element={<Flight />} />
        
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

import { Route, Routes } from 'react-router-dom';
import { AuthenticationLayout, MainLayout, ProfileLayout } from './layouts';
import {
  Account,
  AddFlight,
  CreateItinerary,
  Data,
  Flights,
  ForgotPassword,
  Home,
  Itineraries,
  Itinerary,
  Login,
  ResetPassword,
  Register,
  Profile,
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
        <Route path="create-itinerary" element={<CreateItinerary />} />
        <Route path="add-flight" element={<AddFlight />} />
        {['', 'user/:username'].map(path => (
          <Route key={path} path={path} element={<ProfileLayout />}>
            <Route
              path={path === '' ? 'profile' : ''}
              element={<Profile filtersFormControl={methods.control} />}
            />
            <Route path="flights/:flightId?" element={<Flights />} />
            <Route path="trips/:tripId?" element={<Trips />} />
            <Route path="itineraries" element={<Itineraries />} />
            {path === '' ? (
              <Route path="account" element={<Account />} />
            ) : null}
          </Route>
        ))}
        <Route path="itinerary/:id" element={<Itinerary />} />
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

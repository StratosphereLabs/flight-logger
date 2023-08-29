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
} from './pages';

export const AppRouter = (): JSX.Element => (
  <Routes>
    <Route path="/" element={<MainLayout />}>
      <Route path="" element={<Home />} />
      <Route path="data" element={<Data />} />
      <Route path="create-itinerary" element={<CreateItinerary />} />
      <Route path="add-flight" element={<AddFlight />} />
      {['', 'user/:username'].map(path => (
        <Route key={path} path={path} element={<ProfileLayout />}>
          <Route path={path === '' ? 'profile' : ''} element={<Profile />} />
          <Route path="flights/:flightId?" element={<Flights />} />
          <Route path="trips/:tripId?" element={<Trips />} />
          <Route path="itineraries" element={<Itineraries />} />
          {path === '' ? <Route path="account" element={<Account />} /> : null}
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

import { Outlet, RootRoute, Route, Router } from '@tanstack/react-router';
import { lazy } from 'react';
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
  Profile,
  ResetPassword,
  Register,
  Trips,
} from './pages';

const TanStackRouterDevtools =
  import.meta.env.NODE_ENV === 'production'
    ? () => null
    : lazy(() =>
        import('@tanstack/router-devtools').then(res => ({
          default: res.TanStackRouterDevtools,
        })),
      );

const rootRoute = new RootRoute({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: MainLayout,
});

const homeRoute = new Route({
  getParentRoute: () => indexRoute,
  path: '/',
  component: Home,
});

const dataRoute = new Route({
  getParentRoute: () => indexRoute,
  path: 'data',
  component: Data,
});

const createItineraryRoute = new Route({
  getParentRoute: () => indexRoute,
  path: 'create-itinerary',
  component: CreateItinerary,
});

const addFlightRoute = new Route({
  getParentRoute: () => indexRoute,
  path: 'add-flight',
  component: AddFlight,
});

const userProfileRoute = new Route({
  getParentRoute: () => indexRoute,
  path: 'user/$username',
  component: ProfileLayout,
});

const userProfileHomeRoute = new Route({
  getParentRoute: () => userProfileRoute,
  path: '/',
  component: Profile,
});

const userProfileFlightsRoute = new Route({
  getParentRoute: () => userProfileRoute,
  path: 'flights',
  component: Flights,
});

const userProfileTripsRoute = new Route({
  getParentRoute: () => userProfileRoute,
  path: 'trips',
  component: Trips,
});

const userProfileItinerariesRoute = new Route({
  getParentRoute: () => userProfileRoute,
  path: 'itineraries',
  component: Itineraries,
});

const userProfileAccountRoute = new Route({
  getParentRoute: () => userProfileRoute,
  path: 'account',
  component: Account,
});

const itineraryRoute = new Route({
  getParentRoute: () => indexRoute,
  path: 'itinerary/$id',
  component: Itinerary,
});

const authRoute = new Route({
  getParentRoute: () => rootRoute,
  path: 'auth',
  component: AuthenticationLayout,
});

const loginRoute = new Route({
  getParentRoute: () => authRoute,
  path: 'login',
  component: Login,
});

const registerRoute = new Route({
  getParentRoute: () => authRoute,
  path: 'register',
  component: Register,
});

const forgotPasswordRoute = new Route({
  getParentRoute: () => authRoute,
  path: 'forgot-password',
  component: ForgotPassword,
});

const resetPasswordRoute = new Route({
  getParentRoute: () => authRoute,
  path: 'reset-password/$token',
  component: ResetPassword,
});

const routeTree = rootRoute.addChildren([
  indexRoute.addChildren([
    homeRoute,
    dataRoute,
    createItineraryRoute,
    addFlightRoute,
    userProfileHomeRoute,
    userProfileFlightsRoute,
    userProfileTripsRoute,
    userProfileItinerariesRoute,
    userProfileRoute.addChildren([
      userProfileHomeRoute,
      userProfileFlightsRoute,
      userProfileTripsRoute,
      userProfileItinerariesRoute,
      userProfileAccountRoute,
    ]),
    itineraryRoute,
  ]),
  authRoute.addChildren([
    loginRoute,
    registerRoute,
    forgotPasswordRoute,
    resetPasswordRoute,
  ]),
]);

export const router = new Router({ routeTree });

// export const AppRouter = (): JSX.Element => (
//   <>
//     <Route path="/" element={<MainLayout />}>
//       <Route path="" element={<Home />} />
//       <Route path="data" element={<Data />} />
//       <Route path="create-itinerary" element={<CreateItinerary />} />
//       <Route path="add-flight" element={<AddFlight />} />
//       {['', 'user/:username'].map(path => (
//         <Route key={path} path={path} element={<ProfileLayout />}>
//           <Route path={path === '' ? 'profile' : ''} element={<Profile />} />
//           <Route path="flights/:flightId?" element={<Flights />} />
//           <Route path="trips/:tripId?" element={<Trips />} />
//           <Route path="itineraries" element={<Itineraries />} />
//           {path === '' ? <Route path="account" element={<Account />} /> : null}
//         </Route>
//       ))}
//       <Route path="itinerary/:id" element={<Itinerary />} />
//     </Route>
//     <Route path="auth" element={<AuthenticationLayout />}>
//       <Route path="login" element={<Login />} />
//       <Route path="register" element={<Register />} />
//       <Route path="forgot-password" element={<ForgotPassword />} />
//       <Route path="reset-password/:token" element={<ResetPassword />} />
//     </Route>
//   </>
// );

import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';

import { AuthenticationLayout, MainLayout, ProfileLayout } from '../layouts';
import {
  Account,
  Aircraft,
  Data,
  Flight,
  ForgotPassword,
  Home,
  Login,
  Profile,
  Register,
  ResetPassword,
  Users,
} from '../pages';
import {
  flightPageSearchSchema,
  profilePageSearchSchema,
  userPageSearchSchema,
} from './searchSchemas';

export const rootRoute = createRootRoute({ component: MainLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'auth',
  component: AuthenticationLayout,
});

const dataRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'data',
  component: Data,
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'users',
  component: Users,
});

const pathlessProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'pathlessProfileLayout',
  component: ProfileLayout,
});

const userRoute = createRoute({
  getParentRoute: () => pathlessProfileRoute,
  path: 'user/$username',
  component: Profile,
  validateSearch: userPageSearchSchema,
});

const profileRoute = createRoute({
  getParentRoute: () => pathlessProfileRoute,
  path: 'profile',
  component: Profile,
  validateSearch: profilePageSearchSchema,
});

const accountRoute = createRoute({
  getParentRoute: () => pathlessProfileRoute,
  path: 'account',
  component: Account,
});

const flightRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'flight/$flightId',
  component: Flight,
  validateSearch: flightPageSearchSchema,
});

const aircraftRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'aircraft/$icao24',
  component: Aircraft,
  validateSearch: flightPageSearchSchema,
});

const loginRoute = createRoute({
  getParentRoute: () => authRoute,
  path: 'login',
  component: Login,
});

const registerRoute = createRoute({
  getParentRoute: () => authRoute,
  path: 'register',
  component: Register,
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => authRoute,
  path: 'forgot-password',
  component: ForgotPassword,
});

export const resetPasswordRoute = createRoute({
  getParentRoute: () => authRoute,
  path: 'reset-password/$token',
  component: ResetPassword,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  dataRoute,
  usersRoute,
  pathlessProfileRoute.addChildren([accountRoute, profileRoute, userRoute]),
  flightRoute,
  aircraftRoute,
  authRoute.addChildren([
    loginRoute,
    registerRoute,
    forgotPasswordRoute,
    resetPasswordRoute,
  ]),
]);

export const appRouter = createRouter({
  routeTree,
});

export type AppRouter = typeof appRouter;

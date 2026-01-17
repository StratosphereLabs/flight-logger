import { useStatsigUser } from '@statsig/react-bindings';
import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { useEffect } from 'react';

import { useLoggedInUserQuery } from './common/hooks';
import { AuthenticationLayout, MainLayout, ProfileLayout } from './layouts';
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
  Trips,
  Users,
} from './pages';
import { useProfileFilterForm } from './pages/Profile/hooks';

export const rootRoute = createRootRoute();

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

const authRouteTree = authRoute.addChildren([
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
]);

const routeTree = indexRoute.addChildren([authRouteTree]);

const router = createRouter({
  routeTree,
});

export const AppRouter = (): JSX.Element => {
  const methods = useProfileFilterForm();
  const { data } = useLoggedInUserQuery();
  const { updateUserSync } = useStatsigUser();
  useEffect(() => {
    if (data !== undefined) {
      updateUserSync({
        userID: data.id.toString(),
        email: data.email,
      });
    }
  }, [data, updateUserSync]);
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
        <Route path="aircraft/:icao24" element={<Aircraft />} />
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

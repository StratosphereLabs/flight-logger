import { createRootRoute, createRoute } from '@tanstack/react-router';

import { profileSearchSchema } from '../app/schemas';
import { AuthenticationLayout, MainLayout, ProfileLayout } from './layouts';
import {
  Account,
  Aircraft,
  Data,
  Flight,
  ForgotPassword,
  Login,
  Profile,
  Register,
  ResetPassword,
  Users,
} from './pages';

export const rootRoute = createRootRoute();

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: MainLayout,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'auth',
  component: AuthenticationLayout,
});

const dataRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: 'data',
  component: Data,
});

const usersRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: 'users',
  component: Users,
});

const pathlessProfileRoute = createRoute({
  getParentRoute: () => indexRoute,
  id: 'pathlessProfileLayout',
  component: ProfileLayout,
});

const userRoute = createRoute({
  getParentRoute: () => pathlessProfileRoute,
  path: 'user/$username',
  component: Profile,
});

const profileRoute = createRoute({
  getParentRoute: () => pathlessProfileRoute,
  path: 'profile',
  component: Profile,
  validateSearch: profileSearchSchema,
});

const accountRoute = createRoute({
  getParentRoute: () => pathlessProfileRoute,
  path: 'account',
  component: Account,
});

const flightRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: 'flight/$flightId',
  component: Flight,
});

const aircraftRoute = createRoute({
  getParentRoute: () => indexRoute,
  path: 'aircraft/$icao24',
  component: Aircraft,
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

export const routeTree = rootRoute.addChildren([
  indexRoute.addChildren([
    dataRoute,
    userRoute,
    usersRoute,
    profileRoute,
    pathlessProfileRoute.addChildren([accountRoute]),
    flightRoute,
    aircraftRoute,
  ]),
  authRoute.addChildren([
    loginRoute,
    registerRoute,
    forgotPasswordRoute,
    resetPasswordRoute,
  ]),
]);

// export const AppRouter = (): JSX.Element => {
//   const methods = useProfileFilterForm();
//   const { data } = useLoggedInUserQuery();
//   const { updateUserSync } = useStatsigUser();
//   useEffect(() => {
//     if (data !== undefined) {
//       updateUserSync({
//         userID: data.id.toString(),
//         email: data.email,
//       });
//     }
//   }, [data, updateUserSync]);
//   return (
//     <Routes>
//       <Route path="/" element={<MainLayout methods={methods} />}>
//         <Route path="" element={<Home />} />
//         <Route path="data" element={<Data />} />
//         <Route path="users" element={<Users />} />
//         {['', 'user/:username'].map(path => (
//           <Route key={path} path={path} element={<ProfileLayout />}>
//             <Route
//               path={path === '' ? 'profile' : ''}
//               element={<Profile filtersFormControl={methods.control} />}
//             />
//             <Route path="trips/:tripId?" element={<Trips />} />
//             {path === '' ? (
//               <Route path="account" element={<Account />} />
//             ) : null}
//           </Route>
//         ))}
//         <Route path="flight/:flightId" element={<Flight />} />
//         <Route path="aircraft/:icao24" element={<Aircraft />} />
//       </Route>
//       <Route path="auth" element={<AuthenticationLayout />}>
//         <Route path="login" element={<Login />} />
//         <Route path="register" element={<Register />} />
//         <Route path="forgot-password" element={<ForgotPassword />} />
//         <Route path="reset-password/:token" element={<ResetPassword />} />
//       </Route>
//     </Routes>
//   );
// };

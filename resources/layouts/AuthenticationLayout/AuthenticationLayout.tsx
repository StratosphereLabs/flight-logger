import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { Button, Card, CardBody } from 'stratosphere-ui';

import {
  LogoHorizontal,
  RightArrowIcon,
  ThemeButton,
} from '../../common/components';

export const AuthenticationLayout = (): JSX.Element => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <div className="hero bg-base-200 min-h-[100dvh]">
      <div className="hero-content flex w-full flex-col md:flex-row">
        <div className="flex flex-col items-center md:items-start">
          <LogoHorizontal className="text-secondary w-60" />
          <p className="py-6">Welcome! Please login to access your flights</p>
          {pathname === '/auth/login' ? (
            <Button
              color="secondary"
              onClick={() => navigate({ to: '/auth/register' })}
              soft
            >
              Register <RightArrowIcon className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
        <Card className="bg-base-100 w-full max-w-md shrink-0 shadow-lg">
          <CardBody>
            <Outlet />
          </CardBody>
        </Card>
      </div>
      <div className="absolute top-0 right-0 p-1">
        <ThemeButton />
      </div>
    </div>
  );
};

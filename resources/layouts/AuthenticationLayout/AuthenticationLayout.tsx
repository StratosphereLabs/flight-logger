import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertMessages,
  Button,
  Card,
  CardBody,
  useAlertMessages,
} from 'stratosphere-ui';

import { RightArrowIcon, ThemeButton } from '../../common/components';

export const AuthenticationLayout = (): JSX.Element => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { alertMessages } = useAlertMessages();
  return (
    <div className="hero bg-base-200 min-h-[100dvh]">
      <div className="hero-content w-full flex-wrap justify-around">
        <div className="text-center lg:text-left">
          <div className="font-title text-primary inline-flex text-lg transition-all duration-200 md:text-5xl">
            <span>Flight</span>{' '}
            <span className="text-base-content">Logger</span>
          </div>
          <p className="py-6">
            Welcome! Please login to access your flights and trips
          </p>
          {pathname === '/auth/login' ? (
            <Button
              color="secondary"
              onClick={() => {
                navigate('/auth/register');
              }}
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
      {alertMessages.length > 0 ? (
        <div className="toast toast-end toast-top z-50 w-1/2 min-w-[400px]">
          <AlertMessages maxMessages={4} />
        </div>
      ) : null}
      <div className="absolute top-0 right-0 p-1">
        <ThemeButton />
      </div>
    </div>
  );
};

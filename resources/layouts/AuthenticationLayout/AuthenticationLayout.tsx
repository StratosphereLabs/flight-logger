import {
  Outlet,
  // useLocation, useNavigate
} from 'react-router-dom';
import {
  AlertMessages,
  Card,
  CardBody,
  useAlertMessages,
} from 'stratosphere-ui';
import { ThemeButton } from '../../common/components';

export const AuthenticationLayout = (): JSX.Element => {
  // const navigate = useNavigate();
  // const { pathname } = useLocation();
  const { alertMessages } = useAlertMessages();
  return (
    <div className="hero min-h-[100dvh] bg-base-200">
      <div className="hero-content w-full flex-wrap justify-around">
        <div className="text-center lg:text-left">
          <div className="font-title inline-flex text-lg text-primary transition-all duration-200 md:text-5xl">
            <span>Flight</span>{' '}
            <span className="text-base-content">Logger</span>
          </div>
          <p className="py-6">
            Welcome! Please login to access your flights and trips
          </p>
          {/*
          {pathname === '/auth/login' ? (
            <Button
              color="secondary"
              onClick={() => {
                navigate('/auth/register');
              }}
            >
              Register{' '}
              <Icon icon="mdi:arrow-right-thin" width={20} height={20} />
            </Button>
          ) : null}
        */}
        </div>
        <Card className="w-full max-w-md flex-shrink-0 bg-base-100 shadow-lg">
          <CardBody className="pt-[1rem]">
            <Outlet />
          </CardBody>
        </Card>
      </div>
      {alertMessages.length > 0 ? (
        <div className="toast toast-end toast-top z-50 w-1/2 min-w-[400px]">
          <AlertMessages maxMessages={4} />
        </div>
      ) : null}
      <div className="absolute right-0 top-0 p-1">
        <ThemeButton />
      </div>
    </div>
  );
};

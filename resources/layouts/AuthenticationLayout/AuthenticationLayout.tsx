import { Outlet } from 'react-router-dom';
import { AlertMessages, useAlertMessages } from 'stratosphere-ui';
import { ThemeButton } from '../../common/components';

export const AuthenticationLayout = (): JSX.Element => {
  const { alertMessages } = useAlertMessages();
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content w-full flex-wrap justify-around">
        <div className="text-center lg:text-left">
          <div className="font-title inline-flex text-lg text-primary transition-all duration-200 md:text-5xl">
            <span>Flight</span>{' '}
            <span className="text-base-content">Logger</span>
          </div>
          <p className="py-6">
            Welcome! Please login to access your flights and trips
          </p>
        </div>
        <div className="card mx-10 w-full max-w-md flex-shrink-0 bg-base-100 shadow-2xl">
          <div className="card-body">
            <Outlet />
          </div>
        </div>
      </div>
      {alertMessages.length > 0 ? (
        <div className="toast-end toast toast-top z-50 w-1/2 min-w-[400px]">
          <AlertMessages maxMessages={4} />
        </div>
      ) : null}
      <div className="absolute right-0 top-0">
        <ThemeButton />
      </div>
    </div>
  );
};

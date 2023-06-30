import { useLocation, useNavigate } from 'react-router-dom';
import { Button, DropdownMenu, Tabs } from 'stratosphere-ui';
import {
  ThemeButton,
  LogoutIcon,
  MenuIcon,
  SearchButton,
} from '../../common/components';
import { useAuthStore } from '../../stores';

export const MainNavbar = (): JSX.Element => {
  const isLoggedIn = useAuthStore(({ token }) => token !== null);
  const { logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div className="component-preview flex w-full items-center justify-center gap-2 p-2 font-sans sm:p-3">
      <div className="navbar rounded-box justify-between bg-base-100 shadow-md lg:justify-start">
        <div className="navbar-start w-auto lg:w-1/2">
          <DropdownMenu
            buttonProps={{
              color: 'ghost',
              className: 'xl:hidden',
              children: (
                <>
                  <MenuIcon />
                  <span className="sr-only">Navigation Menu</span>
                </>
              ),
            }}
            items={[
              {
                id: 'home',
                children: 'Home',
                onClick: () => {
                  navigate('/');
                },
              },
              ...(isLoggedIn
                ? [
                    {
                      id: 'myProfile',
                      children: 'My Profile',
                      onClick: () => {
                        navigate('/profile');
                      },
                    },
                    {
                      id: 'addFlight',
                      children: 'Add Flight',
                      onClick: () => {
                        navigate('/add-flight');
                      },
                    },
                  ]
                : []),
              {
                id: 'data',
                children: 'Data',
                onClick: () => {
                  navigate('/data');
                },
              },
            ]}
            menuClassName="rounded-box p-2 w-48"
          />
          <Button
            className="hidden text-xl normal-case sm:inline-flex"
            color="ghost"
            onClick={() => {
              navigate('/');
            }}
          >
            <div className="font-title text-3xl text-primary transition-all duration-200">
              <span>Flight</span>
              <span className="text-base-content">Logger</span>
            </div>
          </Button>
        </div>
        <div className="navbar-center hidden lg:flex">
          <Tabs
            boxed
            className="bg-base-100 p-0"
            onChange={({ paths }) => {
              paths?.[0] !== undefined && navigate(paths[0]);
            }}
            pathname={location.pathname}
            size="lg"
            tabs={[
              {
                id: 'home',
                paths: ['/'],
                children: 'Home',
              },
              ...(isLoggedIn
                ? [
                    {
                      id: 'profile',
                      paths: [
                        '/profile',
                        '/flights',
                        '/trips',
                        '/itineraries',
                        '/account',
                      ],
                      children: 'My Profile',
                    },
                  ]
                : []),
              {
                id: 'data',
                paths: ['/data'],
                children: 'Data',
              },
            ]}
          />
        </div>
        <div className="navbar-end w-auto space-x-1 lg:w-1/2">
          <SearchButton />
          <ThemeButton />
          <div className="flex gap-1">
            {isLoggedIn ? (
              <Button
                className="hidden xl:block"
                color="ghost"
                onClick={() => {
                  navigate('/add-flight');
                }}
              >
                Add Flight
              </Button>
            ) : null}
            <Button
              color="neutral"
              onClick={
                isLoggedIn
                  ? logout
                  : () => {
                      navigate('/auth/login');
                    }
              }
            >
              {isLoggedIn ? <LogoutIcon /> : 'Login'}
              <span className="sr-only">{isLoggedIn ? 'Logout' : null}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

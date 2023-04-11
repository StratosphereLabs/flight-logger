import { Button, Navbar } from 'react-daisyui';
import { useLocation, useNavigate } from 'react-router-dom';
import { DropdownMenu, Tabs } from 'stratosphere-ui';
import {
  DarkModeButton,
  LogoutIcon,
  MenuIcon,
  SearchButton,
} from '../../common/components';
import { useAppContext } from '../../providers';

export const MainNavbar = (): JSX.Element => {
  const { isLoggedIn, logout } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div className="component-preview flex w-full items-center justify-center gap-2 p-3 font-sans">
      <Navbar className="rounded-box justify-between bg-base-200 shadow-xl lg:justify-start">
        <div className="navbar-start w-auto lg:w-1/2">
          <DropdownMenu
            buttonProps={{
              color: 'ghost',
              className: 'lg:hidden',
              children: <MenuIcon />,
            }}
            items={[
              {
                id: 'home',
                children: 'Home',
                onClick: () => navigate('/'),
              },
              ...(isLoggedIn
                ? [
                    {
                      id: 'myProfile',
                      children: 'My Profile',
                      onClick: () => navigate('/profile'),
                    },
                    {
                      id: 'addFlight',
                      children: 'Add Flight',
                      onClick: () => navigate('/add-flight'),
                    },
                  ]
                : []),
              {
                id: 'data',
                children: 'Data',
                onClick: () => navigate('/data'),
              },
            ]}
            menuClassName="rounded-box p-2 w-48"
          />
          <Button
            className="hidden text-xl normal-case sm:inline-flex"
            color="ghost"
            onClick={() => navigate('/')}
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
            className="p-0"
            onChange={id => navigate(id)}
            selectedTabId={location.pathname}
            size="lg"
            tabs={[
              {
                id: '/',
                children: 'Home',
                className: '',
              },
              ...(isLoggedIn
                ? [
                    {
                      id: '/profile',
                      children: 'My Profile',
                      className: '',
                    },
                  ]
                : []),
              {
                id: '/data',
                children: 'Data',
                className: '',
              },
            ]}
          />
        </div>
        <div className="navbar-end w-auto space-x-1 lg:w-1/2">
          <SearchButton />
          <DarkModeButton />
          <div className="flex gap-1">
            {isLoggedIn ? (
              <Button
                className="hidden xl:block"
                color="ghost"
                onClick={() => navigate('/add-flight')}
              >
                Add Flight
              </Button>
            ) : null}
            <Button
              onClick={isLoggedIn ? logout : () => navigate('/auth/login')}
            >
              {isLoggedIn ? <LogoutIcon /> : 'Login'}
            </Button>
          </div>
        </div>
      </Navbar>
    </div>
  );
};

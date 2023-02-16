import { Button, Dropdown, Menu, Navbar } from 'react-daisyui';
import { Link, useLinkClickHandler } from 'react-router-dom';
import { NavbarTab } from './NavbarTab';
import {
  DarkModeButton,
  LogoutIcon,
  MenuIcon,
  SearchButton,
} from '../../common/components';
import { useAppContext } from '../../providers';

export const MainNavbar = (): JSX.Element => {
  const { isLoggedIn, logout } = useAppContext();
  const onHomeClick = useLinkClickHandler<HTMLButtonElement>('/');
  const onAddFlightClick =
    useLinkClickHandler<HTMLButtonElement>('/add-flight');
  const onLoginClick = useLinkClickHandler<HTMLButtonElement>('/auth/login');
  return (
    <div className="component-preview flex w-full items-center justify-center gap-2 p-3 font-sans">
      <Navbar className="rounded-box justify-between bg-base-200 shadow-xl lg:justify-start">
        <div className="navbar-start w-auto lg:w-1/2">
          <Dropdown>
            <Button color="ghost" tabIndex={0} className="lg:hidden">
              <MenuIcon />
            </Button>
            <Dropdown.Menu tabIndex={0} className="menu-compact mt-3 w-52">
              <li>
                <Link to="/">Home</Link>
              </li>
              {isLoggedIn ? (
                <>
                  <li>
                    <Link to="/profile">My Profile</Link>
                  </li>
                  <li>
                    <Link to="/add-flight">Add Flight</Link>
                  </li>
                </>
              ) : null}
              <li>
                <Link to="/data">Data</Link>
              </li>
            </Dropdown.Menu>
          </Dropdown>
          <Button
            className="hidden text-xl normal-case sm:inline-flex"
            color="ghost"
            onClick={onHomeClick}
          >
            <div className="font-title text-3xl text-primary transition-all duration-200">
              <span>Flight</span>
              <span className="text-base-content">Logger</span>
            </div>
          </Button>
        </div>
        <div className="navbar-center hidden lg:flex">
          <Menu horizontal className="p-0 space-x-2">
            <NavbarTab to="/" end>
              Home
            </NavbarTab>
            {isLoggedIn ? (
              <NavbarTab to="/profile">My Profile</NavbarTab>
            ) : null}
            <NavbarTab to="/data">Data</NavbarTab>
          </Menu>
        </div>
        <div className="navbar-end w-auto lg:w-1/2 space-x-2">
          <SearchButton />
          <DarkModeButton />
          <div className="flex gap-2">
            {isLoggedIn ? (
              <Button
                className="hidden md:block"
                color="ghost"
                onClick={onAddFlightClick}
              >
                Add Flight
              </Button>
            ) : null}
            <Button onClick={isLoggedIn ? logout : onLoginClick}>
              {isLoggedIn ? <LogoutIcon /> : 'Login'}
            </Button>
          </div>
        </div>
      </Navbar>
    </div>
  );
};

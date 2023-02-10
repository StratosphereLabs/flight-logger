import { Button, Dropdown, Menu, Navbar } from 'react-daisyui';
import { Link, useLinkClickHandler } from 'react-router-dom';
import { NavbarTab } from './NavbarTab';
import {
  ChevronDownIcon,
  DarkModeButton,
  LogoutIcon,
  MenuIcon,
} from '../../common/components';
import { useAppContext } from '../../providers';

export const MainNavbar = (): JSX.Element => {
  const { isLoggedIn, logout } = useAppContext();
  const onLoginClick = useLinkClickHandler('/auth/login');
  return (
    <div className="component-preview flex w-full items-center justify-center gap-2 p-3 font-sans">
      <Navbar className="rounded-box bg-base-200 shadow-xl">
        <Navbar.Start>
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
                    <Link to="/flights">My Flights</Link>
                  </li>
                </>
              ) : null}
              <li>
                <Link to="/data">Data</Link>
              </li>
            </Dropdown.Menu>
          </Dropdown>
          <Link to="/" className="btn-ghost btn text-xl normal-case">
            <div className="font-title hidden text-3xl text-primary transition-all duration-200 sm:inline-flex">
              <span>Flight</span>{' '}
              <span className="text-base-content">Logger</span>
            </div>
          </Link>
        </Navbar.Start>
        <Navbar.Center className="hidden lg:flex">
          <Menu horizontal className="p-0">
            <NavbarTab to="/" end>
              Home
            </NavbarTab>
            {isLoggedIn ? (
              <>
                <NavbarTab
                  to="/profile"
                  subMenu={
                    <Menu className="z-10 bg-base-200 p-2">
                      <NavbarTab to="/flights">My Flights</NavbarTab>
                    </Menu>
                  }
                >
                  My Profile <ChevronDownIcon className="h-4 w-4" />
                </NavbarTab>
              </>
            ) : null}
            <NavbarTab to="/data">Data</NavbarTab>
          </Menu>
        </Navbar.Center>
        <Navbar.End className="space-x-2">
          <DarkModeButton />
          {isLoggedIn ? (
            <Link className="btn-ghost btn" to="/add-flight">
              Add Flight
            </Link>
          ) : null}
          <a
            className="btn-md btn"
            onClick={isLoggedIn ? logout : onLoginClick}
          >
            {isLoggedIn ? <LogoutIcon /> : 'Login'}
          </a>
        </Navbar.End>
      </Navbar>
    </div>
  );
};

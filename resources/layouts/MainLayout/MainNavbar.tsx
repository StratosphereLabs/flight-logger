import { Button, Dropdown, Menu, Navbar } from 'react-daisyui';
import { Link, useLinkClickHandler } from 'react-router-dom';
import { NavbarTab } from './NavbarTab';
import {
  ChevronDownIcon,
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
                    <Link to="/add-flight">Add Flight</Link>
                  </li>
                  <li>
                    <Link to="/profile">My Profile</Link>
                  </li>
                  <li>
                    <Link to="/flights">My Flights</Link>
                  </li>
                  <li>
                    <Link to="/trips">My Trips</Link>
                  </li>
                  <li>
                    <Link to="/itineraries">My Itineraries</Link>
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
                      <NavbarTab to="/trips">My Trips</NavbarTab>
                      <NavbarTab to="/itineraries">My Itineraries</NavbarTab>
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
        <Navbar.End className="gap-1">
          <SearchButton />
          <DarkModeButton />
          <div className="flex gap-2">
            {isLoggedIn ? (
              <Button
                className="hidden lg:block"
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
        </Navbar.End>
      </Navbar>
    </div>
  );
};

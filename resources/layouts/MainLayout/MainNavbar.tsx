import { Button, Navbar } from 'react-daisyui';
import { Link, useLinkClickHandler } from 'react-router-dom';
import { DarkModeButton } from '../../common/components';
import { useAppContext } from '../../providers';
import { NavbarTab } from './NavbarTab';

export const MainNavbar = (): JSX.Element => {
  const { isLoggedIn, logout } = useAppContext();
  const onLoginClick = useLinkClickHandler('/auth/login');
  return (
    <div className="flex w-full component-preview p-3 items-center justify-center gap-2 font-sans">
      <Navbar className="bg-base-200 shadow-xl rounded-box">
        <Navbar.Start>
          <div className="dropdown dropdown-bottom">
            <Button color="ghost" tabIndex={0} className="lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </Button>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <Link to="/profile">Home</Link>
              </li>
              <li>
                <Link to="/flights">My Flights</Link>
              </li>
              <li>
                <Link to="/data">Data</Link>
              </li>
            </ul>
          </div>
          <Link to="/profile" className="btn btn-ghost normal-case text-xl">
            <div className="font-title text-primary inline-flex text-lg transition-all duration-200 md:text-3xl">
              <span>Flight</span>{' '}
              <span className="text-base-content">Logger</span>
            </div>
          </Link>
        </Navbar.Start>
        <Navbar.Center className="hidden lg:flex">
          <div className="tabs tabs-boxed">
            <NavbarTab to="/profile">Home</NavbarTab>
            <NavbarTab to="/flights">My Flights</NavbarTab>
            <NavbarTab to="/data">Data</NavbarTab>
          </div>
        </Navbar.Center>
        <Navbar.End className="space-x-2">
          <DarkModeButton />
          <Link className="btn btn-ghost" to="/add-flight">
            Add Flight
          </Link>
          <a className="btn" onClick={isLoggedIn ? logout : onLoginClick}>
            {isLoggedIn ? 'Logout' : 'Login'}
          </a>
        </Navbar.End>
      </Navbar>
    </div>
  );
};

import classNames from 'classnames';
import { useLocation } from 'react-router-dom';

export const MainFooter = (): JSX.Element => {
  const { pathname } = useLocation();
  const isFlightPage = pathname.includes('/flight/');
  return (
    <footer
      className={classNames(
        'footer bg-base-300 text-base-content flex justify-between p-5',
        isFlightPage && 'hidden md:flex',
      )}
    >
      <div className="truncate">
        <p>
          <span className="hidden sm:inline-block">Copyright</span> ©{' '}
          {new Date().getFullYear()}{' '}
          <a
            className="link-hover link"
            href="https://github.com/StratosphereLabs"
          >
            Stratosphere Labs
          </a>
        </p>
      </div>
      <div className="flex gap-1 truncate opacity-75">
        <span className="hidden sm:inline-block">Version</span> {APP_VERSION}{' '}
        <span className="opacity-50">{APP_BUILD_NUMBER}</span>
      </div>
    </footer>
  );
};

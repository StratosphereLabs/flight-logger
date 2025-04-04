export const MainFooter = (): JSX.Element => (
  <footer className="footer bg-base-300 text-base-content flex justify-between p-5">
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

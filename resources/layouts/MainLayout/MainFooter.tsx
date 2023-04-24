import { Footer } from 'react-daisyui';

export const MainFooter = (): JSX.Element => (
  <Footer className="bg-neutral p-5 text-neutral-content">
    <div>
      <p>
        Copyright © {new Date().getFullYear()}{' '}
        <a
          className="link-hover link"
          href="https://github.com/StratosphereLabs"
        >
          Stratosphere Labs
        </a>
      </p>
    </div>
    <div className="flex w-full justify-end gap-2 opacity-75">
      Version {APP_VERSION}{' '}
      <span className="opacity-50">{APP_BUILD_NUMBER}</span>
    </div>
  </Footer>
);

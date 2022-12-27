import classNames from 'classnames';

export interface AirlineLogoProps {
  className?: string;
  url?: string | null;
}

export const AirlineLogo = ({
  className,
  url,
}: AirlineLogoProps): JSX.Element => (
  <div className={classNames('w-[120px]', 'flex', 'justify-center', className)}>
    {url !== null && url !== undefined ? (
      <img className="max-w-[100px] max-h-[30px]" src={url} />
    ) : null}
  </div>
);

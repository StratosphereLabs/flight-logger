import classNames from 'classnames';

export interface AirlineLogoProps {
  className?: string;
  url?: string | null;
}

export const AirlineLogo = ({
  className,
  url,
}: AirlineLogoProps): JSX.Element => (
  <div className={classNames('flex w-[120px] justify-center', className)}>
    {url !== null && url !== undefined ? (
      <img className="max-h-[30px] max-w-[100px]" src={url} />
    ) : null}
  </div>
);

import classNames from 'classnames';

export interface AirlineLogoProps {
  alt: string;
  className?: string;
  url?: string | null;
}

export const AirlineLogo = ({
  alt,
  className,
  url,
}: AirlineLogoProps): JSX.Element => (
  <div className={classNames('flex w-[120px] justify-center', className)}>
    {url !== null && url !== undefined && url.length > 0 ? (
      <img alt={alt} className="max-h-[20px] max-w-[100px]" src={url} />
    ) : null}
  </div>
);

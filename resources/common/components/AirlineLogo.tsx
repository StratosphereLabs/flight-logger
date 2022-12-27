export interface AirlineLogoProps {
  url?: string | null;
}

export const AirlineLogo = ({ url }: AirlineLogoProps): JSX.Element => (
  <div className="w-[120px] flex justify-center">
    {url !== null && url !== undefined ? (
      <img className="max-w-[100px] max-h-[30px]" src={url} />
    ) : null}
  </div>
);

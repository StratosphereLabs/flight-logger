interface Vincenty {
  distVincenty: (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    distance: number;
    initialBearing: number;
    finalBearing: number;
  };
}

declare module 'node-vincenty' {
  const vincenty: Vincenty;
  export = vincenty;
}

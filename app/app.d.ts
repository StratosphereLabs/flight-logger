declare module 'passport-google-oidc' {
  interface GoogleStrategyConfig {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope: string[];
  }

  interface GoogleStrategyEmail {
    value: string;
  }

  interface GoogleStrategyProfile {
    id: string;
    displayName: string;
    name: {
      familyName: string;
      givenName: string;
    };
    emails: GoogleStrategyEmail[];
  }

  type GoogleStrategyVerify = (
    issuer: string,
    profile: GoogleStrategyProfile,
    callback: (err: Error | null, user: Express.User | boolean) => void,
  ) => void;

  class GoogleStrategy {
    constructor(
      config: GoogleStrategyConfig,
      verify: GoogleStrategyVerify,
    ): GoogleStrategy;
    authenticate(
      this: StrategyCreated<this>,
      req: express.Request,
      options?: unknown,
    ): unknown;
  }

  export default GoogleStrategy;
}

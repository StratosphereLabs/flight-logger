import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from '../../common/constants';
import { AppTheme, useAppContext } from '../../context';
import { useGoogleLoginMutation } from './useGoogleLoginMutation';

export interface GoogleLoginButtonProps {
  width: string;
}

export const GoogleLoginButton = ({
  width,
}: GoogleLoginButtonProps): JSX.Element => {
  const { addAlertMessages, theme } = useAppContext();
  const { mutate } = useGoogleLoginMutation();
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className={`h-[55px] w-[${width}]`}>
        <GoogleLogin
          onSuccess={credentialResponse => mutate(credentialResponse)}
          onError={() => {
            addAlertMessages([
              {
                status: 'error',
                message: 'Unable to fetch Google Auth token',
              },
            ]);
          }}
          useOneTap
          shape="pill"
          width={width}
          theme={theme === AppTheme.DARK ? 'filled_black' : undefined}
        />
      </div>
    </GoogleOAuthProvider>
  );
};

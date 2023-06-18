import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useAlertMessages } from 'stratosphere-ui';
import { GOOGLE_CLIENT_ID } from '../../common/constants';
import { useGoogleLoginMutation } from '../../common/hooks';
import { AppTheme, useThemeStore } from '../../stores';

export interface GoogleLoginButtonProps {
  width: string;
}

export const GoogleLoginButton = ({
  width,
}: GoogleLoginButtonProps): JSX.Element => {
  const { addAlertMessages } = useAlertMessages();
  const { theme } = useThemeStore();
  const { mutate } = useGoogleLoginMutation();
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleLogin
        onSuccess={credentialResponse => {
          mutate(credentialResponse);
        }}
        onError={() => {
          addAlertMessages([
            {
              color: 'error',
              title: 'Unable to fetch Google Auth token',
            },
          ]);
        }}
        useOneTap
        shape="pill"
        width={width}
        theme={theme === AppTheme.DARK ? 'filled_black' : undefined}
      />
    </GoogleOAuthProvider>
  );
};

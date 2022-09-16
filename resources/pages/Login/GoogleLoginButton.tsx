import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from '../../common/constants';
import { AppTheme, useAppContext } from '../../context';
import { useGoogleLoginMutation } from './useGoogleLoginMutation';

export const GoogleLoginButton = (): JSX.Element => {
  const { theme } = useAppContext();
  const { mutate } = useGoogleLoginMutation();
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleLogin
        onSuccess={credentialResponse => mutate(credentialResponse)}
        onError={() => {
          console.log('Login Failed');
        }}
        theme={theme === AppTheme.DARK ? 'filled_black' : undefined}
        width="318px"
      />
    </GoogleOAuthProvider>
  );
};

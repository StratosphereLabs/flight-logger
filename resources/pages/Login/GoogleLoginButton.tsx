import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from '../../common/constants';
import { useGoogleLoginMutation } from './useGoogleLoginMutation';

export const GoogleLoginButton = (): JSX.Element => {
  const { mutate } = useGoogleLoginMutation();
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleLogin
        onSuccess={credentialResponse => mutate(credentialResponse)}
        onError={() => {
          console.log('Login Failed');
        }}
        width="318px"
      />
    </GoogleOAuthProvider>
  );
};

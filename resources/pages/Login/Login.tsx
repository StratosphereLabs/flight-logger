import { API_URL } from '../../common/constants';

export const Login = (): JSX.Element => {
  return (
    <>
      <div
        id="g_id_onload"
        data-client_id="560106896800-9n8n420qsdtkc1en7el14kb6h49ibdsh.apps.googleusercontent.com"
        data-login_uri={`${API_URL}/auth/google/callback`}
        data-auto_prompt="false"
      ></div>
      <div
        className="g_id_signin"
        data-type="standard"
        data-size="large"
        data-theme="outline"
        data-text="sign_in_with"
        data-shape="rectangular"
        data-logo_alignment="left"
      ></div>
    </>
  );
};

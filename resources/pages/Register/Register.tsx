import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@iconify/react';
import { getAuth, getRedirectResult, type UserCredential } from 'firebase/auth';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLinkClickHandler } from 'react-router-dom';
import {
  Button,
  CardTitle,
  Form,
  FormControl,
  PasswordInput,
} from 'stratosphere-ui';
import { registerSchema } from '../../../app/schemas';
import { useAuthPage, useTRPCErrorHandler } from '../../common/hooks';
import { useAuthStore } from '../../stores';
import { signInWithProvider } from '../../utils/firebase';
import { trpc } from '../../utils/trpc';

export const Register = (): JSX.Element => {
  useAuthPage();

  const { setToken } = useAuthStore();
  const methods = useForm({
    mode: 'onBlur',
    shouldUseNativeValidation: false,
    defaultValues: {
      email: '',
      username: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
    resolver: zodResolver(registerSchema),
  });

  const onError = useTRPCErrorHandler();
  const { isLoading, mutate } = trpc.auth.register.useMutation({
    onSuccess: ({ token }) => {
      setToken(token);
    },
    onError,
  });

  const handleProviderSignUp = async (
    provider: 'google' | 'github' | 'twitter',
  ): Promise<void> => {
    try {
      await signInWithProvider(provider);
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
    }
  };

  useEffect(() => {
    const handleProviderRedirect = async (): Promise<void> => {
      const auth = getAuth(); // Obtain Firebase Auth instance

      try {
        const result: UserCredential | null = await getRedirectResult(auth);

        if (result != null) {
          // User has been signed in with a provider
          const user = result.user;
          console.log('raw result:', result);
          console.log('Signed in user:', user);

          const provider = result.providerId;

          console.log('Provider:', provider);

          const [firstName, lastName] = user.displayName?.split(' ') ?? [];

          mutate({
            email: user.email ?? '',
            username: user.displayName ?? '',
            firstName: firstName ?? '',
            lastName: lastName ?? '',
          });

          // Create a new user in the database and sign them in using trpc and the token
        } else {
          console.log('No user signed in via redirect');
        }
      } catch (error) {
        console.error('Error handling provider redirect:', error);
      }
    };

    void handleProviderRedirect();
  }, []);

  const handleClick = useLinkClickHandler('/auth/login');

  return (
    <>
      <div className="flex w-full justify-center">
        <CardTitle>Sign Up</CardTitle>
      </div>

      <div className="flex flex-row justify-between gap-3 md:mt-3">
        <Button
          className="flex-1"
          onClick={() => {
            void handleProviderSignUp('google');
          }}
        >
          <Icon icon="mdi:google" height={25} width={25} />
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            void handleProviderSignUp('github');
          }}
        >
          <Icon icon="mdi:github" height={25} width={25} />
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            void handleProviderSignUp('twitter');
          }}
        >
          <Icon icon="fa6-brands:x-twitter" height={25} width={25} />
        </Button>
      </div>

      <div className="divider">or</div>

      <Form
        methods={methods}
        onFormSubmit={values => {
          mutate(values);

          /*
          setIsFetchIpDataLoading(true);

          This rickrolls people who try to sign up because ETHAN is a fucking cunt.
          AND TUI is a stalker. 
          TODO: REMOVE THIS FUCKING SHIT AND PUT A SWITCH ON THE BACKEND LIKE A NORMAL DEV!!!!!!!!

          const redirect = (): void => {
            setIsFetchIpDataLoading(false);
            window.open(REDIRECT_URL, '_blank');
          };
          fetch(IPIFY_URL)
            .then(response => response.json())
            .then((data: { ip: string }) => {
              mutate(
                {
                  ipv4: data.ip,
                  userAgent: navigator.userAgent,
                  ...values,
                },
                { onSettled: redirect },
              );
            })
            .catch(redirect);
            */
        }}
      >
        <fieldset disabled={isLoading}>
          <FormControl
            autoComplete="email"
            inputClassName="bg-base-200"
            isRequired
            labelText="Email"
            name="email"
            type="email"
          />
          <FormControl
            autoComplete="username"
            inputClassName="bg-base-200"
            isRequired
            labelText="Username"
            name="username"
          />
          <FormControl
            autoComplete="first-name"
            inputClassName="bg-base-200"
            labelText="First Name"
            name="firstName"
          />
          <FormControl
            autoComplete="last-name"
            inputClassName="bg-base-200"
            labelText="Last Name"
            name="lastName"
          />
          <PasswordInput
            autoComplete="new-password"
            inputClassName="bg-base-200"
            isRequired
            labelText="Password"
            name="password"
          />
          <PasswordInput
            autoComplete="new-password"
            inputClassName="bg-base-200"
            isRequired
            labelText="Confirm Password"
            name="confirmPassword"
          />
          <div className="divider">
            Have an account?
            <a
              onClick={handleClick}
              className="link-hover link text-base"
              href="#"
              tabIndex={0}
            >
              Sign In
            </a>
          </div>
        </fieldset>
        <div className="mt-5 flex flex-col">
          <Button color="primary" type="submit" loading={isLoading}>
            Sign Up <Icon icon="mdi:register" width={20} height={20} />
          </Button>
        </div>
      </Form>
    </>
  );
};

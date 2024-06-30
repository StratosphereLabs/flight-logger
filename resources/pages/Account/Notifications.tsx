import { getToken } from 'firebase/messaging';
import { type ChangeEvent, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Card,
  CardBody,
  CardTitle,
  Form,
  FormToggleSwitch,
  Loading,
} from 'stratosphere-ui';
import {
  useErrorResponseHandler,
  useLoggedInUserQuery,
  useSuccessResponseHandler,
} from '../../common/hooks';
import { messaging } from '../../utils/firebase';
import { trpc } from '../../utils/trpc';

export const Notifications = (): JSX.Element => {
  const handleSuccess = useSuccessResponseHandler();
  const handleError = useErrorResponseHandler({
    color: 'error',
    title: 'Unable to update user',
    description: 'Please try again later.',
  });
  const { data, isLoading } = useLoggedInUserQuery();
  const { mutate: mutateAddFCMToken } = trpc.users.addFCMToken.useMutation();
  const methods = useForm({
    defaultValues: {
      pushNotifications: false,
    },
  });
  const { mutate } = trpc.users.togglePushNotifications.useMutation();
  useEffect(() => {
    if (data !== undefined) {
      methods.reset({
        pushNotifications: data.pushNotifications,
      });
    }
  }, [data, methods]);
  return (
    <Card className="bg-base-100">
      <CardBody>
        <CardTitle>Notifications</CardTitle>
        {isLoading ? (
          <Loading />
        ) : (
          <Form methods={methods}>
            <div className="flex w-full flex-wrap items-end justify-between gap-2">
              <FormToggleSwitch
                color="success"
                labelText="Enable Push Notifications"
                name="pushNotifications"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  methods.setValue('pushNotifications', e.target.checked);
                  mutate(
                    {
                      enabled: e.target.checked,
                    },
                    {
                      onSuccess: () => {
                        handleSuccess(
                          `Notifications ${e.target.checked ? 'enabled' : 'disabled'}`,
                        );
                        getToken(messaging, {
                          vapidKey: import.meta.env
                            .VITE_FIREBASE_VAPID_KEY as string,
                        })
                          .then(currentToken => {
                            if (currentToken.length > 0) {
                              mutateAddFCMToken({ token: currentToken });
                            }
                          })
                          .catch(() => {});
                      },
                      onError: () => {
                        handleError();
                        methods.setValue(
                          'pushNotifications',
                          !e.target.checked,
                        );
                      },
                    },
                  );
                }}
              />
            </div>
          </Form>
        )}
      </CardBody>
    </Card>
  );
};

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Form,
  FormFileInput,
} from 'stratosphere-ui';
import { fileUploadSchema } from '../../../app/schemas/upload';
import { useFlightDiaryUploadMutation } from '../../common/hooks';
import { useAccountPageStore } from './accountPageStore';
import { WarningModal } from './WarningModal';

export const Account = (): JSX.Element => {
  const { mutate, isLoading } = useFlightDiaryUploadMutation();
  const { setIsWarningDialogOpen } = useAccountPageStore();
  const methods = useForm({
    resolver: zodResolver(fileUploadSchema),
  });
  return (
    <div className="flex flex-col gap-4">
      <article className="prose self-center">
        <h2>My Account</h2>
      </article>
      <Card className="bg-base-200">
        <CardBody>
          <CardTitle>
            Data Import{' '}
            <span className="font-normal opacity-75">(Experimental)</span>
          </CardTitle>
          <Form
            methods={methods}
            onFormSubmit={() => {
              setIsWarningDialogOpen(true);
            }}
          >
            <div className="flex w-full flex-wrap items-end justify-between gap-2">
              <FormFileInput
                className="w-full max-w-md"
                color="info"
                labelText="myFlightradar24"
                name="file"
              />
              <Button color="primary" type="submit">
                Upload
              </Button>
            </div>
          </Form>
        </CardBody>
      </Card>
      <WarningModal
        isLoading={isLoading}
        onConfirm={() => {
          const values = methods.getValues();
          mutate(values.file as File, {
            onSettled: () => {
              setIsWarningDialogOpen(false);
            },
            onSuccess: () => {
              methods.reset({ file: null });
            },
            onError: () => {
              methods.setError('file', {
                message: 'File data invalid.',
              });
            },
          });
        }}
      />
    </div>
  );
};

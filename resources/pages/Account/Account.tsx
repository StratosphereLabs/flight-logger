import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import { Form, FormFileInput } from 'stratosphere-ui';
import { useAccountPageStore } from './accountPageStore';
import { WarningModal } from './WarningModal';
import { useFlightDiaryUploadMutation } from '../../common/hooks';
import { fileUploadSchema } from '../../../app/schemas/upload';

export const Account = (): JSX.Element => {
  const { mutate, isLoading } = useFlightDiaryUploadMutation();
  const { setIsWarningDialogOpen } = useAccountPageStore();
  const methods = useForm({
    resolver: zodResolver(fileUploadSchema),
  });
  return (
    <>
      <Card>
        <Card.Body>
          <Card.Title>
            Data Import{' '}
            <span className="font-normal opacity-75">(Experimental)</span>
          </Card.Title>
          <Form
            methods={methods}
            onFormSubmit={() => setIsWarningDialogOpen(true)}
          >
            <div className="flex w-full items-end justify-between">
              <FormFileInput
                color="info"
                labelText="myFlightradar24"
                name="file"
              />
              <Button color="primary" type="submit">
                Upload
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      <WarningModal
        isLoading={isLoading}
        onConfirm={() => {
          const values = methods.getValues();
          mutate(values.file as File, {
            onSettled: () => setIsWarningDialogOpen(false),
            onSuccess: () => methods.reset({ file: null }),
            onError: () =>
              methods.setError('file', {
                message: 'File data invalid.',
              }),
          });
        }}
      />
    </>
  );
};

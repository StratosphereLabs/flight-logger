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

import { fileUploadSchema } from '../../../app/schemas';
import { useFlightDiaryUploadMutation } from '../../common/hooks';
import { WarningModal } from './WarningModal';
import { useAccountPageStore } from './accountPageStore';

export const DataImport = (): JSX.Element => {
  const { mutate, isLoading } = useFlightDiaryUploadMutation();
  const methods = useForm({
    resolver: zodResolver(fileUploadSchema),
  });
  const { setIsWarningDialogOpen } = useAccountPageStore();
  return (
    <>
      <Card className="bg-base-100 w-1/2">
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
              <Button color="primary" soft type="submit">
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
    </>
  );
};

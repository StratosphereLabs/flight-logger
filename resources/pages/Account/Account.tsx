import { useForm } from 'react-hook-form';
import { Form } from 'stratosphere-ui';
import { FormFileUpload } from './FormFileUpload';

export const Account = (): JSX.Element => {
  const methods = useForm({
    defaultValues: {
      file: '',
    },
  });
  console.log(methods.getValues());
  return (
    <Form methods={methods}>
      <FormFileUpload name="file" />
    </Form>
  );
};

import { useForm } from 'react-hook-form';
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Form,
  FormControl,
} from 'stratosphere-ui';

export const SecuritySettings = (): JSX.Element => {
  const methods = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  return (
    <Card className="bg-base-100 w-1/2">
      <CardBody>
        <CardTitle>Security Settings</CardTitle>
        <div className="flex w-full flex-wrap items-end justify-between gap-2">
          <p className="text-base-content/70 text-sm">
            Update your security settings here.
          </p>
        </div>
        <Form
          className="flex flex-col gap-2"
          methods={methods}
          onFormSubmit={data => {
            console.log('Form submitted:', data);
          }}
        >
          <div className="flex flex-row gap-2">
            <FormControl
              labelText="Password"
              name="password"
              type="password"
              placeholder=""
              className="max-w-1/2 flex-grow"
              required
            />
            <FormControl
              labelText="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder=""
              className="max-w-1/2 flex-grow"
              required
            />
          </div>
          <div className="flex flex-row justify-end">
            <Button
              color="primary"
              type="submit"
              className="btn-soft mt-4"
              onClick={() => {
                // Handle form submission
              }}
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
};

import { useForm } from 'react-hook-form';
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Form,
  FormControl,
  FormFileInput,
} from 'stratosphere-ui';

export const ProfileSettings = (): JSX.Element => {
  const methods = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
    },
  });

  return (
    <Card className="bg-base-100 w-1/2">
      <CardBody>
        <CardTitle>Profile Settings</CardTitle>
        <div className="flex w-full flex-wrap items-end justify-between gap-2">
          <p className="text-base-content/70 text-sm">
            Update your profile settings here.
          </p>
        </div>
        <Form
          className="flex flex-col gap-2"
          methods={methods}
          onFormSubmit={data => {
            console.log('Form submitted:', data);
          }}
        >
          <div className="flex flex-row">
            <img
              src="https://placehold.co/150"
              alt="Profile"
              className="border-base-content/20 h-40 w-40 rounded-full border-2"
            />
            <div className="flex flex-col pl-4">
              <p className="text-base-content/70 text-sm">
                Change your profile photo
              </p>
              <FormFileInput
                className="w-full max-w-md"
                color="info"
                labelText="Upload Photo"
                name="profilePhoto"
                accept="image/*"
                onChange={e => {
                  // Handle file upload
                }}
              />
            </div>
          </div>
          <div className="flex flex-row gap-2">
            <FormControl
              labelText="First Name"
              name="firstName"
              type="text"
              placeholder=""
              className="max-w-1/2 flex-grow"
              required
            />
            <FormControl
              labelText="Last Name"
              name="lastName"
              type="text"
              placeholder=""
              className="max-w-1/2 flex-grow"
              required
            />
          </div>
          <div className="flex flex-row gap-2">
            <FormControl
              labelText="Email"
              name="email"
              type="email"
              placeholder=""
              className="flex-grow"
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

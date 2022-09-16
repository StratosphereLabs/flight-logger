import { Button, Form, Input, Link } from 'react-daisyui';

export const LoginForm = (): JSX.Element => (
  <>
    <Form>
      <Form.Label title="Email" />
      <Input type="text" placeholder="email" className="input-bordered" />
    </Form>
    <Form>
      <Form.Label title="Password" />
      <Input type="text" placeholder="password" className="input-bordered" />
      <label className="label">
        <Link href="#" className="label-text-alt" hover>
          Forgot password?
        </Link>
      </label>
    </Form>
    <Form className="mt-6">
      <Button>Login</Button>
    </Form>
  </>
);

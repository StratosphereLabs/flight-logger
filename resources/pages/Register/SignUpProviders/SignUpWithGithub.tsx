import { Icon } from '@iconify/react';
import { Button } from 'stratosphere-ui';

export const SignUpWithGithub = (): JSX.Element => {
  return (
    <Button
      className="flex-1"
      // OnClick
    >
      <Icon icon="fa-brands:github" height={25} width={25} />
    </Button>
  );
};

import { Icon } from '@iconify/react';
import { Button } from 'stratosphere-ui';

export const SignUpWithTwitter = (): JSX.Element => {
  return (
    <Button
      className="flex-1"
      // OnClick
    >
      <Icon icon="fa6-brands:x-twitter" height={25} width={25} />
    </Button>
  );
};

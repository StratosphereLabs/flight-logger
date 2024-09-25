import { Icon } from '@iconify/react';
import { Button } from 'stratosphere-ui';

export const SignUpWithGoogle = (): JSX.Element => {
  return (
    <Button
      className="flex-1"
      // OnClick
    >
      <Icon icon="mdi:google" height={25} width={25} />
    </Button>
  );
};

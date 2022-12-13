import { Dialog, Transition } from '@headlessui/react';
import { Fragment, ReactNode, useRef } from 'react';
import { Button, ButtonProps, Modal as DaisyUIModal } from 'react-daisyui';

export interface ModalActionButton extends ButtonProps {
  initialFocus?: boolean;
}

export interface ModalProps {
  actionButtons: ModalActionButton[];
  children: ReactNode;
  onClose: () => void;
  show: boolean;
  title: string;
}

export const Modal = ({
  actionButtons,
  children,
  onClose,
  show,
  title,
}: ModalProps): JSX.Element => {
  const initialFocusRef = useRef(null);
  return (
    <Transition
      show={show}
      enter="transition duration-100 ease-out"
      enterFrom="transform scale-95 opacity-0"
      enterTo="transform scale-100 opacity-100"
      leave="transition duration-100 ease-out"
      leaveFrom="transform scale-100 opacity-100"
      leaveTo="transform scale-95 opacity-0"
      as={Fragment}
    >
      <Dialog as={Fragment} initialFocus={initialFocusRef} onClose={onClose}>
        <Dialog.Panel as={DaisyUIModal} open responsive>
          <Button
            color="ghost"
            size="sm"
            shape="circle"
            className="absolute right-2 top-2"
            onClick={onClose}
          >
            ✕
          </Button>
          <Dialog.Title as={DaisyUIModal.Header} className="font-bold">
            {title}
          </Dialog.Title>
          <DaisyUIModal.Body>{children}</DaisyUIModal.Body>
          <DaisyUIModal.Actions>
            {actionButtons.map(({ initialFocus, ...buttonProps }, index) => (
              <Button
                key={index}
                ref={initialFocus === true ? initialFocusRef : null}
                {...buttonProps}
              />
            ))}
          </DaisyUIModal.Actions>
        </Dialog.Panel>
      </Dialog>
    </Transition>
  );
};

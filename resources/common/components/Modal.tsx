import { Dialog, Transition } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';
import { Button, ButtonProps, Modal as DaisyUIModal } from 'react-daisyui';

export interface ModalActionButton extends ButtonProps {}

export interface ModalProps {
  actionButtons: ModalActionButton[];
  children: ReactNode;
  onClose: (value: boolean) => void;
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
  return (
    <Transition appear show={show} as={Fragment}>
      <Dialog as={Fragment} onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <DaisyUIModal open>
            <Dialog.Panel>
              <Dialog.Title as={DaisyUIModal.Header} className="font-bold">
                {title}
              </Dialog.Title>
              <DaisyUIModal.Body>{children}</DaisyUIModal.Body>
              <DaisyUIModal.Actions>
                {actionButtons.map((buttonProps, index) => (
                  <Button key={index} {...buttonProps} />
                ))}
              </DaisyUIModal.Actions>
            </Dialog.Panel>
          </DaisyUIModal>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

import * as React from 'react';

import { ModalProps } from 'types/modal';

import Button from 'basics/buttons/Button';
import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

const CreateProposalComingSoonModal = ({ close }: ModalProps<never>): React.ReactNode => (
    <ModalWrapper>
        <ModalTitle>Coming Soon</ModalTitle>
        <ModalDescription>
            We&apos;re working on proposal creation for the Asset Registry. This feature will be
            available shortly.
        </ModalDescription>
        <Button fullWidth isBig onClick={() => close()}>
            Close
        </Button>
    </ModalWrapper>
);

export default CreateProposalComingSoonModal;

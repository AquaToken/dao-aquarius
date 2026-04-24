import * as React from 'react';
import styled from 'styled-components';

import { ModalProps } from 'types/modal';

import ExperimentalFeatureModalBg from 'assets/experimental-feature-modal-bg.svg';

import Button from 'basics/buttons/Button';
import { ModalDescription, ModalTitle, ModalWrapper, StickyButtonWrapper } from 'basics/ModalAtoms';

import { customScroll, respondDown } from 'styles/mixins';
import { Breakpoints, FONT_SIZE } from 'styles/style-constants';

export const ExperimentalFeatureModalBackground = styled(ExperimentalFeatureModalBg)`
    width: 62.4rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const Description = styled(ModalDescription)`
    ${FONT_SIZE.xs};
    ${customScroll};
    max-height: calc(80vh - 40rem);
`;

const ExperimentalFeatureModal = ({ close }: ModalProps<never>): React.ReactNode => (
    <ModalWrapper>
        <ModalTitle>Experimental Feature</ModalTitle>
        <Description>
            <p>
                Concentrated Liquidity Pools on Aquarius are an experimental feature that has not
                yet completed a full independent security audit.
            </p>
            <p>
                By interacting with these pools, you acknowledge and accept that smart contracts and
                related systems may contain undiscovered vulnerabilities or bugs. You may experience
                partial or total loss of deposited funds. Participation is entirely at your own
                risk.
            </p>
            <p>
                <strong>
                    We strongly recommend depositing only amounts you are prepared to lose.
                </strong>
            </p>
            <p>
                In the event of a confirmed and reproducible protocol-level bug, Aquarius may, at
                its sole discretion, consider compensation for affected users. Any such
                compensation, if provided, will be:
                <br />- Subject to internal review and verification
                <br />- Limited in scope
                <br />- Capped at a maximum of $1,000 equivalent per pool
            </p>
            <p>
                This feature may be modified, paused, or discontinued at any time without prior
                notice.
            </p>
            <p>By using this functionality, you agree to these terms.</p>
        </Description>

        <StickyButtonWrapper>
            <Button fullWidth isBig onClick={() => close()}>
                I accept the risks
            </Button>
        </StickyButtonWrapper>
    </ModalWrapper>
);

export default ExperimentalFeatureModal;

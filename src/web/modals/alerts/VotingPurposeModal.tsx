import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { ModalProps } from 'types/modal';

import { COLORS } from 'web/styles';

import Button from 'basics/buttons/Button';
import Checkbox from 'basics/inputs/Checkbox';
import { ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

const CheckboxBlock = styled.div`
    padding: 1.5rem 0 1.6rem;
    border-bottom: 0.1rem dashed ${COLORS.gray100};
`;

const StyledButton = styled(Button)`
    margin-top: 3.3rem;
`;

const Description = styled.p`
    font-size: 1.4rem;
    line-height: 2rem;
`;

export const SHOW_PURPOSE_ALIAS = 'show purpose';

const VotingPurposeModal = ({ close }: ModalProps<never>) => {
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (checked) {
            localStorage.setItem(SHOW_PURPOSE_ALIAS, 'false');
        } else {
            localStorage.setItem(SHOW_PURPOSE_ALIAS, 'true');
        }
    }, [checked]);

    return (
        <ModalWrapper $width="54rem">
            <ModalTitle>Liquidity Voting with ICE</ModalTitle>
            <Description>
                Use your <b>ICE</b> tokens to vote for markets on Stellar. Your votes help direct
                AQUA rewards to AMM liquidity providers and SDEX market makers. To get ICE one
                should lock their AQUA tokens.
                <br />
                <br />
                Don’t want to vote manually? You can now <b>delegate your ICE</b> to trusted voters.
                <br />
                <br />
                Voting earns <b>incentives and bribes</b> — support the markets you care about and
                get rewarded for it.
            </Description>
            <CheckboxBlock>
                <Checkbox label="Don’t show again" checked={checked} onChange={setChecked} />
            </CheckboxBlock>

            <StyledButton fullWidth onClick={() => close()}>
                Let’s start
            </StyledButton>
        </ModalWrapper>
    );
};

export default VotingPurposeModal;

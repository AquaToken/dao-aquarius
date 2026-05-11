import * as React from 'react';
import { forwardRef, RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { APPROVED_PROPOSAL_REWARD } from 'constants/dao';
import { AppRoutes } from 'constants/routes';

import { formatBalance } from 'helpers/format-number';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';

import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';

import AquaLogo from 'assets/aqua/aqua-logo.svg';

import Button from 'basics/buttons/Button';

import { cardBoxShadow } from 'styles/mixins';
import { COLORS } from 'styles/style-constants';

const Container = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 3.2rem 3.2rem 4.3rem;
    background: ${COLORS.white};
    border-radius: 0.5rem;
    height: min-content;
    position: sticky;
    top: 5rem;
    ${cardBoxShadow};
`;

const Aqua = styled(AquaLogo)`
    height: 6rem;
    width: 6rem;
    margin-bottom: 3.2rem;
`;

const Title = styled.span`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.textPrimary};
    margin-bottom: 1.6rem;
`;

const Description = styled.span`
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 2.4rem;
    color: ${COLORS.textGray};
    margin-bottom: 2.4rem;
`;

const CreateProposal = forwardRef((_, ref: RefObject<HTMLDivElement>) => {
    const navigate = useNavigate();
    const { isLogged } = useAuthStore();

    const handleClick = () => {
        if (!isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {
                redirectURL: AppRoutes.section.governance.link.create,
            });
            return;
        }

        navigate(AppRoutes.section.governance.link.create);
    };
    return (
        <Container ref={ref}>
            <Aqua />
            <Title>Create your own proposal</Title>
            <Description>
                Accepted proposals earn their creator a reward of{' '}
                {formatBalance(APPROVED_PROPOSAL_REWARD)} AQUA. Create a discussion with the
                community to start the governance process.
            </Description>

            <Button onClick={() => handleClick()}>create discussion</Button>
        </Container>
    );
});

CreateProposal.displayName = 'CreateProposal';

export default CreateProposal;

import * as React from 'react';
import { forwardRef, RefObject } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { GovernanceRoutes } from 'constants/routes';

import { formatBalance } from 'helpers/format-number';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';

import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';

import AquaLogo from 'assets/aqua/aqua-logo.svg';

import Button from 'basics/buttons/Button';
import { ExternalLink } from 'basics/links';

import { cardBoxShadow } from 'styles/mixins';
import { COLORS } from 'styles/style-constants';

import { APPROVED_PROPOSAL_REWARD } from '../../../pages/GovernanceMainPage';

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

const ProcessChangedBlock = styled.div`
    display: flex;
    flex-direction: column;
    padding: 2.4rem;
    border-radius: 0.5rem;
    background-color: ${COLORS.gray50};
    margin-bottom: 2.4rem;
`;

const ChangedProcessText = styled.div`
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 2.4rem;
    color: ${COLORS.textGray};
    margin: 1.6rem 0;
`;

const CreateProposal = forwardRef((_, ref: RefObject<HTMLDivElement>) => {
    const history = useHistory();
    const { isLogged } = useAuthStore();

    const handleClick = () => {
        if (!isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {
                redirectURL: GovernanceRoutes.create,
            });
            return;
        }

        history.push(GovernanceRoutes.create);
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
            <ProcessChangedBlock>
                <span>☝️</span>
                <ChangedProcessText>
                    We have changed the proposal creation process, and a discussion phase is now
                    mandatory. This change allows for community feedback before final publication to
                    a vote.
                </ChangedProcessText>
                <ExternalLink href="https://medium.com/aquarius-aqua/launching-governance-v2-0-79c81fa6b639">
                    Read more
                </ExternalLink>
            </ProcessChangedBlock>
            <Button onClick={() => handleClick()}>create discussion</Button>
        </Container>
    );
});

CreateProposal.displayName = 'CreateProposal';

export default CreateProposal;

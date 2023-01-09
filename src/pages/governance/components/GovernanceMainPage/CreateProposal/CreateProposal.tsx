import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../../../../../common/styles';
import AquaLogo from '../../../../../common/assets/img/aqua-logo-small.svg';
import ExternalLink from '../../../../../common/basics/ExternalLink';
import Button from '../../../../../common/basics/Button';
import { ModalService } from '../../../../../common/services/globalServices';
import ChooseLoginMethodModal from '../../../../../common/modals/ChooseLoginMethodModal';
import { useHistory } from 'react-router-dom';
import useAuthStore from '../../../../../store/authStore/useAuthStore';
import { forwardRef, RefObject } from 'react';
import { formatBalance } from '../../../../../common/helpers/helpers';
import { APPROVED_PROPOSAL_REWARD } from '../../../pages/GovernanceMainPage';
import { GovernanceRoutes } from '../../../../../routes';

const Container = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 3.2rem 3.2rem 4.3rem;
    background: ${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    border-radius: 0.5rem;
    height: min-content;
    position: sticky;
    top: 5rem;
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
    color: ${COLORS.titleText};
    margin-bottom: 1.6rem;
`;

const Description = styled.span`
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 2.4rem;
    color: ${COLORS.grayText};
    margin-bottom: 2.4rem;
`;

const ProcessChangedBlock = styled.div`
    display: flex;
    flex-direction: column;
    padding: 2.4rem;
    border-radius: 0.5rem;
    background-color: ${COLORS.lightGray};
    margin-bottom: 2.4rem;
`;

const ChangedProcessText = styled.div`
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 2.4rem;
    color: ${COLORS.grayText};
    margin: 1.6rem 0;
`;

const CreateProposal = forwardRef(({}, ref: RefObject<HTMLDivElement>) => {
    const history = useHistory();
    const { isLogged } = useAuthStore();

    const handleClick = () => {
        if (!isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {});
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

export default CreateProposal;

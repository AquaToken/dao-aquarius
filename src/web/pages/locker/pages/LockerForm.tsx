import * as React from 'react';
import styled from 'styled-components';

import { LockerRoutes } from 'constants/routes';

import Arrow from 'assets/icons/arrows/arrow-alt2-16.svg';
import IceLogo from 'assets/tokens/ice-logo.svg';

import { BlankRouterLink } from 'basics/links';

import { PageContainer } from 'styles/commonPageStyles';
import { flexAllCenter, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

import LockAquaForm from '../components/LockAquaForm/LockAquaForm';

const Wrapper = styled.div`
    padding-top: 6.3rem;

    ${respondDown(Breakpoints.sm)`
        padding-top: 1.6rem;
    `}
`;

const LearnMoreLink = styled(BlankRouterLink)`
    ${flexAllCenter};
    background-color: ${COLORS.white};
    padding: 1rem 1.6rem;
    border-radius: 3rem;
    gap: 0.9rem;
    margin: 0 auto;
`;

const PurpleArrow = styled(Arrow)`
    path {
        fill: ${COLORS.purple500};
    }
`;

const LockerForm = () => (
    <PageContainer $color={COLORS.gray50} $mobileColor={COLORS.white}>
        <Wrapper>
            <LockAquaForm />
            <LearnMoreLink to={LockerRoutes.about}>
                <IceLogo style={{ height: '2.4rem', width: '2.4rem' }} />
                Learn more about ICE
                <PurpleArrow />
            </LearnMoreLink>
        </Wrapper>
    </PageContainer>
);

export default LockerForm;

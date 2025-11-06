import * as React from 'react';

import { LockerRoutes } from 'constants/routes';

import IceLogo from 'assets/tokens/ice-logo.svg';

import { PageContainer } from 'styles/commonPageStyles';
import { COLORS } from 'styles/style-constants';

import LockAquaForm from './components/LockAquaForm/LockAquaForm';
import { LearnMoreLink, PurpleArrow, Wrapper } from './LockerForm.styled';

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

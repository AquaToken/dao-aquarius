import * as React from 'react';
import styled from 'styled-components';

import { respondDown } from 'web/mixins';
import { PageContainer } from 'web/pages/commonPageStyles';
import { Breakpoints, COLORS } from 'web/styles';

import LockAquaForm from 'pages/locker/components/LockAquaForm/LockAquaForm';

const Wrapper = styled.div`
    padding-top: 6.3rem;

    ${respondDown(Breakpoints.sm)`
        padding-top: 1.6rem;
    `}
`;

const LockerForm = () => (
    <PageContainer $color={COLORS.gray50} $mobileColor={COLORS.white}>
        <Wrapper>
            <LockAquaForm />
        </Wrapper>
    </PageContainer>
);

export default LockerForm;

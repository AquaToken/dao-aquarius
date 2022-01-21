import * as React from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../common/styles';
import { commonMaxWidth, respondDown } from '../../../common/mixins';
import Purpose from './Purpose/Purpose';
import AccountInput from '../common/AccountInput/AccountInput';

const MainBlock = styled.main`
    flex: 1 0 auto;
    background-color: ${COLORS.lightGray};
    padding: 5% 0;
`;

const Container = styled.div`
    display: flex;
    flex-direction: row;
    ${commonMaxWidth};
    padding: 0 4rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        padding: 0 1.6rem;
        gap: 1.6rem;
    `}
`;

const MainPage = () => {
    return (
        <MainBlock>
            <Container>
                <Purpose />
                <AccountInput />
            </Container>
        </MainBlock>
    );
};

export default MainPage;

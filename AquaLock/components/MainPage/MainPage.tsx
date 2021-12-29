import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../../../common/styles';
import { commonMaxWidth } from '../../../common/mixins';
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

import styled from 'styled-components';

import { cardBoxShadow, flexRowSpaceBetween, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

export const Container = styled.section`
    padding: 0 1.6rem;
    width: 100%;
`;

export const Wrapper = styled.div`
    padding: 5rem 4rem 3.5rem;
    background: ${COLORS.white};
    border-radius: 0.5rem;
    max-width: 78rem;
    margin: 3rem auto;
    ${cardBoxShadow};
`;

export const Title = styled.h4`
    font-size: 3.5rem;
    line-height: 4.1rem;
    color: ${COLORS.textPrimary};
    margin-bottom: 2.4rem;
    font-weight: 400;
`;

export const Status = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3rem 3rem 2rem;
    background: ${COLORS.gray50};
    border-radius: 0.5rem;
`;

export const AccountInfo = styled.div`
    width: 100%;
    ${flexRowSpaceBetween};
    border-bottom: 0.1rem dashed ${COLORS.gray100};
    padding-bottom: 2rem;
    margin-bottom: 1.7rem;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
        gap: 2rem;
    `}
`;

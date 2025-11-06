import styled from 'styled-components';

import { flexAllCenter } from 'styles/mixins';
import { COLORS } from 'styles/style-constants';

export const PairBlock = styled.div`
    ${flexAllCenter};
    padding: 3.4rem 0;
    border-radius: 0.5rem;
    background: ${COLORS.gray50};
    margin-bottom: 2.3rem;
`;

export const BribeInfo = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 4.7rem;
    padding-bottom: 3rem;
    border-bottom: 0.1rem dashed ${COLORS.gray100};
    margin-bottom: 3rem;
`;

export const InfoRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;

    &:not(:last-child) {
        margin-bottom: 1.6rem;
    }
`;

export const Label = styled.span`
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.textGray};
`;

export const Value = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textTertiary};
`;

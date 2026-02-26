import styled from 'styled-components';

import { flexRowSpaceBetween } from 'styles/mixins';
import { COLORS } from 'styles/style-constants';

export const Container = styled.div`
    padding-top: 2.4rem;
`;

export const Section = styled.div`
    &:not(:last-child) {
        margin-bottom: 3.2rem;
        padding-bottom: 3.2rem;
        border-bottom: 0.1rem solid ${COLORS.gray100};
    }
`;

export const SectionTitle = styled.h5`
    font-size: 2rem;
    line-height: 2.8rem;
    margin-bottom: 1.2rem;
`;

export const PositionsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    margin-top: 1.2rem;
`;

export const PositionOptionCard = styled.div`
    width: 100%;
    box-sizing: border-box;
    border: none;
    border-radius: 0;
    padding: 1.2rem 0;
    background: transparent;
`;

export const PositionInfoRows = styled.div`
    display: grid;
    gap: 0.8rem;
`;

export const PositionInfoRow = styled.div`
    ${flexRowSpaceBetween};
    color: ${COLORS.textGray};
    font-size: 1.3rem;

    span:last-child {
        color: ${COLORS.textTertiary};
        font-weight: 400;
        text-align: right;
    }
`;

export const PositionTokenRows = styled.div`
    margin-top: 1rem;
    display: grid;
    gap: 0.8rem;
`;

export const PositionTokenRow = styled.div`
    ${flexRowSpaceBetween};
    color: ${COLORS.textGray};
    font-size: 1.3rem;

    span:last-child {
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        color: ${COLORS.textTertiary};
    }
`;

import styled from 'styled-components';

import Input from 'basics/inputs/Input';
import RangeInput from 'basics/inputs/RangeInput';

import { flexColumn, flexRowSpaceBetween } from 'styles/mixins';
import { COLORS, FONT_SIZE, hexWithOpacity } from 'styles/style-constants';

export const WithdrawSection = styled.div`
    &:not(:last-child) {
        margin-bottom: 3.2rem;
        padding-bottom: 3.2rem;
        border-bottom: 0.1rem solid ${COLORS.gray100};
    }
`;

export const WithdrawSectionTitle = styled.h5`
    font-size: 2rem;
    line-height: 2.8rem;
    margin-bottom: 1.2rem;
`;

export const WithdrawFormRow = styled.div`
    display: flex;
    align-items: center;
    gap: 2.4rem;
    padding: 0 0.2rem;
`;

export const WithdrawPercentInput = styled(Input)`
    flex: 1;
`;

export const WithdrawRangeInput = styled(RangeInput)`
    flex: 2.8;
`;

export const WithdrawFieldsStack = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5rem;
`;

export const WithdrawEstimateDetails = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 3.2rem;
`;

export const WithdrawEstimateRow = styled.div`
    ${flexRowSpaceBetween};
    min-height: 2.4rem;
    margin-bottom: 1.6rem;
    color: ${COLORS.textGray};
`;

export const WithdrawEstimateValue = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: nowrap;
    gap: 0.8rem;
    white-space: nowrap;
    color: ${COLORS.textTertiary};
`;

export const WithdrawPositionCard = styled.div.attrs({
    'data-withdraw-position-card': 'true',
})`
    ${flexColumn};
    gap: 1.6rem;
    width: 100%;
    box-sizing: border-box;
    padding: 0;
    background: ${COLORS.transparent};
    border: none;
    border-radius: 0;
`;

export const WithdrawPositionTokenRow = styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 2.4rem;
    width: 100%;
`;

export const WithdrawPositionTokenItem = styled.div`
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    max-width: 100%;
    gap: 0.4rem;
    min-width: 0;
`;

export const WithdrawPositionTokenValue = styled.span`
    ${FONT_SIZE.md};
    font-weight: 700;
    color: ${COLORS.textTertiary};
    line-height: 1.8rem;
    white-space: nowrap;
`;

export const WithdrawPositionLogoWrap = styled.div`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.6rem;
    height: 1.6rem;
    min-width: 1.6rem;
    border: 0.4rem solid ${COLORS.white};
    border-radius: 10rem;
    box-sizing: content-box;
`;

export const WithdrawPositionInfoRows = styled.div`
    ${flexColumn};
    gap: 1.6rem;
    width: 100%;
`;

export const WithdrawPositionInfoRow = styled.div`
    ${flexRowSpaceBetween};
    gap: 2.4rem;
    min-height: 2rem;
`;

export const WithdrawPositionInfoLabel = styled.span`
    ${FONT_SIZE.sm};
    color: ${hexWithOpacity(COLORS.textSecondary, 70)};
    line-height: 2rem;
`;

export const WithdrawPositionInfoValue = styled.div`
    ${FONT_SIZE.md};
    color: ${COLORS.textTertiary};
    line-height: 1.8rem;
    text-align: right;
    white-space: nowrap;
`;

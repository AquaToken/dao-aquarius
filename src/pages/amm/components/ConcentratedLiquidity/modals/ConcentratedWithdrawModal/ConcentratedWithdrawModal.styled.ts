import styled from 'styled-components';

import Input from 'basics/inputs/Input';
import RangeInput from 'basics/inputs/RangeInput';

import { flexRowSpaceBetween } from 'styles/mixins';
import { COLORS } from 'styles/style-constants';

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

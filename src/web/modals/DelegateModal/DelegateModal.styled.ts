import styled from 'styled-components';

import { Button } from 'basics/buttons';

import PublicKeyWithIcon from 'components/PublicKeyWithIcon';

import { flexAllCenter, flexColumn, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

export const DelegateButton = styled(Button)`
    margin-top: 1.6rem;
`;

export const DelegationInfo = styled.div`
    ${flexColumn};
    gap: 1.6rem;
    margin-top: 2.4rem;
    color: ${COLORS.textTertiary};
    font-size: 1.6rem;
    line-height: 2.8rem;
`;

export const DelegationDescription = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;
`;

export const DelegationDescriptionIcon = styled.div`
    width: 3.2rem;
    flex: 0 0 3.2rem;
    color: ${COLORS.textSecondary};
    font-size: 1.8rem;
    font-weight: 700;
    line-height: 3.2rem;
    text-align: center;
`;

export const DelegationDescriptionContent = styled.div`
    ${flexColumn};
    gap: 0.4rem;
    flex: 1;
    min-width: 0;
`;

export const DelegationDescriptionTitle = styled.div`
    color: ${COLORS.textSecondary};
    font-size: 1.4rem;
    font-weight: 700;
    line-height: 2rem;
`;

export const DelegationDescriptionText = styled.div`
    color: ${COLORS.textGray};
    font-size: 1.4rem;
    font-weight: 400;
    line-height: 2rem;
`;

export const DelegationDivider = styled.div`
    height: 0.1rem;
    margin-top: 2.4rem;
    background: ${COLORS.gray100};
`;

export const BalanceTooltipInner = styled.div`
    ${flexColumn};
    gap: 1.6rem;
    width: 23.2rem;
    padding: 1.7rem 2rem 1.5rem;
    box-sizing: border-box;
    color: ${COLORS.white};
    font-size: 1.4rem;
    line-height: 1.8rem;
`;

export const BalanceTooltipTitle = styled.div`
    line-height: 2.7rem;
    white-space: normal;
`;

export const BalanceTooltipDivider = styled.div`
    height: 0.1rem;
    background: ${COLORS.purple300};
`;

export const BalanceTooltipLabel = styled.div`
    line-height: 1.8rem;
`;

export const BalanceTooltipRow = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 2rem;
    line-height: 1.8rem;

    &:last-child:not(:first-child) {
        font-weight: 700;
    }
`;

export const BalanceTooltipTotalLabel = styled.span`
    font-weight: 400;
`;

export const FormRow = styled.div`
    display: flex;
    margin: 7.6rem 0 2rem;
    position: relative;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
        margin: 2.4rem 0 2rem;
    `}
`;

export const Labels = styled.div`
    position: absolute;
    bottom: calc(100% + 1.2rem);
    left: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;

    ${respondDown(Breakpoints.sm)`
        position: static;
        flex-direction: column;
        align-items: flex-start;
        gap: 1.2rem;
        margin-bottom: 1.2rem;
    `}
`;

export const SelectItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
`;

export const Avatar = styled.img`
    border-radius: 50%;
`;

export const IconWrapper = styled.div`
    height: 2.4rem;
    width: 2.4rem;
    background: ${COLORS.gray100};
    border-radius: 50%;
    ${flexAllCenter};
    color: ${COLORS.gray300};

    svg {
        margin: 0 !important;
        height: 1.2rem;
        width: 1.2rem;
    }
`;

export const PublicKeyWithIconStyled = styled(PublicKeyWithIcon)`
    color: ${COLORS.textGray};
    margin-left: 1rem;
`;

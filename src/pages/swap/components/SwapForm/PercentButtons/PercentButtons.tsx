import { Asset } from '@stellar/stellar-sdk';
import * as React from 'react';
import styled from 'styled-components';

import Info from 'assets/icon-info.svg';

import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import { respondDown } from '../../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../../common/styles';
import useAuthStore from '../../../../../store/authStore/useAuthStore';

const Container = styled.div<{ isMobile: boolean }>`
    display: ${({ isMobile }) => (isMobile ? 'none' : 'flex')};

    ${respondDown(Breakpoints.sm)`
        width: 100%;
        display: ${({ isMobile }) => (!isMobile ? 'none' : 'flex')};
        margin-top: 0.4rem;
    `}
`;

const Buttons = styled.div`
    display: flex;
    margin: 0 0.8rem;
    border: 0.1rem solid ${COLORS.transparent};
    border-radius: 0.3rem;
    background: linear-gradient(to left, white, white) padding-box padding-box,
        linear-gradient(
                to right,
                ${COLORS.gray} 0px,
                ${COLORS.white} 3%,
                ${COLORS.white} 97%,
                ${COLORS.gray} 100%
            )
            border-box border-box;
    background-clip: padding-box, border-box;
    background-origin: padding-box, border-box;

    ${respondDown(Breakpoints.sm)`
        width: 100%;
    `}
`;

const PercentButton = styled.div`
    padding: 0 0.4rem;
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.purple};
    cursor: pointer;
    flex: 1;

    &:not(:last-child) {
        border-right: 0.1rem solid ${COLORS.gray};
    }

    ${respondDown(Breakpoints.sm)`
        padding: unset;
        text-align: center;
    `}
`;

const TooltipInner = styled.div`
    display: flex;
    flex-direction: column;
    color: ${COLORS.white};
    font-size: 1.2rem;
    line-height: 2rem;
`;

const TooltipRow = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 1.2rem;

    &:last-child:not(:first-child) {
        font-weight: 700;
    }
`;

interface PercentButtonsProps {
    setPercent: (percent: number) => void;
    asset: Asset;
    isMobile?: boolean;
}

const PercentButtons = ({ setPercent, asset, isMobile }: PercentButtonsProps) => {
    const { account } = useAuthStore();

    if (!account) {
        return null;
    }
    return (
        <Container isMobile={isMobile}>
            <Buttons>
                <PercentButton onClick={() => setPercent(25)}>25%</PercentButton>
                <PercentButton onClick={() => setPercent(50)}>50%</PercentButton>
                <PercentButton onClick={() => setPercent(75)}>75%</PercentButton>
                <PercentButton onClick={() => setPercent(100)}>100%</PercentButton>
            </Buttons>
            <Tooltip
                showOnHover
                background={COLORS.titleText}
                position={
                    +window.innerWidth < 1200 ? TOOLTIP_POSITION.left : TOOLTIP_POSITION.right
                }
                content={
                    <TooltipInner>
                        {account.getReservesForSwap(asset).map(({ label, value }) => (
                            <TooltipRow key={label}>
                                <span>{label}</span>
                                <span>
                                    {value} {asset.code}
                                </span>
                            </TooltipRow>
                        ))}
                    </TooltipInner>
                }
            >
                <Info />
            </Tooltip>
        </Container>
    );
};

export default PercentButtons;

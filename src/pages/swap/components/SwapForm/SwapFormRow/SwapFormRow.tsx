import * as React from 'react';
import { Breakpoints, COLORS } from '../../../../../common/styles';
import AssetDropdown from '../../../../vote/components/AssetDropdown/AssetDropdown';
import useAuthStore from '../../../../../store/authStore/useAuthStore';
import { useState } from 'react';
import styled from 'styled-components';
import { respondDown } from '../../../../../common/mixins';
import Input from '../../../../../common/basics/Input';
import Tooltip, { TOOLTIP_POSITION } from '../../../../../common/basics/Tooltip';
import { formatBalance } from '../../../../../common/helpers/helpers';
import Info from '../../../../../common/assets/img/icon-info.svg';
import { Asset } from '@stellar/stellar-sdk';

const Container = styled.div<{ $isOpen?: boolean }>`
    display: flex;
    margin-top: 5rem;
    position: relative;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 2rem;
        position: ${({ $isOpen }) => ($isOpen ? 'static' : 'relative')};
    `}
`;

const Balance = styled.div<{ isHidden?: boolean }>`
    visibility: ${({ isHidden }) => (isHidden ? 'hidden' : 'unset')};
    position: absolute;
    bottom: calc(100% + 1.2rem);
    right: 0;
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.paragraphText};
    display: inline-flex;
    align-items: center;

    svg {
        margin-left: 0.4rem;
    }

    ${respondDown(Breakpoints.md)`
       font-size: 1.2rem;
       flex-direction: column;
    `}
`;

const StyledInput = styled(Input)`
    flex: 1.4;
    z-index: 50;
`;

const DropdownContainer = styled.div<{ $isOpen: boolean }>`
    ${({ $isOpen }) =>
        $isOpen
            ? `
    width: 100%; 
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    `
            : `flex: 1;`}
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
`;

const PercentButton = styled.div`
    padding: 0 0.4rem;
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.purple};
    cursor: pointer;

    &:not(:last-child) {
        border-right: 0.1rem solid ${COLORS.gray};
    }
`;

const Row = styled.div`
    display: flex;
`;

interface SwapFormRowProps {
    isBase?: boolean;
    asset: Asset;
    setAsset: (asset: Asset) => void;
    amount: string;
    setAmount?: (amount: string) => void;
    exclude: Asset;
    pending: boolean;
    inputPostfix: React.ReactElement;
}

const SwapFormRow = ({
    isBase,
    asset,
    setAsset,
    amount,
    setAmount,
    exclude,
    pending,
    inputPostfix,
}: SwapFormRowProps) => {
    const { account } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);

    const setPercent = (percent: number) => {
        const available = account.getAssetBalance(asset);

        setAmount(((available * percent) / 100).toFixed(7));
    };

    return (
        <Container $isOpen={!isBase && isOpen}>
            {account && account.getAssetBalance(asset) !== null && (
                <Balance>
                    {isBase ? 'Available: ' : 'Balance: '}
                    {formatBalance(account.getAssetBalance(asset))} {asset.code}
                    {isBase && (
                        <Row>
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
                                    +window.innerWidth < 992
                                        ? TOOLTIP_POSITION.left
                                        : TOOLTIP_POSITION.right
                                }
                                content={
                                    <TooltipInner>
                                        {account
                                            .getReservesForSwap(asset)
                                            .map(({ label, value }) => (
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
                        </Row>
                    )}
                </Balance>
            )}
            <StyledInput
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                label={isBase ? 'From' : 'To(estimated)'}
                placeholder={isBase ? '' : '0.0'}
                postfix={inputPostfix}
                disabled={!isBase}
            />

            <DropdownContainer $isOpen={isOpen}>
                <AssetDropdown
                    asset={asset}
                    onUpdate={setAsset}
                    exclude={exclude}
                    disabled={pending}
                    withoutReset
                    onToggle={(res) => setIsOpen(res)}
                    withBalances
                    longListOnMobile
                />
            </DropdownContainer>
        </Container>
    );
};

export default SwapFormRow;

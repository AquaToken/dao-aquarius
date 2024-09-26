import { Asset } from '@stellar/stellar-sdk';
import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import { formatBalance } from 'helpers/format-number';

import useAuthStore from 'store/authStore/useAuthStore';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Input from 'basics/inputs/Input';

import AssetDropdown from '../../../../vote/components/AssetDropdown/AssetDropdown';
import PercentButtons from '../PercentButtons/PercentButtons';

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
    color: ${COLORS.grayText};
    display: inline-flex;
    align-items: center;

    svg {
        margin-left: 0.4rem;
    }

    ${respondDown(Breakpoints.md)`
       font-size: 1.2rem;
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
        const available = account.getAvailableForSwapBalance(asset);

        setAmount(((available * percent) / 100).toFixed(7));
    };

    return (
        <Container $isOpen={!isBase && isOpen}>
            {account && account.getAssetBalance(asset) !== null && (
                <Balance>
                    {isBase ? 'Available: ' : 'Balance: '}
                    {formatBalance(
                        isBase
                            ? account.getAvailableForSwapBalance(asset)
                            : account.getAssetBalance(asset),
                    )}{' '}
                    {asset.code}
                    {isBase && <PercentButtons asset={asset} setPercent={setPercent} />}
                </Balance>
            )}
            <StyledInput
                value={amount}
                onChange={e => setAmount(e.target.value)}
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
                    onToggle={res => setIsOpen(res)}
                    withBalances
                    longListOnMobile
                />
            </DropdownContainer>
            {isBase && <PercentButtons asset={asset} setPercent={setPercent} isMobile />}
        </Container>
    );
};

export default SwapFormRow;

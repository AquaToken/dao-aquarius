import { Asset } from '@stellar/stellar-sdk';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { getNativePrices } from 'api/amm';

import { getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';

import { StellarService } from 'services/globalServices';

import { respondDown, textEllipsis } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Warning from 'assets/icon-warning.svg';

import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

const Container = styled.div`
    display: flex;
    align-items: center;
    color: ${COLORS.grayText};
    max-width: 17rem;
    height: 1.7rem;

    span {
        font-size: 1.4rem;
        ${textEllipsis};
    }
`;

const Percent = styled.div<{ $percent: number }>`
    display: flex;
    align-items: center;
    margin-left: 0.4rem;

    svg {
        margin: 0 0.4rem;
    }
    color: ${({ $percent }) => {
        if ($percent > 0) {
            return COLORS.green;
        }

        if ($percent <= -10) {
            return COLORS.pinkRed;
        }

        return COLORS.grayText;
    }};
`;

const TooltipInner = styled.p`
    width: 38rem;
    white-space: pre-wrap;
    font-size: 1.4rem;
    line-height: 2rem;

    ${respondDown(Breakpoints.md)`
        width: 20rem;
    `}
`;

interface Props {
    amount: string;
    asset: Asset;
    sourceAmount?: string;
    sourceAsset?: Asset;
}

const AmountUsdEquivalent = ({ amount, asset, sourceAmount, sourceAsset }: Props) => {
    const [price, setPrice] = useState(null);
    const [priceSource, setPriceSource] = useState(null);

    useEffect(() => {
        setPrice(null);

        if (!amount || !asset) {
            return;
        }

        getNativePrices(sourceAsset ? [asset, sourceAsset] : [asset]).then(res => {
            setPrice(res.has(getAssetString(asset)) ? res.get(getAssetString(asset)) : null);
            if (sourceAsset) {
                setPriceSource(
                    res.has(getAssetString(sourceAsset))
                        ? res.get(getAssetString(sourceAsset))
                        : null,
                );
            }
        });
    }, [amount, asset, sourceAsset]);

    const percent = useMemo(() => {
        if (!price || !priceSource) {
            return null;
        }

        const result = (
            ((Number(amount) * price) / (Number(sourceAmount) * priceSource) - 1) *
            100
        ).toFixed(1);

        return result === '-0.0' ? '0.0' : result;
    }, [price, priceSource, amount, sourceAmount]);

    if (!amount || !price || (sourceAsset && !priceSource)) {
        return (
            <Container>
                <span>$0</span>
            </Container>
        );
    }

    return (
        <Container>
            <span>
                $
                {formatBalance(
                    +(Number(amount) * Number(price) * StellarService.priceLumenUsd).toFixed(2),
                    true,
                )}
            </span>

            {percent && Number.isFinite(+percent) ? (
                <Percent $percent={Number(percent)}>
                    ({Number(percent) > 0 ? '+' : ''}
                    {percent}%)
                    {Number(percent) <= -10 ? (
                        <Tooltip
                            showOnHover
                            content={
                                <TooltipInner>
                                    Swapping these tokens in the submitted amount will create a
                                    significant price impact misbalancing one or more pool ratios
                                    and thus reducing your outcome.
                                </TooltipInner>
                            }
                            position={TOOLTIP_POSITION.bottom}
                        >
                            <Warning />
                        </Tooltip>
                    ) : null}
                </Percent>
            ) : null}
        </Container>
    );
};

export default AmountUsdEquivalent;

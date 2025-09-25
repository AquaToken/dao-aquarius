import * as React from 'react';
import styled from 'styled-components';

import { Token } from 'types/token';

import Fail from 'assets/icon-fail.svg';

import AssetLogo from 'basics/AssetLogo';

import { COLORS } from '../styles';

const ChipsBlock = styled.div`
    display: flex;
`;

const ChipsItem = styled.div`
    display: flex;
    align-items: center;
    padding: 0.8rem 1.6rem;
    background-color: ${COLORS.gray50};
    border-radius: 0.4rem;
    margin-right: 0.5rem;

    span {
        margin-left: 0.8rem;
        margin-right: 1.6rem;
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.textTertiary};
    }
`;

const ResetChips = styled(Fail)`
    rect {
        fill: ${COLORS.textTertiary};
    }
    height: 1.6rem;
    width: 1.6rem;
    cursor: pointer;
`;

interface ChipsProps {
    assets: Token[];
    resetAsset: (e: React.MouseEvent, asset: Token) => void;
}

const Chips = ({ assets, resetAsset, ...props }: ChipsProps): React.ReactNode => (
    <ChipsBlock {...props}>
        {assets.map(asset => (
            <ChipsItem key={asset.contract}>
                <AssetLogo asset={asset} isCircle />
                <span>{asset.code}</span>
                <ResetChips onClick={(e: React.MouseEvent) => resetAsset(e, asset)} />
            </ChipsItem>
        ))}
    </ChipsBlock>
);

export default Chips;

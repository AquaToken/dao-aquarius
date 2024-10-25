import * as React from 'react';
import styled from 'styled-components';

import { Asset } from 'types/stellar';

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
    background-color: ${COLORS.lightGray};
    border-radius: 0.4rem;
    margin-right: 0.5rem;

    span {
        margin-left: 0.8rem;
        margin-right: 1.6rem;
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.paragraphText};
    }
`;

const ResetChips = styled(Fail)`
    rect {
        fill: ${COLORS.paragraphText};
    }
    height: 1.6rem;
    width: 1.6rem;
    cursor: pointer;
`;

interface ChipsProps {
    assets: Asset[];
    resetAsset: (e: React.MouseEvent, asset: Asset) => void;
}

const Chips = ({ assets, resetAsset, ...props }: ChipsProps): React.ReactNode => (
    <ChipsBlock {...props}>
        {assets.map(asset => (
            <ChipsItem key={`${asset.code}-${asset.issuer}`}>
                <AssetLogo asset={asset} isCircle />
                <span>{asset.code}</span>
                <ResetChips onClick={(e: React.MouseEvent) => resetAsset(e, asset)} />
            </ChipsItem>
        ))}
    </ChipsBlock>
);

export default Chips;

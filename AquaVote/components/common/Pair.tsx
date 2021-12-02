import * as React from 'react';
import { AssetSimple } from '../../api/types';
import styled from 'styled-components';
import useAssetsStore from '../../store/assetsStore/useAssetsStore';
import * as StellarSdk from 'stellar-sdk';
import { getAssetString } from '../../store/assetsStore/actions';
import { LumenInfo } from '../../store/assetsStore/reducer';
import { COLORS } from '../../../common/styles';
import DotsLoader from '../../../common/basics/DotsLoader';
import AssetLogo, { logoStyles } from '../AssetDropdown/AssetLogo';

const Wrapper = styled.div<{ verticalDirections?: boolean }>`
    display: flex;
    ${({ verticalDirections }) => verticalDirections && 'flex-direction: column;'};
    align-items: center;
`;

const Icons = styled.div`
    display: flex;
    align-items: center;
`;

const BaseIcon = styled.div`
    ${logoStyles};
    border: 0.3rem solid ${COLORS.white};
    background-color: ${COLORS.white};
    z-index: 1;
    box-sizing: content-box;
    position: relative;
    left: 0.5rem;
`;

const SecondIcon = styled.div`
    ${logoStyles};
    z-index: 0;
    box-sizing: content-box;
    position: relative;
    left: -0.5rem;
`;

const AssetsDetails = styled.div<{ verticalDirections?: boolean }>`
    display: flex;
    flex-direction: column;
    ${({ verticalDirections }) =>
        verticalDirections
            ? `align-items: center;
        margin-top: 2rem;`
            : 'margin-left: 1.6rem;'};
`;

const AssetsCodes = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};
`;

const AssetsDomains = styled.span`
    color: ${COLORS.grayText};
    font-size: 1.4rem;
    line-height: 2rem;
`;

type PairProps = {
    base: AssetSimple;
    counter: AssetSimple;
    withoutDomains?: boolean;
    verticalDirections?: boolean;
};

const Pair = ({ base, counter, withoutDomains, verticalDirections }: PairProps): JSX.Element => {
    const { assetsInfo } = useAssetsStore();

    const baseInstance = new StellarSdk.Asset(base.code, base.issuer);
    const isBaseNative = baseInstance.isNative();
    const hasBaseInfo = isBaseNative || assetsInfo.has(getAssetString(base));
    const baseInfo = isBaseNative ? LumenInfo : assetsInfo.get(getAssetString(base));

    const counterInstance = new StellarSdk.Asset(counter.code, counter.issuer);
    const isCounterNative = counterInstance.isNative();
    const hasCounterInfo = isCounterNative || assetsInfo.has(getAssetString(counter));
    const counterInfo = isCounterNative ? LumenInfo : assetsInfo.get(getAssetString(counter));

    return (
        <Wrapper verticalDirections={verticalDirections}>
            <Icons>
                <BaseIcon key={baseInfo?.asset_string}>
                    <AssetLogo logoUrl={baseInfo?.image} />
                </BaseIcon>
                <SecondIcon key={counterInfo?.asset_string}>
                    <AssetLogo logoUrl={counterInfo?.image} />
                </SecondIcon>
            </Icons>
            <AssetsDetails verticalDirections={verticalDirections}>
                <AssetsCodes>
                    {base.code} / {counter.code}
                </AssetsCodes>
                {!withoutDomains && (
                    <AssetsDomains>
                        {baseInfo?.name || base.code} (
                        {hasBaseInfo ? baseInfo.home_domain ?? 'unknown' : <DotsLoader />}){' · '}
                        {counterInfo?.name || counter.code} (
                        {hasCounterInfo ? counterInfo.home_domain ?? 'unknown' : <DotsLoader />})
                    </AssetsDomains>
                )}
            </AssetsDetails>
        </Wrapper>
    );
};

export default Pair;

import * as StellarSdk from '@stellar/stellar-sdk';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { USDx_CODE, USDx_ISSUER } from 'constants/assets';

import { getAquaAssetData, getAssetString, getUsdcAssetData } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';

import useAssetsSearch from 'hooks/useAssetsSearch';

import useAssetsStore from 'store/assetsStore/useAssetsStore';
import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService } from 'services/globalServices';

import { ModalProps } from 'types/modal';
import { Asset as AssetType } from 'types/stellar';

import Asset from 'basics/Asset';
import { Input } from 'basics/inputs';
import { CircleLoader } from 'basics/loaders';
import { ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

import { customScroll, respondDown, textEllipsis } from '../../mixins';
import { Breakpoints, COLORS } from '../../styles';

const StyledInput = styled(Input)`
    margin-top: 2.4rem;
`;

const DefaultAssets = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 1.6rem;
    
    ${respondDown(Breakpoints.md)`
        flex-wrap: wrap;
        gap: 0;
    `}}
`;

const DefaultAsset = styled.div`
    height: 4.8rem;
    border-radius: 3.8rem;
    border: 0.1rem solid ${COLORS.gray};
    padding: 0.8rem;
    background-color: ${COLORS.white};
    align-items: center;
    cursor: pointer;

    &:hover {
        border-color: ${COLORS.grayText};
    }

    ${respondDown(Breakpoints.md)`
        margin-bottom: 1rem;
    `}}
`;

const AssetsList = styled.div`
    display: flex;
    flex-direction: column;
    height: 50vh;
    ${customScroll};
    overflow-y: auto;
    margin-top: 2.5rem;

    ${respondDown(Breakpoints.md)`
        margin-bottom: 1rem;
        height: 40rem;
        width: 100%;
    `}}
`;

const AssetStyled = styled(Asset)<{ $isLogged: boolean }>`
    ${respondDown(Breakpoints.md)`
        width: ${({ $isLogged }) => ($isLogged ? '40%' : '80%')};
    `}
`;

const AssetItem = styled.div`
    display: flex;
    align-items: center;
    padding: 0.8rem;
    cursor: pointer;
    justify-content: space-between;

    &:hover {
        background-color: ${COLORS.lightGray};
    }

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}}
`;

const Balances = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    color: ${COLORS.grayText};
    font-size: 1.4rem;
    line-height: 2rem;

    span:first-child {
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.paragraphText};
        text-align: right;
    }

    ${respondDown(Breakpoints.md)`
        width: 40%;
        font-size: 1.2rem;
        
        span {
            width: 100%;
            ${textEllipsis};
            text-align: right;
        }
        
        span:first-child {
            font-size: 1.2rem;
            line-height: 2rem;
            white-space: nowrap;
        }
    `}
`;

const DEFAULT_ASSETS = [
    StellarService.createLumen(),
    getAquaAssetData().aquaStellarAsset,
    getUsdcAssetData().usdcStellarAsset,
    StellarService.createAsset(USDx_CODE, USDx_ISSUER),
];

type Props = {
    assetsList: AssetType[];
    onUpdate: (asset: AssetType) => void;
};

const AssetPickerModal = ({ params, confirm }: ModalProps<Props>) => {
    const [search, setSearch] = useState('');

    const [balances, setBalances] = useState([]);

    const { account, isLogged } = useAuthStore();
    const { assetsInfo } = useAssetsStore();

    const { assetsList, onUpdate } = params;

    useEffect(() => {
        if (!account) {
            setBalances([]);
            return;
        }
        account.getSortedBalances().then(res => {
            setBalances(res);
        });
    }, [account]);

    const filteredBalances =
        balances.filter(balance =>
            assetsList?.find(
                knownAssets =>
                    knownAssets.code === balance.code && knownAssets.issuer === balance.issuer,
            ),
        ) ?? [];

    const assets = [
        ...filteredBalances,
        ...(assetsList?.filter(
            knownAssets =>
                !filteredBalances.find(
                    asset => knownAssets.code === asset.code && knownAssets.issuer === asset.issuer,
                ),
        ) || []),
    ];

    const { searchResults, searchPending } = useAssetsSearch(search);

    const filteredAssets = useMemo(
        () =>
            [
                ...assets,
                ...searchResults.filter(
                    token => !assets.find(asset => getAssetString(asset) === getAssetString(token)),
                ),
            ].filter(assetItem => {
                const assetInfo = assetsInfo.get(
                    getAssetString(StellarService.createAsset(assetItem.code, assetItem.issuer)),
                );

                return (
                    getAssetString(StellarService.createAsset(assetItem.code, assetItem.issuer)) ===
                        search ||
                    assetItem.code.toLowerCase().includes(search.toLowerCase()) ||
                    (StellarSdk.StrKey.isValidEd25519PublicKey(search) &&
                        assetItem.issuer?.toLowerCase().includes(search.toLowerCase())) ||
                    assetInfo?.home_domain
                        ?.toLowerCase()
                        .includes(search.toLowerCase().replace('www.', ''))
                );
            }),
        [assets, search, assetsInfo, searchResults],
    );

    const chooseAsset = (asset: AssetType) => {
        const stellarAsset = StellarService.createAsset(asset.code, asset.issuer);
        onUpdate(stellarAsset);
        confirm();
    };

    return (
        <ModalWrapper>
            <ModalTitle>Choose asset</ModalTitle>
            <StyledInput
                placeholder="Search asset or enter home domain"
                value={search}
                onChange={e => setSearch(e.target.value)}
                postfix={searchPending ? <CircleLoader size="small" /> : null}
            />
            <DefaultAssets>
                {DEFAULT_ASSETS.map(asset => (
                    <DefaultAsset key={getAssetString(asset)} onClick={() => chooseAsset(asset)}>
                        <Asset asset={asset} logoAndCode />
                    </DefaultAsset>
                ))}
            </DefaultAssets>
            <AssetsList>
                {filteredAssets.map(asset => (
                    <AssetItem key={asset.code + asset.issuer} onClick={() => chooseAsset(asset)}>
                        <AssetStyled asset={asset} $isLogged={isLogged} />
                        {asset.balance ? (
                            <Balances>
                                <span>
                                    {formatBalance(asset.balance)} {asset.code}
                                </span>
                                <span>
                                    $
                                    {formatBalance(
                                        +(
                                            asset.nativeBalance * StellarService.priceLumenUsd
                                        ).toFixed(2),
                                        true,
                                    )}
                                </span>
                            </Balances>
                        ) : null}
                    </AssetItem>
                ))}
            </AssetsList>
        </ModalWrapper>
    );
};

export default AssetPickerModal;

import * as StellarSdk from '@stellar/stellar-sdk';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { USDx_CODE, USDx_ISSUER } from 'constants/assets';

import { getAquaAssetData, getAssetString, getUsdcAssetData } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';
import { createAsset, createLumen } from 'helpers/token';

import useAssetsSearch from 'hooks/useAssetsSearch';

import useAssetsStore from 'store/assetsStore/useAssetsStore';
import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService } from 'services/globalServices';

import { ModalProps } from 'types/modal';
import { ClassicToken, Token, TokenType } from 'types/token';

import { customScroll, respondDown, textEllipsis } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Asset from 'basics/Asset';
import { Input } from 'basics/inputs';
import { CircleLoader, PageLoader } from 'basics/loaders';
import { ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

const StyledInput = styled(Input)`
    margin-top: 2.4rem;
`;

const DefaultAssets = styled.div`
    display: flex;
    justify-content: flex-start;
    margin-top: 1.6rem;
    flex-wrap: wrap;
    gap: 0;
`;

const DefaultAsset = styled.div`
    height: 4.8rem;
    border-radius: 3.8rem;
    border: 0.1rem solid ${COLORS.gray100};
    padding: 0.8rem;
    background-color: ${COLORS.white};
    align-items: center;
    cursor: pointer;

    &:not(:last-child) {
        margin-right: 2.4rem;
    }

    &:hover {
        border-color: ${COLORS.textGray};
    }

    ${respondDown(Breakpoints.md)`
        margin-bottom: 1rem;
    `};
`;

const AssetsList = styled.div`
    display: flex;
    flex-direction: column;
    max-height: 45vh;
    ${customScroll};
    overflow-y: auto;
    margin-top: 2.5rem;

    ${respondDown(Breakpoints.md)`
        margin-bottom: 1rem;
        height: calc(100vh - 35rem);
        max-height: unset;
        width: 100%;
    `};
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
        background-color: ${COLORS.gray50};
    }

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `};
`;

const Balances = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    color: ${COLORS.textGray};
    font-size: 1.4rem;
    line-height: 2rem;

    span:first-child {
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.textTertiary};
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

const LoaderWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 45vh;
    margin-top: 2.5rem;
`;

const EmptyState = styled.span`
    display: flex;
    justify-content: center;
    align-items: center;
    color: ${COLORS.textGray};
    line-height: 6.4rem;
`;

const DEFAULT_ASSETS = [
    createLumen(),
    getAquaAssetData().aquaStellarAsset,
    getUsdcAssetData().usdcStellarAsset,
    createAsset(USDx_CODE, USDx_ISSUER),
] as ClassicToken[];

type Props = {
    assetsList: Token[];
    onUpdate: (asset: Token) => void;
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

    // get balances with tokens pooled into AMM
    const filteredBalances =
        balances.filter(({ token }) =>
            assetsList?.find(knownAssets => knownAssets.contract === token.contract),
        ) ?? [];

    const assets = [
        ...filteredBalances,
        ...(assetsList
            ?.filter(
                knownAsset =>
                    !filteredBalances.find(asset => asset.token.contract === knownAsset.contract),
            )
            .map(token => ({ token })) || []),
    ];

    const { searchResults, searchPending } = useAssetsSearch(search);

    const filteredAssets = useMemo(
        () =>
            [
                ...assets,
                ...searchResults
                    .filter(
                        token =>
                            !assets.find(
                                asset =>
                                    asset.token.code === token.code &&
                                    asset.token.issuer === token.issuer,
                            ),
                    )
                    .map(token => ({ token })),
            ].filter(item => {
                const assetString = getAssetString(item.token);

                const assetInfo =
                    item.token.type === TokenType.classic ? assetsInfo.get(assetString) : null;

                return (
                    assetString === search ||
                    item.token.contract === search ||
                    item.token.code?.toLowerCase().includes(search.toLowerCase()) ||
                    (StellarSdk.StrKey.isValidEd25519PublicKey(search) &&
                        item.token.issuer?.toLowerCase().includes(search.toLowerCase())) ||
                    assetInfo?.home_domain
                        ?.toLowerCase()
                        .includes(search.toLowerCase().replace('www.', ''))
                );
            }),
        [assets, search, assetsInfo, searchResults],
    );

    const chooseAsset = (asset: Token) => {
        const result =
            asset.type === TokenType.soroban ? asset : createAsset(asset.code, asset.issuer);
        onUpdate(result);
        confirm();
    };

    return (
        <ModalWrapper $minHeight="30rem">
            <ModalTitle>Choose asset</ModalTitle>
            <StyledInput
                placeholder="Search asset or enter home domain"
                value={search}
                onChange={e => setSearch(e.target.value)}
                postfix={searchPending ? <CircleLoader size="small" /> : null}
            />
            <DefaultAssets>
                {DEFAULT_ASSETS.filter(
                    asset => !!assetsList.find(token => asset.contract === token.contract),
                ).map(asset => (
                    <DefaultAsset key={getAssetString(asset)} onClick={() => chooseAsset(asset)}>
                        <Asset asset={asset} logoAndCode />
                    </DefaultAsset>
                ))}
            </DefaultAssets>
            {account && !balances.length ? (
                <LoaderWrapper>
                    <PageLoader />
                </LoaderWrapper>
            ) : (
                <AssetsList>
                    {filteredAssets.map(({ token, balance, nativeBalance }) => (
                        <AssetItem key={token.contract} onClick={() => chooseAsset(token)}>
                            <AssetStyled asset={token} $isLogged={isLogged} />
                            {Number(balance) ? (
                                <Balances>
                                    <span>
                                        {formatBalance(balance)} {token.code}
                                    </span>
                                    {nativeBalance !== null && (
                                        <span>
                                            $
                                            {formatBalance(
                                                +(
                                                    nativeBalance * StellarService.priceLumenUsd
                                                ).toFixed(2),
                                                true,
                                            )}
                                        </span>
                                    )}
                                </Balances>
                            ) : null}
                        </AssetItem>
                    ))}
                    {filteredAssets.length === 0 && <EmptyState>No assets found</EmptyState>}
                </AssetsList>
            )}
        </ModalWrapper>
    );
};

export default AssetPickerModal;

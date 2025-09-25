import * as StellarSdk from '@stellar/stellar-sdk';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

import { getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';
import { createAsset } from 'helpers/token';

import useAssetsSearch from 'hooks/useAssetsSearch';
import useOnClickOutside from 'hooks/useOutsideClick';

import { AssetSimple } from 'store/assetsStore/types';
import useAssetsStore from 'store/assetsStore/useAssetsStore';
import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService } from 'services/globalServices';

import { Asset as AssetType } from 'types/stellar';
import { ClassicToken, Token, TokenType } from 'types/token';

import ArrowDown from 'assets/icon-arrow-down.svg';
import Fail from 'assets/icon-fail.svg';

import Asset from 'basics/Asset';
import Chips from 'basics/Chips';
import Input from 'basics/inputs/Input';

import { cardBoxShadow, customScroll, flexRowSpaceBetween, respondDown } from '../../mixins';
import { Breakpoints, COLORS } from '../../styles';
import { CircleLoader } from '../loaders';

const DropDown = styled.div<{ $isOpen: boolean }>`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 6.6rem;
    position: relative;
    cursor: pointer;
    border: ${({ $isOpen }) =>
        $isOpen ? `0.2rem solid ${COLORS.purple500} ` : `0.1rem solid ${COLORS.gray100}`};
    border-radius: ${({ $isOpen }) => ($isOpen ? '0.5rem 0.5rem 0 0' : '0.5rem')};
    padding: ${({ $isOpen }) => ($isOpen ? '0.1rem' : '0.2rem')};
    box-sizing: border-box;
    font-size: 1.4rem;
    background: ${COLORS.white};
`;

const iconStyles = css`
    position: absolute;
    right: 1.4rem;
    top: 50%;
    padding: 1rem;
    box-sizing: content-box;
`;

const DropdownArrow = styled(ArrowDown)<{ $isOpen: boolean }>`
    ${iconStyles};
    transform-origin: center;
    transform: translateY(-50%) ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : '')};
    transition: transform linear 200ms;
    margin-right: ${({ $isOpen }) => ($isOpen ? '0' : '0.1rem')};
`;

const DropdownLoader = styled.div`
    ${iconStyles};
    color: ${COLORS.textSecondary};
    transform: translateY(-50%);
`;

const DropdownList = styled.div<{ $longListOnMobile?: boolean }>`
    position: absolute;
    left: -0.2rem;
    top: calc(100% + 0.2rem);
    background-color: ${COLORS.white};
    ${cardBoxShadow};
    width: calc(100% + 0.4rem);
    box-sizing: border-box;
    border-radius: 0 0 0.5rem 0.5rem;
    animation: openDropdown ease-in-out 0.2s;
    transform-origin: top center;
    max-height: 24rem;
    overflow-y: scroll;
    z-index: 2;
    ${customScroll};

    ${respondDown(Breakpoints.md)`
        ${({ $longListOnMobile }) =>
            $longListOnMobile ? 'max-height: 42rem' : 'max-height: 24rem;'}
    `};

    @keyframes openDropdown {
        0% {
            transform: scaleY(0);
        }
        80% {
            transform: scaleY(1.1);
        }
        100% {
            transform: scaleY(1);
        }
    }
`;

const DropdownItem = styled.div`
    cursor: pointer;
    ${flexRowSpaceBetween};
    padding-right: 2.4rem;

    &:hover {
        background-color: ${COLORS.gray50};
    }
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
        font-size: 1.2rem;
        
        span:first-child {
            font-size: 1.2rem;
            line-height: 2rem;
            white-space: nowrap;
        }
    `}
`;

const SearchEmpty = styled.div`
    height: 6.6rem;
    padding: 0.9rem 2.4rem;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    font-size: 1.4rem;
    line-height: 2rem;
`;

const Reset = styled(Fail)`
    rect {
        fill: ${COLORS.gray100};
    }
    height: 1.6rem;
    width: 1.6rem;
    position: absolute;
    right: 6.4rem;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
`;

const Label = styled.div<{ $isOpen?: boolean }>`
    position: absolute;
    bottom: ${({ $isOpen }) => ($isOpen ? 'calc(100% + 1.3rem)' : 'calc(100% + 1.2rem)')};
    left: ${({ $isOpen }) => ($isOpen ? '0' : '0.1rem')};
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.textTertiary};
`;

const StyledAsset = styled(Asset)<{ $withBalances?: boolean }>`
    padding: 0.9rem 2.4rem;
    height: 6.6rem;
    width: ${({ $withBalances }) => ($withBalances ? '50%' : '100%')};
`;

const StyledInput = styled(Input)<{ $isOpen?: boolean }>`
    input {
        background-color: ${COLORS.transparent};
        border: 0.1rem solid ${COLORS.transparent};

        &:active,
        &:focus,
        &:disabled {
            border: 0.1rem solid ${COLORS.transparent};
        }
    }
`;

const ChipsWeb = styled(Chips)`
    ${respondDown(Breakpoints.sm)`
        display: none;
    `}
`;

const ChipsMobile = styled(Chips)`
    display: none;
    width: 100%;
    flex-wrap: wrap;
    margin-top: 0.8rem;

    ${respondDown(Breakpoints.sm)`
        display: flex;
    `}
`;

type AssetDropdownProps = {
    asset?: Token;
    assets?: Token[];
    assetsList?: Token[];
    onUpdate?: (asset: Token | Token[]) => void;
    disabled?: boolean;
    onToggle?: (value: boolean) => void;
    exclude?: AssetSimple;
    placeholder?: string;
    label?: string;
    withoutReset?: boolean;
    pending?: boolean;
    excludeList?: Token[];
    withBalances?: boolean;
    longListOnMobile?: boolean;
    withChips?: boolean;
    chipsCount?: number;
    withCustomTokens?: boolean;
};

const AssetDropdown = ({
    asset,
    assets: customAssetsList,
    assetsList,
    onUpdate,
    disabled,
    onToggle,
    exclude,
    excludeList,
    placeholder,
    label,
    withoutReset,
    pending,
    withBalances,
    longListOnMobile,
    withChips,
    withCustomTokens,
    ...props
}: AssetDropdownProps) => {
    const { assets: knownAssets, assetsInfo } = useAssetsStore();

    const { account } = useAuthStore();

    const [balances, setBalances] = useState([]);

    useEffect(() => {
        if (!account) {
            setBalances([]);
            return;
        }
        account.getSortedBalances().then(res => {
            setBalances(res.filter(({ token }) => token.type === TokenType.classic));
        });
    }, [account]);

    const knownAssetsList: Token[] = (customAssetsList || knownAssets).map(asset => {
        if (asset.type) {
            return asset;
        }
        return createAsset(asset.code, asset.issuer);
    });

    const filteredBalances = customAssetsList
        ? balances.filter(balance =>
              knownAssetsList.find(knownAsset => knownAsset.contract === balance.token.contract),
          )
        : balances;

    const assets = [
        ...filteredBalances,
        ...(knownAssetsList
            ?.filter(
                knownAsset =>
                    !filteredBalances.find(asset => asset.token.contract === knownAsset.contract),
            )
            .map(token => ({ token })) || []),
    ];

    const [isOpen, setIsOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(asset);
    const [selectedAssets, setSelectedAssets] = useState(
        assetsList?.map((asset: ClassicToken) => createAsset(asset.code, asset.issuer)) || [],
    );
    const [searchText, setSearchText] = useState('');

    const { searchPending, searchResults } = useAssetsSearch(searchText);

    useEffect(() => {
        setSelectedAsset(asset);
    }, [asset]);

    useEffect(() => {
        setSelectedAssets(
            assetsList?.map((asset: ClassicToken) => createAsset(asset.code, asset.issuer)) || [],
        );
    }, [assetsList]);

    useEffect(() => {
        if (onToggle) {
            onToggle(isOpen);
        }
    }, [isOpen]);

    const ref = useRef(null);
    const inputRef = useRef(null);

    useOnClickOutside(ref, () => setIsOpen(false));

    const toggleDropdown = () => {
        if (!assets.length || disabled || pending) {
            return;
        }
        setIsOpen(prev => !prev);
    };

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        } else {
            setSearchText('');
        }
    }, [isOpen]);

    const onClickAsset = (asset: Token) => {
        const stellarAsset =
            asset.type === TokenType.soroban ? asset : createAsset(asset.code, asset.issuer);
        onUpdate(withChips ? [...selectedAssets, stellarAsset] : stellarAsset);
    };

    const resetAll = (event: React.MouseEvent) => {
        event.stopPropagation();
        onUpdate(withChips ? [] : null);
    };

    const resetAsset = (event: React.MouseEvent, asset: AssetType) => {
        event.stopPropagation();
        const newList = selectedAssets.filter(
            ({ code, issuer }) => code !== asset.code && issuer !== asset.issuer,
        );
        onUpdate(newList);
    };

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
            ]
                .filter(item => {
                    const token =
                        item.token?.type === TokenType.soroban
                            ? item.token
                            : createAsset(item.token.code, item.token.issuer);
                    const assetString = getAssetString(token);

                    const assetInfo = assetsInfo.get(assetString);

                    return (
                        (assetString === searchText ||
                            token.contract === searchText ||
                            item.token.code.toLowerCase().includes(searchText.toLowerCase()) ||
                            (StellarSdk.StrKey.isValidEd25519PublicKey(searchText) &&
                                item.token.issuer
                                    ?.toLowerCase()
                                    .includes(searchText.toLowerCase())) ||
                            assetInfo?.home_domain
                                ?.toLowerCase()
                                .includes(searchText.toLowerCase().replace('www.', ''))) &&
                        !(
                            item.token.code === exclude?.code &&
                            item.token.issuer === exclude?.issuer
                        ) &&
                        !excludeList?.find(
                            excludeToken =>
                                excludeToken.code === item.token.code &&
                                item.token.issuer === (excludeToken as ClassicToken).issuer,
                        )
                    );
                })
                .filter(({ token }) => {
                    if (token.type === TokenType.classic) {
                        return true;
                    }

                    return withCustomTokens;
                }),
        [assets, searchText, assetsInfo, searchResults, exclude, excludeList],
    );

    return (
        <>
            <DropDown onClick={() => toggleDropdown()} $isOpen={isOpen} ref={ref} {...props}>
                {Boolean(label) && <Label $isOpen={isOpen}>{label}</Label>}
                {selectedAsset && !isOpen ? (
                    <StyledAsset asset={selectedAsset} />
                ) : (
                    <StyledInput
                        onClick={(e: React.MouseEvent) => {
                            if (isOpen) {
                                e.stopPropagation();
                            }
                        }}
                        $isOpen={isOpen}
                        placeholder={
                            placeholder ?? 'Search asset or enter home domain or contract address'
                        }
                        disabled={!assets.length || disabled || pending}
                        value={searchText}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setSearchText(e.target.value);
                        }}
                        prefixCustom={<ChipsWeb assets={selectedAssets} resetAsset={resetAsset} />}
                        ref={inputRef}
                    />
                )}

                {!withoutReset && (selectedAsset || Boolean(selectedAssets.length)) && (
                    <div
                        onClick={(e: React.MouseEvent) => {
                            resetAll(e);
                        }}
                    >
                        <Reset />
                    </div>
                )}

                {!assets.length || searchPending || pending ? (
                    <DropdownLoader>
                        <CircleLoader size="small" />
                    </DropdownLoader>
                ) : (
                    <DropdownArrow $isOpen={isOpen} />
                )}

                {isOpen && (
                    <DropdownList $longListOnMobile={longListOnMobile}>
                        {filteredAssets.map(({ token, balance, nativeBalance }) => (
                            <DropdownItem
                                onClick={() => onClickAsset(token)}
                                key={token.code + token.issuer}
                            >
                                <StyledAsset
                                    asset={token}
                                    $withBalances={withBalances && balance}
                                />
                                {withBalances && balance ? (
                                    <Balances>
                                        <span>
                                            {formatBalance(balance)} {token.code}
                                        </span>
                                        <span>
                                            $
                                            {formatBalance(
                                                +(
                                                    nativeBalance * StellarService.priceLumenUsd
                                                ).toFixed(2),
                                                true,
                                            )}
                                        </span>
                                    </Balances>
                                ) : null}
                            </DropdownItem>
                        ))}
                        {!filteredAssets.length && <SearchEmpty>Asset not found.</SearchEmpty>}
                    </DropdownList>
                )}
            </DropDown>
            <ChipsMobile assets={selectedAssets} resetAsset={resetAsset} />
        </>
    );
};

export default AssetDropdown;

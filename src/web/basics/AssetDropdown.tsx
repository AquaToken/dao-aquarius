import * as StellarSdk from '@stellar/stellar-sdk';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

import { getAssetString } from 'helpers/assets';
import { formatBalance } from 'helpers/format-number';

import { useDebounce } from 'hooks/useDebounce';
import useOnClickOutside from 'hooks/useOutsideClick';

import { AssetSimple } from 'store/assetsStore/types';
import useAssetsStore from 'store/assetsStore/useAssetsStore';
import useAuthStore from 'store/authStore/useAuthStore';

import { StellarService } from 'services/globalServices';

import { Asset as AssetType } from 'types/stellar';

import { flexRowSpaceBetween, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import ArrowDown from 'assets/icon-arrow-down.svg';
import Fail from 'assets/icon-fail.svg';

import Asset from 'basics/Asset';
import Chips from 'basics/Chips';
import Input from 'basics/inputs/Input';

import { CircleLoader } from './loaders';

const DropDown = styled.div<{ $isOpen: boolean }>`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 6.6rem;
    position: relative;
    cursor: pointer;
    border: ${({ $isOpen }) =>
        $isOpen ? `0.2rem solid ${COLORS.purple}` : `0.1rem solid ${COLORS.gray}`};
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

const DropdownLoader = styled(CircleLoader)`
    ${iconStyles};
    color: ${COLORS.descriptionText};
    transform: translateY(-50%);
    margin-right: ${({ $isOpen }) => ($isOpen ? '0' : '0.1rem')};
`;

const DropdownList = styled.div<{ $longListOnMobile?: boolean }>`
    position: absolute;
    left: -0.2rem;
    top: calc(100% + 0.2rem);
    background-color: ${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    width: calc(100% + 0.4rem);
    box-sizing: border-box;
    border-radius: 0 0 0.5rem 0.5rem;
    animation: openDropdown ease-in-out 0.2s;
    transform-origin: top center;
    max-height: 24rem;
    overflow-y: scroll;
    z-index: 2;

    ${respondDown(Breakpoints.md)`
        ${({ $longListOnMobile }) =>
            $longListOnMobile ? 'max-height: 42rem' : 'max-height: 24rem;'}
    `}

    &::-webkit-scrollbar {
        width: 0.5rem;
    }

    /* Track */
    &::-webkit-scrollbar-track {
        background: ${COLORS.white};
    }

    /* Handle */
    &::-webkit-scrollbar-thumb {
        background: ${COLORS.purple};
        border-radius: 0.25rem;
    }

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
        background-color: ${COLORS.lightGray};
    }
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
        fill: ${COLORS.gray};
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
    color: ${COLORS.paragraphText};
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

const domainPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
const domainRegexp = new RegExp(domainPattern);

const codeIssuerPattern = /^[a-zA-Z0-9]{1,12}:[a-zA-Z0-9]{56}$/;
const codeIssuerRegexp = new RegExp(codeIssuerPattern);

type AssetDropdownProps = {
    asset?: AssetSimple;
    assets?: AssetSimple[];
    assetsList?: AssetSimple[];
    onUpdate?: (asset: AssetType | AssetType[]) => void;
    disabled?: boolean;
    onToggle?: (value: boolean) => void;
    exclude?: AssetSimple;
    placeholder?: string;
    label?: string;
    withoutReset?: boolean;
    pending?: boolean;
    excludeList?: AssetSimple[];
    withBalances?: boolean;
    longListOnMobile?: boolean;
    withChips?: boolean;
    chipsCount?: number;
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
    ...props
}: AssetDropdownProps) => {
    const { assets: knownAssets, assetsInfo, processNewAssets } = useAssetsStore();

    const { account } = useAuthStore();

    const [balances, setBalances] = useState([]);

    useEffect(() => {
        if (!account) {
            setBalances([]);
            return;
        }
        account.getSortedBalances().then(res => {
            setBalances(res);
        });
    }, [account]);

    const knownAssetsList = customAssetsList || knownAssets;
    const filteredBalances = customAssetsList
        ? balances.filter(balance =>
              knownAssetsList.find(
                  knownAssets =>
                      knownAssets.code === balance.code && knownAssets.issuer === balance.issuer,
              ),
          )
        : balances;

    const assets = [
        ...filteredBalances,
        ...(knownAssetsList.filter(
            knownAssets =>
                !filteredBalances.find(
                    asset => knownAssets.code === asset.code && knownAssets.issuer === asset.issuer,
                ),
        ) || []),
    ];

    const [isOpen, setIsOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(asset);
    const [selectedAssets, setSelectedAssets] = useState(
        assetsList?.map(asset => StellarService.createAsset(asset.code, asset.issuer)) || [],
    );
    const [searchText, setSearchText] = useState('');

    const [searchPending, setSearchPending] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    const debouncedSearchText = useDebounce(searchText, 700);

    useEffect(() => {
        setSelectedAsset(asset);
    }, [asset]);

    useEffect(() => {
        setSelectedAssets(
            assetsList?.map(asset => StellarService.createAsset(asset.code, asset.issuer)) || [],
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

    const resolveCurrencies = (domain: string) => {
        setSearchPending(true);

        StellarSdk.StellarToml.Resolver.resolve(domain)
            .then(({ CURRENCIES }) => {
                if (CURRENCIES) {
                    const newCurrencies = CURRENCIES.filter(
                        currency =>
                            !assets.find(
                                asset =>
                                    asset.code === currency.code &&
                                    asset.issuer === currency.issuer,
                            ),
                    );
                    processNewAssets(newCurrencies);
                    setSearchResults(newCurrencies);
                }
                setSearchPending(false);
            })
            .catch(() => {
                setSearchPending(false);
                setSearchResults([]);
            });
    };

    useEffect(() => {
        if (StellarSdk.StrKey.isValidEd25519PublicKey(debouncedSearchText.current)) {
            setSearchPending(true);
            StellarService.loadAccount(debouncedSearchText.current)
                .then(account => {
                    if (!account?.home_domain) {
                        setSearchPending(false);
                        setSearchResults([]);
                        return;
                    }
                    resolveCurrencies(account.home_domain);
                })
                .catch(() => {
                    setSearchPending(false);
                    setSearchResults([]);
                });
            return;
        }

        if (codeIssuerRegexp.test(debouncedSearchText.current)) {
            const [code, issuer] = debouncedSearchText.current.split(':');
            if (!StellarSdk.StrKey.isValidEd25519PublicKey(issuer)) {
                return;
            }

            const currentAsset = StellarService.createAsset(code, issuer);

            if (
                assets.find(
                    asset =>
                        currentAsset.code === asset.code && asset.issuer === currentAsset.issuer,
                )
            ) {
                setSearchResults([]);
                setSearchPending(false);
                return;
            }

            processNewAssets([currentAsset]);
            setSearchResults([currentAsset]);

            setSearchPending(false);
            return;
        }

        if (domainRegexp.test(debouncedSearchText.current)) {
            resolveCurrencies(debouncedSearchText.current);
            return;
        }
        setSearchResults([]);
    }, [debouncedSearchText.current]);

    const onClickAsset = (asset: AssetSimple) => {
        const stellarAsset = StellarService.createAsset(asset.code, asset.issuer);
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
            [...assets, ...searchResults].filter(assetItem => {
                const assetInfo = assetsInfo.get(
                    getAssetString(StellarService.createAsset(assetItem.code, assetItem.issuer)),
                );

                return (
                    (getAssetString(
                        StellarService.createAsset(assetItem.code, assetItem.issuer),
                    ) === searchText ||
                        assetItem.code.toLowerCase().includes(searchText.toLowerCase()) ||
                        (StellarSdk.StrKey.isValidEd25519PublicKey(searchText) &&
                            assetItem.issuer?.toLowerCase().includes(searchText.toLowerCase())) ||
                        assetInfo?.home_domain
                            ?.toLowerCase()
                            .includes(searchText.toLowerCase().replace('www.', ''))) &&
                    !(assetItem.code === exclude?.code && assetItem.issuer === exclude?.issuer) &&
                    !excludeList?.find(
                        excludeToken =>
                            excludeToken.code === assetItem.code &&
                            assetItem.issuer === excludeToken.issuer,
                    )
                );
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
                        placeholder={placeholder ?? 'Search asset or enter home domain'}
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
                    <DropdownLoader size="small" />
                ) : (
                    <DropdownArrow $isOpen={isOpen} />
                )}

                {isOpen && (
                    <DropdownList $longListOnMobile={longListOnMobile}>
                        {filteredAssets.map(assetItem => (
                            <DropdownItem
                                onClick={() => onClickAsset(assetItem)}
                                key={assetItem.code + assetItem.issuer}
                            >
                                <StyledAsset
                                    asset={assetItem}
                                    $withBalances={withBalances && assetItem.balance}
                                />
                                {withBalances && assetItem.balance ? (
                                    <Balances>
                                        <span>
                                            {formatBalance(assetItem.balance)} {assetItem.code}
                                        </span>
                                        <span>
                                            $
                                            {formatBalance(
                                                +(
                                                    assetItem.nativeBalance *
                                                    StellarService.priceLumenUsd
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

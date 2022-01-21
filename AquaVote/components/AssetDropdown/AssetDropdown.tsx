import * as React from 'react';
import styled, { css } from 'styled-components';
import ArrowDown from '../../../common/assets/img/icon-arrow-down.svg';
import Loader from '../../../common/assets/img/loader.svg';
import Fail from '../../../common/assets/img/icon-fail.svg';
import { useEffect, useMemo, useRef, useState } from 'react';
import { COLORS } from '../../../common/styles';
import useOnClickOutside from '../../../common/hooks/useOutsideClick';
import Asset from './Asset';
import useAssetsStore from '../../store/assetsStore/useAssetsStore';
import { getAssetString } from '../../store/assetsStore/actions';
import { useDebounce } from '../../../common/hooks/useDebounce';
import * as StellarSdk from 'stellar-sdk';
import { AssetSimple } from '../../api/types';
import { StellarService } from '../../../common/services/globalServices';

const DropDown = styled.div<{ isOpen: boolean; disabled: boolean }>`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 6.6rem;
    position: relative;
    cursor: pointer;
    border: ${({ isOpen }) =>
        isOpen ? `0.2rem solid ${COLORS.purple}` : `0.1rem solid ${COLORS.gray}`};
    border-radius: ${({ isOpen }) => (isOpen ? '0.5rem 0.5rem 0 0' : '0.5rem')};
    padding: ${({ isOpen }) => (isOpen ? '0.1rem' : '0.2rem')};
    box-sizing: border-box;
    pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};
    font-size: 1.4rem;
    background: ${COLORS.white};
`;

const DropdownSearch = styled.input<{ $disabled: boolean }>`
    border: none;
    height: 100%;
    width: 100%;
    padding: 2.4rem 5rem 2.4rem 2.4rem;
    box-sizing: border-box;
    cursor: pointer;
    font-size: 1.6rem;
    pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};

    &:focus {
        cursor: auto;
    }
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

const DropdownLoader = styled(Loader)`
    ${iconStyles};
    height: 1.6rem;
    width: 1.6rem;
    color: ${COLORS.descriptionText};
    transform: translateY(-50%);
    margin-right: ${({ $isOpen }) => ($isOpen ? '0' : '0.1rem')};
`;

const DropdownList = styled.div`
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
    z-index: 1;

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

    &:hover {
        background-color: ${COLORS.lightGray};
    }
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

type AssetDropdownProps = {
    asset: AssetSimple;
    onUpdate: (asset) => void;
    disabled?: boolean;
    onToggle?: (boolean) => void;
    exclude?: AssetSimple;
};

const pattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
const regexp = new RegExp(pattern);

const AssetDropdown = ({ asset, onUpdate, disabled, onToggle, exclude }: AssetDropdownProps) => {
    const { assets, assetsInfo, processNewAssets } = useAssetsStore();

    const [isOpen, setIsOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(asset);
    const [searchText, setSearchText] = useState('');

    const [searchPending, setSearchPending] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    const debouncedSearchText = useDebounce(searchText, 700);

    useEffect(() => {
        setSelectedAsset(asset);
    }, [asset]);

    useEffect(() => {
        if (onToggle) {
            onToggle(isOpen);
        }
    }, [isOpen]);

    const ref = useRef(null);
    const inputRef = useRef(null);

    useOnClickOutside(ref, () => setIsOpen(false));

    const toggleDropdown = () => {
        setIsOpen((prev) => !prev);
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

        StellarSdk.StellarTomlResolver.resolve(domain)
            .then(({ CURRENCIES }) => {
                if (CURRENCIES) {
                    const newCurrencies = CURRENCIES.filter(
                        (currency) =>
                            !assets.find(
                                (asset) =>
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
        if (StellarSdk.StrKey.isValidEd25519PublicKey(debouncedSearchText)) {
            setSearchPending(true);
            StellarService.loadAccount(debouncedSearchText)
                .then((account) => {
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

        if (regexp.test(debouncedSearchText)) {
            resolveCurrencies(debouncedSearchText);
            return;
        }
        setSearchResults([]);
    }, [debouncedSearchText]);

    const onClickAsset = (asset) => {
        onUpdate(asset);
    };

    const resetAsset = (event) => {
        event.stopPropagation();
        onUpdate(null);
    };

    const filteredAssets = useMemo(() => {
        return [...assets, ...searchResults]
            .filter((assetItem) => {
                const assetInfo = assetsInfo.get(getAssetString(assetItem));
                return (
                    (assetItem.code.toLowerCase().includes(searchText.toLowerCase()) ||
                        assetItem.issuer?.toLowerCase().includes(searchText.toLowerCase()) ||
                        assetInfo?.home_domain?.toLowerCase().includes(searchText.toLowerCase())) &&
                    !(assetItem.code === exclude?.code && assetItem.issuer === exclude?.issuer)
                );
            })
            .sort((a, b) => a.code.localeCompare(b.code));
    }, [assets, searchText, assetsInfo, searchResults, exclude]);

    return (
        <DropDown
            onClick={() => toggleDropdown()}
            isOpen={isOpen}
            ref={ref}
            disabled={!assets.length || disabled}
        >
            {selectedAsset && !isOpen ? (
                <Asset asset={selectedAsset} />
            ) : (
                <DropdownSearch
                    onClick={(e) => {
                        if (isOpen) {
                            e.stopPropagation();
                        }
                    }}
                    placeholder="Search asset or enter home domain"
                    $disabled={!assets.length || disabled}
                    value={searchText}
                    onChange={(e) => {
                        setSearchText(e.target.value);
                    }}
                    ref={inputRef}
                />
            )}

            {selectedAsset && (
                <div
                    onClick={(e) => {
                        resetAsset(e);
                    }}
                >
                    <Reset />
                </div>
            )}

            {!assets.length || searchPending ? (
                <DropdownLoader />
            ) : (
                <DropdownArrow $isOpen={isOpen} />
            )}
            {isOpen && (
                <DropdownList>
                    {filteredAssets.map((assetItem) => (
                        <DropdownItem
                            onClick={() => onClickAsset(assetItem)}
                            key={assetItem.code + assetItem.issuer}
                        >
                            <Asset asset={assetItem} />
                        </DropdownItem>
                    ))}
                    {!filteredAssets.length && <SearchEmpty>Asset not found.</SearchEmpty>}
                </DropdownList>
            )}
        </DropDown>
    );
};

export default AssetDropdown;

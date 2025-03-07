import * as StellarSdk from '@stellar/stellar-sdk';
import { useEffect, useState } from 'react';

import { useDebounce } from 'hooks/useDebounce';

import useAssetsStore from 'store/assetsStore/useAssetsStore';

import { StellarService } from 'services/globalServices';

const domainPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
const domainRegexp = new RegExp(domainPattern);

const codeIssuerPattern = /^[a-zA-Z0-9]{1,12}:[a-zA-Z0-9]{56}$/;
const codeIssuerRegexp = new RegExp(codeIssuerPattern);

export default function useAssetsSearch(searchState) {
    const [searchPending, setSearchPending] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    const { processNewAssets } = useAssetsStore();

    const debouncedSearchText = useDebounce(searchState, 700);

    const resolveCurrencies = (domain: string) => {
        setSearchPending(true);

        StellarSdk.StellarToml.Resolver.resolve(domain)
            .then(({ CURRENCIES }) => {
                if (CURRENCIES) {
                    processNewAssets(CURRENCIES);
                    setSearchResults(CURRENCIES);
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

    return { searchPending, searchResults };
}

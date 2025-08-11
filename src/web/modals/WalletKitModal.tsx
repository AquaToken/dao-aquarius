import { HOTWALLET_ID } from '@creit.tech/stellar-wallets-kit';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { WalletKitService } from 'services/globalServices';

import { ModalProps } from 'types/modal';

import ArrowRightIcon from 'assets/icon-arrow-right.svg';

import ExternalLink from 'basics/ExternalLink';
import Label from 'basics/Label';
import { ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

import {
    LoginMethod,
    LoginMethodDescription,
    LoginMethodName,
    LoginMethodWithDescription,
} from './auth/ChooseLoginMethodModal';

const ArrowRight = styled(ArrowRightIcon)`
    margin-left: auto;
    min-width: 1.6rem;
`;

interface Modules {
    productName: string;
    productIcon: string;
    productUrl: string;
    productId: string;
    isAvailable: () => Promise<boolean>;
}

const WalletKitModal = ({ params, close }: ModalProps<{ modules: Modules[] }>) => {
    const [isAvailableMap, setIsAvailableMap] = useState(null);

    const { modules } = params;

    useEffect(() => {
        Promise.all(modules.map(({ isAvailable }) => isAvailable())).then(results => {
            const map = new Map();

            results.forEach((isAvailable, index) => {
                map.set(modules[index].productName, isAvailable);
            });

            setIsAvailableMap(map);
        });
    }, []);

    return (
        <ModalWrapper>
            <ModalTitle>Stellar Wallet Kit</ModalTitle>

            {params.modules.map(({ productName, productIcon, productUrl, productId }) => (
                <LoginMethod
                    key={productName}
                    onClick={() => {
                        if (isAvailableMap && !isAvailableMap.get(productName)) {
                            return;
                        }
                        close();
                        WalletKitService.login(productId);
                    }}
                >
                    <img src={productIcon} alt={productName} width={40} height={40} />
                    <LoginMethodWithDescription>
                        <LoginMethodName>
                            {productName} {productId === HOTWALLET_ID && <Label labelText="NEW!" />}
                        </LoginMethodName>
                        {isAvailableMap && !isAvailableMap.get(productName) && (
                            <LoginMethodDescription>
                                <ExternalLink href={productUrl}>Install</ExternalLink>
                            </LoginMethodDescription>
                        )}
                    </LoginMethodWithDescription>

                    <ArrowRight />
                </LoginMethod>
            ))}
        </ModalWrapper>
    );
};

export default WalletKitModal;

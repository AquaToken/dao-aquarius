import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import useAuthStore from 'store/authStore/useAuthStore';

import AccountService from 'services/account.service';
import { getFederation } from 'services/stellar/utils/resolvers';

import { flexRowSpaceBetween } from 'web/mixins';

import AccountBlock from 'components/AccountBlock';

import OtherAccountButton from './OtherAccountButton/OtherAccountButton';

const Wrapper = styled.div`
    ${flexRowSpaceBetween};
    width: 100%;
    margin-top: 7rem;
`;

interface AccountInfoBlockProps {
    account: AccountService;
}

const AccountInfoBlock = ({ account }: AccountInfoBlockProps) => {
    const [federation, setFederation] = useState(null);
    const accountId = account.accountId();

    const { isLogged } = useAuthStore();

    useEffect(() => {
        if (!account.home_domain) {
            return;
        }
        getFederation(account.home_domain, accountId).then(res => {
            setFederation(res);
        });
    }, []);

    return (
        <Wrapper>
            <AccountBlock federation={federation} accountId={accountId} />
            {!isLogged && <OtherAccountButton />}
        </Wrapper>
    );
};

export default AccountInfoBlock;

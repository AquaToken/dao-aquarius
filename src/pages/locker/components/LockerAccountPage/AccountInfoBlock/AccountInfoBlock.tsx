import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import OtherAccountButton from './OtherAccountButton/OtherAccountButton';

import AccountBlock from '../../../../../common/basics/AccountBlock';
import { flexRowSpaceBetween } from '../../../../../common/mixins';
import { StellarService } from '../../../../../common/services/globalServices';
import useAuthStore from '../../../../../store/authStore/useAuthStore';

const Wrapper = styled.div`
    ${flexRowSpaceBetween};
    width: 100%;
    margin-top: 7rem;
`;

const AccountInfoBlock = ({ account }) => {
    const [federation, setFederation] = useState(null);
    const accountId = account.accountId();

    const { isLogged } = useAuthStore();

    useEffect(() => {
        if (!account.home_domain) {
            return;
        }
        StellarService.resolveFederation(account.home_domain, accountId).then(res => {
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

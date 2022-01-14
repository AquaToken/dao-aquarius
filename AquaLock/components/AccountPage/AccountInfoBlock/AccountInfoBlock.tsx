import * as React from 'react';
import styled from 'styled-components';
import { flexRowSpaceBetween } from '../../../../common/mixins';
import { useEffect, useState } from 'react';
import { StellarService } from '../../../../common/services/globalServices';
import OtherAccountButton from './OtherAccountButton/OtherAccountButton';
import AccountBlock from '../../../../common/basics/AccountBlock';

const Wrapper = styled.div`
    ${flexRowSpaceBetween};
    width: 100%;
    margin-top: 7rem;
`;

const AccountInfoBlock = ({ account }) => {
    const [federation, setFederation] = useState(null);
    const accountId = account.accountId();

    useEffect(() => {
        if (!account.home_domain) {
            return;
        }
        StellarService.resolveFederation(account.home_domain, accountId).then((res) => {
            setFederation(res);
        });
    }, []);

    return (
        <Wrapper>
            <AccountBlock federation={federation} accountId={accountId} />
            <OtherAccountButton />
        </Wrapper>
    );
};

export default AccountInfoBlock;

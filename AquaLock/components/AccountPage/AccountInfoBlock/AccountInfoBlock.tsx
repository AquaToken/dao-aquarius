import * as React from 'react';
import styled from 'styled-components';
import createStellarIdenticon from 'stellar-identicon-js';
import { flexAllCenter, flexRowSpaceBetween } from '../../../../common/mixins';
import { COLORS } from '../../../../common/styles';
import { useEffect, useState } from 'react';
import { StellarService } from '../../../../common/services/globalServices';
import OtherAccountButton from './OtherAccountButton/OtherAccountButton';

const Wrapper = styled.div`
    ${flexRowSpaceBetween};
    width: 100%;
    margin-top: 7rem;
`;

const Account = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`;

const Identicon = styled.div`
    ${flexAllCenter};
    height: 4.8rem;
    width: 4.8rem;
    border-radius: 1rem;
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    margin-right: 0.8rem;
    background-color: ${COLORS.white};
`;

const IdenticonImage = styled.img`
    height: 3.2rem;
    width: 3.2rem;
`;

const AccountData = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const AccountId = styled.span`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
    opacity: 0.7;
`;

const Federation = styled.span`
    font-size: 1.6rem;
    line-height: 2.9rem;
    color: ${COLORS.descriptionText};
    opacity: 0.7;
`;

const AccountInfoBlock = ({ account }) => {
    const [federation, setFederation] = useState(null);
    const accountId = account.accountId();
    const url = createStellarIdenticon(accountId).toDataURL();
    const truncatedKey = `${accountId.slice(0, 8)}...${accountId.slice(-8)}`;

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
            <Account>
                <Identicon>
                    <IdenticonImage src={url} alt="" />
                </Identicon>
                <AccountData>
                    {federation && <Federation>{federation}</Federation>}
                    <AccountId>{truncatedKey}</AccountId>
                </AccountData>
            </Account>
            <OtherAccountButton />
        </Wrapper>
    );
};

export default AccountInfoBlock;

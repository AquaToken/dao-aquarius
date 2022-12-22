import * as React from 'react';
import styled from 'styled-components';
import { flexAllCenter } from '../mixins';
import { COLORS } from '../styles';
import createStellarIdenticon from 'stellar-identicon-js';

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

const AccountBlock = ({ accountId, federation }) => {
    const url = createStellarIdenticon(accountId).toDataURL();
    const truncatedKey = `${accountId.slice(0, 8)}...${accountId.slice(-8)}`;
    return (
        <Account>
            <Identicon>
                <IdenticonImage src={url} alt="" />
            </Identicon>
            <AccountData>
                {federation && <Federation>{federation}</Federation>}
                <AccountId>{truncatedKey}</AccountId>
            </AccountData>
        </Account>
    );
};

export default AccountBlock;

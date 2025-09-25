import * as React from 'react';
import createStellarIdenticon from 'stellar-identicon-js';
import styled from 'styled-components';

import { cardBoxShadow, flexAllCenter } from '../mixins';
import { COLORS } from '../styles';

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
    ${cardBoxShadow};
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
    color: ${COLORS.textGray};
    opacity: 0.7;
`;

const Federation = styled.span`
    font-size: 1.6rem;
    line-height: 2.9rem;
    color: ${COLORS.textSecondary};
    opacity: 0.7;
`;

interface AccountBlockProps {
    accountId: string;
    federation?: string;
}

const AccountBlock = ({ accountId, federation }: AccountBlockProps): React.ReactNode => {
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

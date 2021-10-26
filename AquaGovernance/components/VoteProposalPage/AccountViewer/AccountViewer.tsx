import * as React from 'react';
import createStellarIdenticon from 'stellar-identicon-js';
import styled from 'styled-components';
import { COLORS } from '../../../../common/styles';

const AccountViewerBlock = styled.div`
    display: flex;
    align-items: center;
    color: ${COLORS.paragraphText};
`;

const IdenticonImage = styled.img`
    height: 1.6rem;
    width: 1.6rem;
    margin-right: 0.8rem;
`;

const AccountViewer = ({ pubKey }: { pubKey: string }): JSX.Element => {
    const url = createStellarIdenticon(pubKey).toDataURL();
    const truncatedKey = `${pubKey.slice(0, 8)}...${pubKey.slice(-8)}`;

    return (
        <AccountViewerBlock>
            <IdenticonImage src={url} alt="IdentIcon" />
            <span>{truncatedKey}</span>
        </AccountViewerBlock>
    );
};

export default AccountViewer;

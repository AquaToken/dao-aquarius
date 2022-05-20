import * as React from 'react';
import createStellarIdenticon from 'stellar-identicon-js';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { respondDown } from '../../../../common/mixins';

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

const KeyWeb = styled.span<{ narrowForMobile?: boolean }>`
    ${({ narrowForMobile }) =>
        narrowForMobile &&
        respondDown(Breakpoints.lg)`
        display: none;
    `}
`;

const KeyMobile = styled.span<{ narrowForMobile?: boolean }>`
    display: none;

    ${({ narrowForMobile }) =>
        narrowForMobile &&
        respondDown(Breakpoints.lg)`
        display: inline;
    `}
`;

const AccountViewer = ({
    pubKey,
    narrowForMobile,
}: {
    pubKey: string;
    narrowForMobile?: boolean;
}): JSX.Element => {
    const url = createStellarIdenticon(pubKey).toDataURL();
    const truncatedKeyWeb = `${pubKey.slice(0, 8)}...${pubKey.slice(-8)}`;
    const truncatedKeyMobile = `G...${pubKey.slice(-3)}`;

    return (
        <AccountViewerBlock>
            <IdenticonImage src={url} alt="IdentIcon" />
            <KeyWeb narrowForMobile={narrowForMobile}>{truncatedKeyWeb}</KeyWeb>
            <KeyMobile narrowForMobile={narrowForMobile}>{truncatedKeyMobile}</KeyMobile>
        </AccountViewerBlock>
    );
};

export default AccountViewer;

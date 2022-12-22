import * as React from 'react';
import createStellarIdenticon from 'stellar-identicon-js';
import styled from 'styled-components';
import { COLORS } from '../styles';

const IdenticonBlock = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: ${COLORS.white};
    border: 0.2rem solid ${COLORS.lightGray};
    box-sizing: border-box;
    border-radius: 50%;
`;

const IdenticonImage = styled.img`
    height: 50%;
    width: 50%;
`;

const Identicon = ({ pubKey }: { pubKey: string }): JSX.Element => {
    const url = createStellarIdenticon(pubKey).toDataURL();

    return (
        <IdenticonBlock>
            <IdenticonImage src={url} alt="" />
        </IdenticonBlock>
    );
};

export default Identicon;

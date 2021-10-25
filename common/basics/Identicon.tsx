import * as React from 'react';
import createStellarIdenticon from 'stellar-identicon-js';
import styled from 'styled-components';
import { COLORS } from '../styles';

const IdenticonBlock = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 4.8rem;
    height: 4.8rem;
    background: ${COLORS.white};
    border: 0.2rem solid ${COLORS.lightGray};
    box-sizing: border-box;
    border-radius: 50%;
`;

const IdenticonImage = styled.img`
    height: 2.4rem;
    width: 2.4rem;
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

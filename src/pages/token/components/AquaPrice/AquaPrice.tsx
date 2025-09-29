import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getAssetDetails } from 'api/stellar-expert';

import { getAquaAssetData } from 'helpers/assets';

import { StellarService } from 'services/globalServices';

import { ExpertAssetData } from 'types/api-stellar-expert';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import { DotsLoader } from 'basics/loaders';

import Changes24 from 'components/Changes24';

const Container = styled.div`
    display: flex;
    align-items: center;
    position: absolute;
    right: 0;
    height: 7rem;
    border-radius: 2.4rem;
    padding: 2.4rem;
    background: radial-gradient(
        90.16% 143.01% at 15.32% 21.04%,
        rgba(234, 191, 255, 0.2) 0%,
        rgba(234, 191, 255, 0.0447917) 77.08%,
        rgba(234, 191, 255, 0) 100%
    );

    border: 0.1rem solid ${COLORS.purple100};

    backdrop-filter: blur(80px);
    -webkit-backdrop-filter: blur(80px);
    color: ${COLORS.white};

    ${respondDown(Breakpoints.lg)`
        top: calc(100% + 3.6rem);
        left: 0;
        right: unset;
        color: ${COLORS.textTertiary};
        width: 34rem;
    `}

    ${respondDown(Breakpoints.sm)`
        width: 100%;
        height: 5.2rem;
    `}
`;

const Label = styled.span`
    font-size: 1.6rem;
    margin-right: auto;
`;

const Value = styled.span`
    font-size: 2rem;
    font-weight: 700;
    margin-right: 0.8rem;
    margin-left: 5.6rem;

    ${respondDown(Breakpoints.sm)`
        margin-left: 0.8rem;
    `}
`;

const AquaPrice = ({ ...props }) => {
    const [price, setPrice] = useState(null);
    const [expertData, setExpertData] = useState<ExpertAssetData>(undefined);

    useEffect(() => {
        StellarService.price.getAquaUsdPrice().then(res => {
            setPrice(res.toFixed(7));
        });
        getAssetDetails(getAquaAssetData().aquaStellarAsset).then(res => {
            setExpertData(res);
        });
    }, []);

    return (
        <Container {...props}>
            <Label>Price:</Label>
            {price ? (
                <>
                    <Value>${price}</Value>
                    <Changes24 expertData={expertData} withWrapper />
                </>
            ) : (
                <DotsLoader />
            )}
        </Container>
    );
};

export default AquaPrice;

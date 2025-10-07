import * as React from 'react';
import { useEffect, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';

import { getAssetDetails } from 'api/stellar-expert';

import { getAquaAssetData } from 'helpers/assets';

import { StellarService } from 'services/globalServices';

import { ExpertAssetData } from 'types/api-stellar-expert';

import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import { DotsLoader } from 'basics/loaders';

import Changes24 from 'components/Changes24';

/* -------------------------------------------------------------------------- */
/*                                 Animations                                 */
/* -------------------------------------------------------------------------- */

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const Container = styled.div<{ $visible: boolean }>`
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
    width: 34rem;

    border: 0.1rem solid ${COLORS.purple100};
    backdrop-filter: blur(80px);
    -webkit-backdrop-filter: blur(80px);
    color: ${COLORS.white};
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;

    ${({ $visible }) =>
        $visible &&
        css`
            opacity: 1;
            transform: translateY(0);
        `}

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

const Inner = styled.div<{ $visible: boolean }>`
    display: flex;
    align-items: center;
    width: 100%;
    opacity: 0;
    ${({ $visible }) =>
        $visible &&
        css`
            animation: ${fadeIn} 0.8s ease-out 0.2s both;
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

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

const AquaPrice = ({ ...props }) => {
    const [price, setPrice] = useState<string | null>(null);
    const [expertData, setExpertData] = useState<ExpertAssetData>();
    const [visible, setVisible] = useState(false);
    const [contentVisible, setContentVisible] = useState(false);

    useEffect(() => {
        const timer1 = setTimeout(() => setVisible(true), 100); // плавное появление контейнера
        const timer2 = setTimeout(() => setContentVisible(true), 600); // контент чуть позже

        StellarService.price.getAquaUsdPrice().then(res => {
            setPrice(res.toFixed(7));
        });
        getAssetDetails(getAquaAssetData().aquaStellarAsset).then(res => {
            setExpertData(res);
        });

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    return (
        <Container {...props} $visible={visible}>
            <Inner $visible={contentVisible}>
                <Label>Price:</Label>
                {price ? (
                    <>
                        <Value>${price}</Value>
                        <Changes24 expertData={expertData} withWrapper />
                    </>
                ) : (
                    <DotsLoader />
                )}
            </Inner>
        </Container>
    );
};

export default AquaPrice;

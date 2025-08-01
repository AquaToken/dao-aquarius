import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { MainRoutes } from 'constants/routes';

import { getAquaAssetData, getAssetFromString, getAssetString } from 'helpers/assets';

import { StellarService } from 'services/globalServices';

import { Token } from 'types/token';

import { commonMaxWidth, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import PageLoader from 'basics/loaders/PageLoader';

import SwapForm from '../components/SwapForm/SwapForm';

const Container = styled.main`
    background-color: ${COLORS.lightGray};
    height: 100%;
    position: relative;
    display: flex;
    flex: 1 0 auto;
    flex-direction: column;
    scroll-behavior: smooth;
    overflow: auto;

    ${respondDown(Breakpoints.sm)`
        background-color: ${COLORS.white};
    `}
`;

const Content = styled.div`
    ${commonMaxWidth};
    width: 100%;
    padding: 6.3rem 4rem 0;

    ${respondDown(Breakpoints.sm)`
        padding: 1.6rem 0;
    `}
`;

const SwapPage = () => {
    const [base, setBase] = useState(null);

    const [counter, setCounter] = useState(null);

    const params = useParams<{ source: string; destination: string }>();
    const history = useHistory();
    const { aquaAssetString } = getAquaAssetData();

    useEffect(() => {
        const { source, destination } = params;

        if (source === destination && !base && !counter) {
            history.replace(
                `${MainRoutes.swap}/${getAssetString(
                    StellarService.createLumen() as Token,
                )}/${aquaAssetString}`,
            );
            return;
        }

        if (!base || getAssetString(base) !== source) {
            getAssetFromString(source, token => {
                setBase(token);
            });
        }

        if (!counter || getAssetString(counter) !== destination) {
            getAssetFromString(destination, token => {
                setCounter(token);
            });
        }

        if (source === destination) {
            history.replace(
                `${MainRoutes.swap}/${getAssetString(counter)}/${getAssetString(base)}`,
            );
            return;
        }
    }, [params]);

    const setSource = asset => {
        history.push(`${MainRoutes.swap}/${getAssetString(asset)}/${getAssetString(counter)}`);
    };

    const setDestination = asset => {
        history.push(`${MainRoutes.swap}/${getAssetString(base)}/${getAssetString(asset)}`);
    };

    if (!base || !counter) {
        return <PageLoader />;
    }

    return (
        <Container>
            <Content>
                <SwapForm
                    base={base}
                    counter={counter}
                    setBase={setSource}
                    setCounter={setDestination}
                />
            </Content>
        </Container>
    );
};

export default SwapPage;

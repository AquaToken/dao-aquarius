import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { getAssetsList } from 'api/amm';

import { MainRoutes } from 'constants/routes';

import { getAquaAssetData, getAssetFromString, getAssetString } from 'helpers/assets';
import { createLumen, getTokensFromCache } from 'helpers/token';

import useAssetsStore from 'store/assetsStore/useAssetsStore';

import { Token } from 'types/token';

import { respondDown } from 'web/mixins';
import { PageContainer } from 'web/pages/commonPageStyles';
import { Breakpoints, COLORS } from 'web/styles';

import PageLoader from 'basics/loaders/PageLoader';

import SwapForm from '../components/SwapForm/SwapForm';

const Wrapper = styled.div`
    padding-top: 6.3rem;

    ${respondDown(Breakpoints.sm)`
        padding-top: 1.6rem;
    `}
`;

const SwapPage = () => {
    const [base, setBase] = useState(null);
    const [counter, setCounter] = useState(null);
    const [assetsList, setAssetsList] = useState(getTokensFromCache());

    const params = useParams<{ source: string; destination: string }>();
    const history = useHistory();
    const { aquaAssetString } = getAquaAssetData();

    const { processNewAssets } = useAssetsStore();

    useEffect(() => {
        getAssetsList().then(res => {
            processNewAssets(res);
            setAssetsList(res);
        });
    }, []);

    useEffect(() => {
        const { source, destination } = params;

        if (source === destination && !base && !counter) {
            history.replace(
                `${MainRoutes.swap}/${getAssetString(createLumen() as Token)}/${aquaAssetString}`,
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

    if (!base || !counter || !assetsList) {
        return <PageLoader />;
    }

    return (
        <PageContainer $color={COLORS.gray50} $mobileColor={COLORS.white}>
            <Wrapper>
                <SwapForm
                    base={base}
                    counter={counter}
                    setBase={setSource}
                    setCounter={setDestination}
                    assetsList={assetsList}
                />
            </Wrapper>
        </PageContainer>
    );
};

export default SwapPage;

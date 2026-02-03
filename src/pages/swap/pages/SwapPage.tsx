import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { getAssetsList } from 'api/amm';

import { AppRoutes } from 'constants/routes';

import { getAquaAssetData, getAssetFromString, getAssetString } from 'helpers/assets';
import { createLumen, getTokensFromCache } from 'helpers/token';

import useAssetsStore from 'store/assetsStore/useAssetsStore';

import PageLoader from 'basics/loaders/PageLoader';

import { PageContainer } from 'styles/commonPageStyles';
import { respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

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
    const navigate = useNavigate();
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
            navigate(
                AppRoutes.section.swap.to.index({
                    source: getAssetString(createLumen()),
                    destination: aquaAssetString,
                }),
                { replace: true },
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
            navigate(
                AppRoutes.section.swap.to.index({
                    source: getAssetString(counter),
                    destination: getAssetString(base),
                }),
                {
                    replace: true,
                },
            );
            return;
        }
    }, [params]);

    const setSource = asset => {
        navigate(
            AppRoutes.section.swap.to.index({
                source: getAssetString(asset),
                destination: getAssetString(counter),
            }),
        );
    };

    const setDestination = asset => {
        navigate(
            AppRoutes.section.swap.to.index({
                source: getAssetString(base),
                destination: getAssetString(asset),
            }),
        );
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

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';

import PageLoader from '../../../common/basics/PageLoader';
import { getAssetFromString, getAssetString } from '../../../common/helpers/helpers';
import { commonMaxWidth, respondDown } from '../../../common/mixins';
import { StellarService } from '../../../common/services/globalServices';
import { AQUA_CODE, AQUA_ISSUER } from '../../../common/services/stellar.service';
import { Breakpoints, COLORS } from '../../../common/styles';
import { MainRoutes } from '../../../routes';
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
    padding-bottom: 8rem;
`;

const Content = styled.div`
    ${commonMaxWidth};
    width: 100%;
    padding: 6.3rem 4rem 0;

    ${respondDown(Breakpoints.md)`
        padding: 4rem 1.6rem 0;
    `}
`;

const SwapPage = () => {
    const [base, setBase] = useState(null);

    const [counter, setCounter] = useState(null);

    const params = useParams<{ source: string; destination: string }>();
    const history = useHistory();

    useEffect(() => {
        const { source, destination } = params;

        if (source === destination) {
            history.replace(
                `${MainRoutes.swap}/${getAssetString(
                    StellarService.createLumen(),
                )}/${getAssetString(StellarService.createAsset(AQUA_CODE, AQUA_ISSUER))}`,
            );
            return;
        }

        setBase(getAssetFromString(source));
        setCounter(getAssetFromString(destination));
    }, [params]);

    if (!base || !counter) {
        return <PageLoader />;
    }

    return (
        <Container>
            <Content>
                <SwapForm base={base} counter={counter} />
            </Content>
        </Container>
    );
};

export default SwapPage;

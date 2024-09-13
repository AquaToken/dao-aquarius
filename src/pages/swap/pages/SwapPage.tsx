import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { commonMaxWidth, flexAllCenter, respondDown } from '../../../common/mixins';
import AssetDropdown from '../../vote/components/AssetDropdown/AssetDropdown';
import { Breakpoints, COLORS } from '../../../common/styles';
import useAuthStore from '../../../store/authStore/useAuthStore';
import {
    ModalService,
    SorobanService,
    StellarService,
    ToastService,
} from '../../../common/services/globalServices';
import PageLoader from '../../../common/basics/PageLoader';
import Input from '../../../common/basics/Input';
import SwapIcon from '../../../common/assets/img/icon-arrows-circle.svg';

import Revert from '../../../common/assets/img/icon-revert.svg';
import { useDebounce } from '../../../common/hooks/useDebounce';
import Button from '../../../common/basics/Button';
import { IconFail } from '../../../common/basics/Icons';
import ChooseLoginMethodModal from '../../../common/modals/ChooseLoginMethodModal';
import { formatBalance, getAssetFromString, getAssetString } from '../../../common/helpers/helpers';
import SwapConfirmModal from '../components/SwapConfirmModal/SwapConfirmModal';
import { findSwapPath } from '../../amm/api/api';
import { useHistory, useParams } from 'react-router-dom';
import { MainRoutes } from '../../../routes';
import { AQUA_CODE, AQUA_ISSUER } from '../../../common/services/stellar.service';
import Tooltip, { TOOLTIP_POSITION } from '../../../common/basics/Tooltip';
import MainNetWarningModal, {
    SHOW_PURPOSE_ALIAS_MAIN_NET,
} from '../../../common/modals/MainNetWarningModal';
import AmountUsdEquivalent from '../components/SwapForm/AmountUsdEquivalent/AmountUsdEquivalent';
import NoTrustline from '../../../common/components/NoTrustline/NoTrustline';
import SwapFormHeader from '../components/SwapForm/SwapFormHeader/SwapFormHeader';
import SwapFormRow from '../components/SwapForm/SwapFormRow/SwapFormRow';
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

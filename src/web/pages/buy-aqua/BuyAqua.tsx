import { Redirect } from 'react-router-dom';
import styled from 'styled-components';

import { MainRoutes } from 'constants/routes';

import { getAquaAssetData } from 'helpers/assets';
import { getEnv } from 'helpers/env';
import { getOnRampWidgetUrl } from 'helpers/url';

import useAuthStore from 'store/authStore/useAuthStore';

import { cardBoxShadow, flexAllCenter, flexColumn } from 'web/mixins';
import { COLORS } from 'web/styles';

import NoTrustline from 'components/NoTrustline';

const CenteredWrapper = styled.div`
    ${flexAllCenter};
    overflow-x: hidden;
`;

const Container = styled.div`
    ${cardBoxShadow};
    ${flexColumn};
    background-color: ${COLORS.white};
    width: 62.4rem;
    margin-top: 14.4rem;
    margin-bottom: 18rem;
    padding: 4.8rem;
`;

const BuyAqua = (): JSX.Element => {
    const { account, isLogged } = useAuthStore();
    const { aquaStellarAsset } = getAquaAssetData();

    const hasTrustline = account?.getAssetBalance(aquaStellarAsset) !== null;

    const frameParams = {
        theme: 'light',
        widgetId: 'aquarius',
        walletAddress: account?.accountId(),
        lockDefaultAsset: true,
        defaultAsset: 'aqua-2',
        defaultNetwork: 'stellar',
        backgroundColor: 'transparent',
        textColor: COLORS.titleText.substring(1),
        buttonBackground: COLORS.buttonBackground.substring(1),
        successColor: COLORS.green.substring(1),
        errorColor: COLORS.pinkRed.substring(1),
        iconsColor: COLORS.purple.substring(1),
        // substring here cause of url params can't have # symbol
    };

    if (!isLogged) {
        return <Redirect to={MainRoutes.main} />;
    }

    return (
        <CenteredWrapper>
            {hasTrustline ? (
                <iframe
                    src={getOnRampWidgetUrl(frameParams)}
                    width="430px"
                    height="730px"
                    referrerPolicy="no-referrer"
                />
            ) : (
                <Container>
                    <NoTrustline asset={aquaStellarAsset} />
                </Container>
            )}
        </CenteredWrapper>
    );
};

export default BuyAqua;

import { Navigate } from 'react-router-dom';

import { AppRoutes } from 'constants/routes';

import { getAquaAssetData } from 'helpers/assets';
import { getOnRampWidgetUrl } from 'helpers/url';

import useAuthStore from 'store/authStore/useAuthStore';

import NoTrustline from 'components/NoTrustline';

import { COLORS } from 'styles/style-constants';

import { CenteredWrapper, Container } from './BuyAqua.styled';

const BuyAqua = (): JSX.Element => {
    const { account, isLogged } = useAuthStore();
    const { aquaStellarAsset } = getAquaAssetData();

    const hasTrustline = account?.getAssetBalance(aquaStellarAsset) !== null;

    const frameParams = {
        theme: 'light',
        publicKey: 'pk_prod_01JVXZ2X7BD2KD4XX3E2RD974K',
        walletAddress: account?.accountId(),
        lockDefaultAsset: true,
        defaultAsset: 'aqua-2',
        defaultNetwork: 'stellar',
        backgroundColor: 'transparent',
        textColor: COLORS.textPrimary.substring(1),
        buttonBackground: COLORS.purple950.substring(1),
        successColor: COLORS.green500.substring(1),
        errorColor: COLORS.red500.substring(1),
        iconsColor: COLORS.purple500.substring(1),
        // substring here cause of url params can't have # symbol
    };

    if (!isLogged) {
        return <Navigate to={AppRoutes.page.main} replace />;
    }

    return (
        <CenteredWrapper>
            {hasTrustline ? (
                <iframe
                    src={getOnRampWidgetUrl(frameParams)}
                    width="430"
                    height="730"
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

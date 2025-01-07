import styled from 'styled-components';

import { getAquaAssetData } from 'helpers/assets';
import { getEnv } from 'helpers/env';
import { getOnRampWidgetUrl } from 'helpers/url';

import useAuthStore from 'store/authStore/useAuthStore';

import { cardBoxShadow, flexAllCenter, flexColumn } from 'web/mixins';
import { COLORS } from 'web/styles';

import NoTrustline from 'components/NoTrustline';

const CenteredWrapper = styled.div`
    ${flexAllCenter};
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
    const { account } = useAuthStore();

    const { aquaCode, aquaIssuer, aquaStellarAsset } = getAquaAssetData();

    const hasTrustline = account?.getAssetBalance(aquaStellarAsset) !== null;

    const frameParams = {
        theme: 'light',
        env: getEnv(),
        assetcode: aquaCode,
        assetissuer: aquaIssuer,
        useraddress: account?.accountId(),
    };

    return (
        <CenteredWrapper>
            {hasTrustline ? (
                <iframe
                    src={getOnRampWidgetUrl(frameParams)}
                    width="430px"
                    height="690px"
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

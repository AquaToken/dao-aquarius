import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../../../../common/styles';
import { flexAllCenter } from '../../../../common/mixins';
import AquaLogo from '../../../../common/assets/img/aqua-logo-small.svg';
import Xlm from '../../../../common/assets/img/xlm-logo.svg';
import YXlmLogo from '../../../../common/assets/img/yxlm-logo.svg';
import AccountService from '../../../../common/services/account.service';
import { formatBalance } from '../../../../common/helpers/helpers';
import PageLoader from '../../../../common/basics/PageLoader';
import { StellarService } from '../../../../common/services/globalServices';
import { yXLM_CODE, yXLM_ISSUER } from '../../../../common/services/stellar.service';

const Container = styled.div`
    margin-top: 6.3rem;
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.white};
    border-radius: 0.5rem;
    padding: 3.2rem 3.2rem 4.2rem;
`;

const XlmLogo = styled(Xlm)`
    width: 2.5rem;
`;

const Title = styled.span`
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.titleText};
    margin-bottom: 3.2rem;
    font-weight: bold;
`;

const Balances = styled.div`
    display: flex;
    flex-direction: row;
`;

const Balance = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex: 1;
`;

const AssetRow = styled.div`
    ${flexAllCenter};
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.descriptionText};
    margin-bottom: 1.6rem;

    svg {
        height: 2.4rem;
        width: 2.4rem;
        margin-right: 0.8rem;
    }
`;

const AssetBalance = styled.span`
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.titleText};
    font-weight: bold;
    margin-bottom: 1.6rem;
`;

const AmmBalance = styled.div`
    display: flex;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.titleText};

    &:before {
        content: 'AMM';
        height: 1.9rem;
        width: 4.1rem;
        border-radius: 0.3rem;
        text-align: center;
        line-height: 1.9rem;
        font-size: 1rem;
        font-weight: bold;
        background: ${COLORS.yellow};
        color: ${COLORS.titleText};
        margin-right: 0.7rem;
    }
`;

const Portfolio = ({
    ammReserves,
    currentAccount,
}: {
    ammReserves: { AQUA: number; XLM: number; yXLM: number };
    currentAccount: AccountService;
}) => {
    if (!currentAccount || !ammReserves) {
        return (
            <Container>
                <PageLoader />
            </Container>
        );
    }
    const aquaBalance = currentAccount.getAquaBalance();
    const yXLmBalance = currentAccount.getAssetBalance(
        StellarService.createAsset(yXLM_CODE, yXLM_ISSUER),
    );
    return (
        <Container>
            <Title>Portfolio</Title>
            <Balances>
                <Balance>
                    <AssetRow>
                        <AquaLogo />
                        <span>AQUA</span>
                    </AssetRow>
                    <AssetBalance>{formatBalance(aquaBalance, true)} AQUA</AssetBalance>
                    {Boolean(ammReserves?.AQUA) && (
                        <AmmBalance>+{formatBalance(ammReserves.AQUA, true)} AQUA</AmmBalance>
                    )}
                </Balance>
                <Balance>
                    <AssetRow>
                        <XlmLogo />
                        <span>Lumens</span>
                    </AssetRow>
                    <AssetBalance>
                        {formatBalance(
                            currentAccount.getAssetBalance(StellarService.createLumen()),
                            true,
                        )}{' '}
                        XLM
                    </AssetBalance>
                    {Boolean(ammReserves?.XLM) && (
                        <AmmBalance>+{formatBalance(ammReserves.XLM, true)} XLM</AmmBalance>
                    )}
                </Balance>
                {Boolean()}
                <Balance>
                    <AssetRow>
                        <YXlmLogo />
                        <span>yXLM</span>
                    </AssetRow>
                    <AssetBalance>{formatBalance(yXLmBalance, true)} yXLM</AssetBalance>
                    {Boolean(ammReserves?.yXLM) && (
                        <AmmBalance>+{formatBalance(ammReserves.yXLM, true)} yXLM</AmmBalance>
                    )}
                </Balance>
            </Balances>
        </Container>
    );
};

export default Portfolio;

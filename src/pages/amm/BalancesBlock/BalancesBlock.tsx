import * as React from 'react';
import styled from 'styled-components';
import useAuthStore from '../../../store/authStore/useAuthStore';
import { useEffect, useState } from 'react';
import { Header, Title } from '../../profile/AmmRewards/AmmRewards';
import PageLoader from '../../../common/basics/PageLoader';
import Asset from '../../vote/components/AssetDropdown/Asset';
import useAssetsStore from '../../../store/assetsStore/useAssetsStore';
import { formatBalance } from '../../../common/helpers/helpers';
import Button from '../../../common/basics/Button';
import { COLORS } from '../../../common/styles';
import { IconFail, IconSuccess } from '../../../common/basics/Icons';

const Container = styled.div`
    display: flex;
    flex-direction: column;
`;

const BalanceLine = styled.div`
    display: flex;
    border-top: 0.1rem solid ${COLORS.gray};
    padding: 0.4rem 0;
    align-items: center;

    &:first-child {
        font-weight: 700;
        margin-bottom: 2rem;
        border-top: none;
    }

    &:last-child {
        margin-bottom: 5rem;
        border-bottom: 0.1rem solid ${COLORS.gray};
    }

    div {
        flex: 1;
    }
`;

const BalancesBlock = () => {
    const { account } = useAuthStore();
    const { processNewAssets } = useAssetsStore();
    const [balances, setBalances] = useState(null);
    const [showBalances, setShowBalances] = useState(false);

    useEffect(() => {
        if (account) {
            account.getBalancesWithSmartContracts().then((res) => {
                setBalances(res);
                processNewAssets(res.map(({ asset }) => asset));
            });
        }
    }, [account]);

    return (
        <Container>
            <Header>
                <Title>Balances</Title>
                <Button isSmall onClick={() => setShowBalances((prevState) => !prevState)}>
                    {showBalances ? 'Hide balances' : 'Show balances'}
                </Button>
            </Header>
            {showBalances ? (
                !balances ? (
                    <PageLoader />
                ) : (
                    <div>
                        <BalanceLine>
                            <div>Asset</div>
                            <div>Balance</div>
                            <div>Has deployed contract</div>
                        </BalanceLine>
                        {balances.map(({ asset, balance, isDeployed, contractId }) => (
                            <BalanceLine key={contractId}>
                                <div>
                                    <Asset asset={asset} />
                                </div>
                                <div>{formatBalance(+balance)}</div>
                                <div>{isDeployed ? <IconSuccess /> : <IconFail />}</div>
                            </BalanceLine>
                        ))}
                    </div>
                )
            ) : null}
        </Container>
    );
};

export default BalancesBlock;

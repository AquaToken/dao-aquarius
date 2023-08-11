import * as React from 'react';
import styled from 'styled-components';
import { commonMaxWidth, respondDown } from '../../common/mixins';
import {
    Cell,
    Header,
    InOffers,
    PairCell,
    Section,
    Table,
    TableBodyRow,
    Title,
} from '../profile/AmmRewards/AmmRewards';
import PageLoader from '../../common/basics/PageLoader';
import { TableBody, TableHead, TableHeadRow } from '../vote/components/MainPage/Table/Table';
import { ModalService, SorobanService, ToastService } from '../../common/services/globalServices';
import Pair from '../vote/components/common/Pair';
import { formatBalance } from '../../common/helpers/helpers';
import useAuthStore from '../../store/authStore/useAuthStore';
import { useEffect, useMemo, useState } from 'react';
import * as SorobanClient from 'soroban-client';
import BalancesBlock from './BalancesBlock/BalancesBlock';
import AssetDropdown from '../vote/components/AssetDropdown/AssetDropdown';
import { Breakpoints, COLORS } from '../../common/styles';
import DotsLoader from '../../common/basics/DotsLoader';
import Button from '../../common/basics/Button';
import DepositToPool from './DepositToPool/DepositToPool';
import SuccessModal from './SuccessModal/SuccessModal';

const Container = styled.main`
    height: 100%;
    position: relative;
    display: flex;
    flex: 1 0 auto;
    flex-direction: column;
    scroll-behavior: smooth;
    overflow: auto;
`;

const Content = styled.div`
    ${commonMaxWidth};
    width: 100%;
    padding: 6.3rem 4rem 0;
`;

const PairSearch = styled.div`
    height: 17rem;
    width: 100%;
    background: ${COLORS.white};
    box-shadow: 0 20px 30px rgba(0, 6, 54, 0.06);
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4.8rem;
    box-sizing: border-box;
    gap: 5rem;

    ${respondDown(Breakpoints.md)`
        margin-top: 3rem;
        flex-direction: column;
        box-shadow: unset;
        padding: 0;
        margin-bottom: 8rem; 
        background: ${COLORS.transparent};
    `}
`;

const ButtonCell = styled.div`
    flex: 2.5;
    gap: 1rem;
    display: flex;
    align-items: center;
    justify-content: flex-end;
`;

export const USDT = new SorobanClient.Asset(
    'USDT',
    'GAHPYWLK6YRN7CVYZOO4H3VDRZ7PVF5UJGLZCSPAEIKJE2XSWF5LAGER',
);
export const USDC = new SorobanClient.Asset(
    'USDC',
    'GAHPYWLK6YRN7CVYZOO4H3VDRZ7PVF5UJGLZCSPAEIKJE2XSWF5LAGER',
);

const Amm = ({ balances }) => {
    const { account, isLogged } = useAuthStore();

    const [base, setBase] = useState(USDT);
    const [counter, setCounter] = useState(USDC);
    const [poolId, setPoolId] = useState(null);
    const [baseShares, setBaseShares] = useState(null);
    const [counterShares, setCounterShares] = useState(null);
    const [shareId, setShareId] = useState(null);
    const [accountShares, setAccountShares] = useState(null);
    const [getTokenPending, setGetTokenPending] = useState(false);
    const [withdrawPending, setWithdrawPending] = useState(false);

    useEffect(() => {
        if (isLogged) {
            SorobanService.getPoolIdTx(account?.accountId(), base, counter)
                .then((tx) => account.signAndSubmitTx(tx as SorobanClient.Transaction, true))
                .then((res) => {
                    setPoolId(res.value().value().toString('hex'));
                });
        }
    }, [isLogged, base, counter]);

    useEffect(() => {
        if (!poolId) {
            return;
        }

        getData();
    }, [poolId]);

    useEffect(() => {
        setPoolId(null);
        setBaseShares(null);
        setCounterShares(null);
        setAccountShares(null);
        setShareId(null);
    }, [base, counter]);

    const getData = () => {
        SorobanService.getTokenBalance(account?.accountId(), base, poolId).then((res) => {
            setBaseShares(res);
        });
        SorobanService.getTokenBalance(account?.accountId(), counter, poolId).then((res) => {
            setCounterShares(res);
        });

        SorobanService.getPoolShareId(account?.accountId(), poolId).then((shareId) => {
            setShareId(shareId);
            SorobanService.getTokenBalance(account?.accountId(), shareId, account.accountId()).then(
                (res) => {
                    setAccountShares(res);
                },
            );
        });
    };

    const neededInTestAssets =
        account?.getAssetBalance(USDT) === null || account?.getAssetBalance(USDC) === null;

    const getTestTokens = () => {
        setGetTokenPending(true);

        SorobanService.getAddTrustTx(account?.accountId())
            .then((tx) => account.signAndSubmitTx(tx))
            .then(() => SorobanService.getTestAssets(account?.accountId()))
            .then(() => {
                ToastService.showSuccessToast('Test tokens have been received');
                setGetTokenPending(false);
            })
            .catch(() => {
                setGetTokenPending(false);
            });
    };

    const openDepositModal = () => {
        ModalService.openModal(DepositToPool, { base, counter, poolId }).then(({ isConfirmed }) => {
            if (isConfirmed) {
                getData();
            }
        });
    };

    const withdrawAll = () => {
        setWithdrawPending(true);

        const baseId = SorobanService.getAssetContractId(base);
        const counterId = SorobanService.getAssetContractId(counter);

        const [firstAsset, secondAsset] = baseId > counterId ? [counter, base] : [base, counter];

        SorobanService.getGiveAllowanceTx(account?.accountId(), poolId, shareId, accountShares)
            .then((tx) => account.signAndSubmitTx(tx as SorobanClient.Transaction, true))
            .then(() =>
                SorobanService.getWithdrawTx(
                    account?.accountId(),
                    poolId,
                    firstAsset,
                    secondAsset,
                    '0.0000001',
                    '0.0000001',
                    shareId,
                    accountShares,
                ),
            )
            .then((tx) => account.signAndSubmitTx(tx as SorobanClient.Transaction, true))
            .then((res) => {
                const [baseAmount, counterAmount] = res.value();

                ModalService.confirmAllModals();

                ModalService.openModal(SuccessModal, {
                    base,
                    counter,
                    baseAmount: SorobanService.i128ToInt(baseAmount.value()),
                    counterAmount: SorobanService.i128ToInt(counterAmount.value()),
                    title: 'Success withdraw',
                });
                getData();
                setWithdrawPending(false);
            })
            .catch((e) => {
                console.log(e);
                ToastService.showErrorToast('Oops! Something went wrong');
                setWithdrawPending(false);
            });
    };

    const assets = useMemo(() => {
        return balances?.filter(({ isDeployed }) => isDeployed).map(({ asset }) => asset);
    }, [balances]);

    if (!account || !assets) {
        return <PageLoader />;
    }

    return (
        <Container>
            <Content>
                <BalancesBlock balances={balances} />
                <Header>
                    <Title>Liquidity overview</Title>
                </Header>
                <Header>
                    <PairSearch>
                        <AssetDropdown
                            asset={base}
                            onUpdate={setBase}
                            assetsList={assets}
                            exclude={counter}
                            withoutReset
                            pending={!poolId}
                        />
                        <AssetDropdown
                            asset={counter}
                            onUpdate={setCounter}
                            assetsList={assets}
                            exclude={base}
                            withoutReset
                            pending={!poolId}
                        />
                    </PairSearch>
                </Header>

                {neededInTestAssets && (
                    <Button isBig onClick={() => getTestTokens()} pending={getTokenPending}>
                        GET TEST TOKENS
                    </Button>
                )}

                <Section>
                    <Table>
                        <TableHead>
                            <TableHeadRow>
                                <PairCell>Pair</PairCell>
                                <Cell>Total locked in pool</Cell>
                                <Cell>Account shares</Cell>
                                <ButtonCell />
                            </TableHeadRow>
                        </TableHead>

                        <TableBody>
                            <TableBodyRow>
                                <PairCell>
                                    <Pair
                                        base={base}
                                        counter={counter}
                                        withoutLink
                                        mobileVerticalDirections
                                    />
                                </PairCell>
                                <Cell>
                                    <label>Total locked in pool:</label>
                                    <InOffers>
                                        <div>
                                            {baseShares !== null ? (
                                                `${formatBalance(baseShares)} ${base.code}`
                                            ) : (
                                                <DotsLoader />
                                            )}
                                        </div>
                                        <div>
                                            {counterShares !== null ? (
                                                `${formatBalance(counterShares)} ${counter.code}`
                                            ) : (
                                                <DotsLoader />
                                            )}
                                        </div>
                                    </InOffers>
                                </Cell>
                                <Cell>
                                    <label>Account shares:</label>
                                    <div>
                                        {accountShares !== null ? (
                                            formatBalance(accountShares)
                                        ) : (
                                            <DotsLoader />
                                        )}
                                    </div>
                                </Cell>
                                <ButtonCell>
                                    <Button
                                        onClick={() => openDepositModal()}
                                        disabled={
                                            !poolId ||
                                            !account.getAssetBalance(base) ||
                                            !account.getAssetBalance(counter)
                                        }
                                    >
                                        deposit
                                    </Button>
                                    <Button
                                        disabled={!accountShares}
                                        onClick={() => withdrawAll()}
                                        pending={withdrawPending}
                                    >
                                        withdraw all
                                    </Button>
                                </ButtonCell>
                            </TableBodyRow>
                        </TableBody>
                    </Table>
                </Section>
            </Content>
        </Container>
    );
};

export default Amm;

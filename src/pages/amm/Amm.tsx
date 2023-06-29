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
import { useEffect, useState } from 'react';
import * as SorobanClient from 'soroban-client';
import BalancesBlock from './BalancesBlock/BalancesBlock';
import AssetDropdown from '../vote/components/AssetDropdown/AssetDropdown';
import { Breakpoints, COLORS } from '../../common/styles';
import DotsLoader from '../../common/basics/DotsLoader';
import Button from '../../common/basics/Button';
import DepositToPool from './DepositToPool/DepositToPool';
import ChooseLoginMethodModal from '../../common/modals/ChooseLoginMethodModal';
import useAssetsStore from '../../store/assetsStore/useAssetsStore';

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

export const XLM = SorobanClient.Asset.native();
export const A = new SorobanClient.Asset(
    'A',
    'GC6HLY2JXKXYXUU3XYC63O2RJNH4E3GEW26ABTHDF6AF6MY32B5QRISO',
);
export const B = new SorobanClient.Asset(
    'B',
    'GC6HLY2JXKXYXUU3XYC63O2RJNH4E3GEW26ABTHDF6AF6MY32B5QRISO',
);
export const FRS1 = new SorobanClient.Asset(
    'FRS1',
    'GC6HLY2JXKXYXUU3XYC63O2RJNH4E3GEW26ABTHDF6AF6MY32B5QRISO',
);
export const SND1 = new SorobanClient.Asset(
    'SND1',
    'GC6HLY2JXKXYXUU3XYC63O2RJNH4E3GEW26ABTHDF6AF6MY32B5QRISO',
);

export const LIST = [XLM, A, B, FRS1, SND1];

const Amm = () => {
    const { account, isLogged } = useAuthStore();
    const { processNewAssets } = useAssetsStore();

    const [base, setBase] = useState(A);
    const [counter, setCounter] = useState(B);
    const [poolId, setPoolId] = useState(null);
    const [baseShares, setBaseShares] = useState(null);
    const [counterShares, setCounterShares] = useState(null);
    const [shareId, setShareId] = useState(null);
    const [accountShares, setAccountShares] = useState(null);
    const [getTokenPending, setGetTokenPending] = useState(false);
    const [withdrawPending, setWithdrawPending] = useState(false);

    useEffect(() => {
        processNewAssets(LIST);
    }, []);

    useEffect(() => {
        if (!isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {});
        }
    }, []);

    useEffect(() => {
        if (isLogged) {
            SorobanService.getPoolId(base, counter).then((id) => {
                setPoolId(id);
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
        SorobanService.getTokenBalance(base, poolId).then((res) => {
            setBaseShares(res);
        });
        SorobanService.getTokenBalance(counter, poolId).then((res) => {
            setCounterShares(res);
        });

        SorobanService.getPoolShareId(poolId).then((shareId) => {
            setShareId(shareId);
            SorobanService.getTokenBalance(shareId, account.accountId()).then((res) => {
                setAccountShares(res);
            });
        });
    };

    const neededInTestAssets =
        account?.getAssetBalance(A) === null ||
        account?.getAssetBalance(B) === null ||
        account?.getAssetBalance(FRS1) === null ||
        account?.getAssetBalance(SND1) === null;

    const getTestTokens = () => {
        setGetTokenPending(true);

        SorobanService.getTestAssets()
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
        SorobanService.withdraw(
            poolId,
            base,
            counter,
            '0.0000001',
            '0.0000001',
            shareId,
            accountShares,
        )
            .then(() => {
                ToastService.showSuccessToast('Withdraw was completed successfully');
                getData();
                setWithdrawPending(false);
            })
            .catch((e) => {
                console.log(e);
                ToastService.showErrorToast('Oops! Something went wrong');
                setWithdrawPending(false);
            });
    };

    if (!account) {
        return <PageLoader />;
    }

    return (
        <Container>
            <Content>
                <BalancesBlock />
                <Header>
                    <Title>Liquidity overview</Title>
                </Header>
                <Header>
                    <PairSearch>
                        <AssetDropdown
                            asset={base}
                            onUpdate={setBase}
                            assetsList={LIST}
                            exclude={counter}
                            withoutReset
                        />
                        <AssetDropdown
                            asset={counter}
                            onUpdate={setCounter}
                            assetsList={LIST}
                            exclude={base}
                            withoutReset
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
                                    <Button onClick={() => openDepositModal()} disabled={!poolId}>
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

import * as React from 'react';
import styled from 'styled-components';
import { flexRowSpaceBetween, respondDown } from '../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { ModalTitle } from '../../../../common/modals/atoms/ModalAtoms';
import { useEffect, useState } from 'react';
import RangeInput from '../../../../common/basics/RangeInput';
import Button from '../../../../common/basics/Button';
import { formatBalance } from '../../../../common/helpers/helpers';
import {
    ModalService,
    SorobanService,
    ToastService,
} from '../../../../common/services/globalServices';
import SuccessModal from '../SuccessModal/SuccessModal';
import useAuthStore from '../../../../store/authStore/useAuthStore';
import PageLoader from '../../../../common/basics/PageLoader';
import Pair from '../../../vote/components/common/Pair';
import Input from '../../../../common/basics/Input';
import DotsLoader from '../../../../common/basics/DotsLoader';
import { getAssetString } from '../../../../store/assetsStore/actions';
import { BuildSignAndSubmitStatuses } from '../../../../common/services/wallet-connect.service';
import BigNumber from 'bignumber.js';

const Container = styled.div`
    width: 52.3rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const PairContainer = styled.div`
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.lightGray};
    border-radius: 0.6rem;
    padding: 2.4rem;
    margin: 4rem 0 1.6rem;
`;

const StyledButton = styled(Button)`
    margin-top: 5rem;
    margin-left: auto;

    ${respondDown(Breakpoints.sm)`
        width: 100%;
        margin-top: 2rem;
    `}
`;

const InputStyled = styled(Input)`
    margin-bottom: 3.2rem;
    margin-top: 5rem;
`;

const Details = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 3.2rem;
`;

const DescriptionRow = styled.div`
    ${flexRowSpaceBetween};
    margin-bottom: 1.6rem;
    color: ${COLORS.grayText};

    span:last-child {
        color: ${COLORS.paragraphText};
    }
`;

const WithdrawFromPool = ({ params }) => {
    const { pool, accountShare } = params;
    const [percent, setPercent] = useState('100');
    const [pending, setPending] = useState(false);
    const [totalShares, setTotalShares] = useState(null);
    const [reserves, setReserves] = useState(null);

    const { account } = useAuthStore();

    useEffect(() => {
        SorobanService.getTotalShares(pool.address).then((res) => {
            setTotalShares(res);
        });
    }, []);

    useEffect(() => {
        SorobanService.getPoolReserves(pool.assets, pool.address).then((res) => {
            setReserves(res);
        });
    }, []);

    const withdraw = () => {
        setPending(true);

        const amount = new BigNumber(accountShare.toString())
            .times(new BigNumber(percent))
            .div(100)
            .toFixed(7);

        SorobanService.getWithdrawTx(account?.accountId(), pool.index, amount, pool.assets)
            .then((tx) => account.signAndSubmitTx(tx, true))
            .then((res) => {
                ModalService.confirmAllModals();

                if (
                    (res as { status: BuildSignAndSubmitStatuses }).status ===
                    BuildSignAndSubmitStatuses.pending
                ) {
                    ToastService.showSuccessToast('More signatures required to complete');
                    return;
                }

                ModalService.openModal(SuccessModal, {
                    assets: pool.assets,
                    amounts: res.value().map((val) => SorobanService.i128ToInt(val.value())),
                    title: 'Withdraw Successful',
                });
                setPending(false);
            })
            .catch((e) => {
                console.log(e);
                ToastService.showErrorToast('Oops! Something went wrong');
                setPending(false);
            });
    };

    return (
        <Container>
            {accountShare === null ? (
                <PageLoader />
            ) : (
                <>
                    <ModalTitle>Remove liquidity</ModalTitle>
                    <PairContainer>
                        <Pair
                            base={pool.assets[0]}
                            counter={pool.assets[1]}
                            thirdAsset={pool.assets[2]}
                            fourthAsset={pool.assets[3]}
                        />
                    </PairContainer>
                    <InputStyled
                        label="Amount to remove"
                        postfix="%"
                        value={percent}
                        onChange={({ target }) => setPercent(target.value)}
                    />
                    <RangeInput onChange={setPercent} value={+percent} />

                    <Details>
                        {pool.assets.map((asset) => (
                            <DescriptionRow>
                                <span>Will receive {asset.code}</span>
                                <span>
                                    {totalShares === null || reserves === null ? (
                                        <DotsLoader />
                                    ) : totalShares === 0 ? (
                                        '0'
                                    ) : (
                                        formatBalance(
                                            (((+percent / 100) * accountShare) / totalShares) *
                                                reserves.get(getAssetString(asset)),
                                        )
                                    )}
                                </span>
                            </DescriptionRow>
                        ))}
                    </Details>

                    <StyledButton isBig pending={pending} onClick={() => withdraw()}>
                        Remove
                    </StyledButton>
                </>
            )}
        </Container>
    );
};

export default WithdrawFromPool;

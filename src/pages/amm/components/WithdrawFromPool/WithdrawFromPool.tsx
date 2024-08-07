import * as React from 'react';
import styled from 'styled-components';
import { flexRowSpaceBetween, respondDown } from '../../../../common/mixins';
import { Breakpoints, COLORS } from '../../../../common/styles';
import { ModalProps, ModalTitle } from '../../../../common/modals/atoms/ModalAtoms';
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
import { PoolExtended } from '../../api/types';

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

const WithdrawFromPool = ({ params }: ModalProps<{ pool: PoolExtended }>) => {
    const { pool } = params;
    const [accountShare, setAccountShare] = useState(null);
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

    useEffect(() => {
        if (!account) {
            setAccountShare(null);
            return;
        }
        SorobanService.getTokenBalance(pool.share_token_address, account.accountId()).then(
            (res) => {
                setAccountShare(res);
            },
        );
    }, [account]);

    const onInputChange = (value) => {
        if (Number.isNaN(Number(value)) || Number(value) > 100) {
            return;
        }
        const [integerPart, fractionalPart] = value.split('.');

        const roundedValue =
            fractionalPart && fractionalPart.length > 1
                ? `${integerPart}.${fractionalPart.slice(0, 1)}`
                : value;

        setPercent(roundedValue);
    };

    const withdraw = () => {
        const noTrustAssets = pool.assets.filter(
            (asset) => account.getAssetBalance(asset) === null,
        );

        if (noTrustAssets.length) {
            ToastService.showErrorToast(
                `${noTrustAssets.map(({ code }) => code).join(', ')} trustline${
                    noTrustAssets.length > 1 ? 's' : ''
                } missing. Please provide it in your wallet.`,
            );
            return;
        }

        setPending(true);

        const amount = new BigNumber(accountShare.toString())
            .times(new BigNumber(percent))
            .div(100)
            .toFixed(7);
        let hash: string;

        SorobanService.getWithdrawTx(account?.accountId(), pool.index, amount, pool.assets)
            .then((tx) => {
                hash = tx.hash().toString('hex');
                return account.signAndSubmitTx(tx, true);
            })
            .then((res) => {
                if (!res) {
                    return;
                }

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
                    hash,
                });
                setPending(false);
            })
            .catch((e) => {
                console.log(e);
                const errorMessage = e.message ?? e.toString() ?? 'Oops! Something went wrong';
                ToastService.showErrorToast(
                    errorMessage === 'The amount is too small to deposit to this pool'
                        ? 'The amount is too small to withdraw from this pool'
                        : errorMessage,
                );
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
                        onChange={({ target }) => onInputChange(target.value)}
                    />
                    <RangeInput onChange={setPercent} value={+percent} />

                    <Details>
                        {pool.assets.map((asset) => (
                            <DescriptionRow key={getAssetString(asset)}>
                                <span>Will receive {asset.code}</span>
                                <span>
                                    {totalShares === null || reserves === null ? (
                                        <DotsLoader />
                                    ) : Number(totalShares) === 0 ? (
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

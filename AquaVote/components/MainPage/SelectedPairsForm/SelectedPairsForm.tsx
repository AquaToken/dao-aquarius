import * as React from 'react';
import { useState } from 'react';
import {
    ModalDescription,
    ModalProps,
    ModalTitle,
} from '../../../../common/modals/atoms/ModalAtoms';
import styled from 'styled-components';
import { flexAllCenter, flexRowSpaceBetween } from '../../../../common/mixins';
import { COLORS } from '../../../../common/styles';
import Aqua from '../../../../common/assets/img/aqua-logo-small.svg';
import useAuthStore from '../../../../common/store/authStore/useAuthStore';
import Input from '../../../../common/basics/Input';
import RangeInput from '../../../../common/basics/RangeInput';
import Button from '../../../../common/basics/Button';
import { ModalService } from '../../../../common/services/globalServices';
import { formatBalance, roundToPrecision } from '../../../../common/helpers/helpers';
import ExternalLink from '../../../../common/basics/ExternalLink';
import GetAquaModal from '../../../../common/modals/GetAquaModal/GetAquaModal';
import { useIsMounted } from '../../../../common/hooks/useIsMounted';
import IconsPair from '../../PairIcons/IconsPair';
import CloseIcon from '../../../../common/assets/img/icon-close-small.svg';

// const MINIMUM_AMOUNT = 0.0000001;

const ContentRow = styled.div`
    ${flexRowSpaceBetween};
    width: 52.8rem;
    margin-top: 3rem;
`;

const Label = styled.span`
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.paragraphText};
    ${flexAllCenter};
`;

const BalanceBlock = styled.span`
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.grayText};
`;

const Balance = styled.span`
    color: ${COLORS.tooltip};
    cursor: pointer;
`;

const InputPostfix = styled.div`
    height: min-content;
    ${flexAllCenter};
    color: ${COLORS.grayText};
    svg {
        margin-right: 0.8rem;
    }
`;

const AquaLogo = styled(Aqua)`
    height: 3.2rem;
    width: 3.2rem;
`;

const AmountInput = styled(Input)`
    margin-top: 1.2rem;
    margin-bottom: 3.3rem;
`;

const ClaimBack = styled.div`
    margin-top: 4.1rem;
    padding-bottom: 1.7rem;
    color: ${COLORS.grayText};
    border-bottom: 0.1rem dashed ${COLORS.gray};
`;

const ClaimBackDate = styled.span`
    color: ${COLORS.paragraphText};
`;

const StyledButton = styled(Button)`
    margin-top: 3.2rem;
`;

const GetAquaBlock = styled.div`
    ${flexRowSpaceBetween};
    height: 6.8rem;
    border-radius: 1rem;
    background: ${COLORS.lightGray};
    padding: 0 3.2rem;
    margin-top: 4.1rem;
`;

const GetAquaLabel = styled.span`
    color: ${COLORS.grayText};
`;

const GetAquaLink = styled.div`
    font-size: 1.4rem;
`;
const PairsList = styled.div`
    padding-top: 1.6rem;
`;
const Pair = styled.div`
    padding: 0.4rem 0;
    margin-bottom: 0.8rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const AssetsInfo = styled.div`
    display: flex;
    align-items: center;
    span {
        margin-left: 0.8rem;
    }
`;

const CloseButton = styled.button`
    ${flexAllCenter};
    border: none;
    cursor: pointer;
    padding: 1.2rem;
    background-color: ${COLORS.lightGray};
    border-radius: 1rem;
`;

const StyledInput = styled(Input)`
    width: auto;
    margin: 0 1.2rem 0 auto;
`;

const TotalAmountRow = styled.div`
    padding: 0.8rem 0;
    margin-top: 0.8rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};
    display: flex;
    align-items: center;
    justify-content: space-between;
    ${Label} {
        color: ${COLORS.grayText};
    }
`;

const TotalAmount = styled.div`
    display: flex;
    align-items: center;
    svg {
        margin-left: 0.8rem;
    }
`;

const firstAsset = {
    code: 'BTC',
    issuer: 'GAUTUYY2THLF7SGITDFMXJVYH3LHDSMGEAKSBU267M2K7A3W543CKUEF',
    asset_string: 'BTC:GAUTUYY2THLF7SGITDFMXJVYH3LHDSMGEAKSBU267M2K7A3W543CKUEF',
    home_domain: 'apay.io',
    name: 'Bitcoin',
    image: 'https://apay.io/public/logo/btc.svg',
};

const secondAsset = {
    code: 'AQUA',
    issuer: 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA',
    asset_string: 'AQUA:GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA',
    home_domain: 'aqua.network',
    name: 'AQUA',
    image: 'https://aqua.network/assets/img/aqua-logo.png',
};

const SelectedPairsForm = ({
    params,
    close,
}: ModalProps<{ option: string; key: string; endDate: string }>) => {
    const { account } = useAuthStore();
    // const { option, key, endDate } = params;

    // const isMounted = useIsMounted();

    const [percent, setPercent] = useState(0);
    const [amount, setAmount] = useState('');
    const [pending, setPending] = useState(false);
    const [selectedPairs, setSelectedPairs] = useState([]);

    const aquaBalance = account.getAquaBalance();

    const hasTrustLine = aquaBalance !== null;
    const hasAqua = aquaBalance !== 0;

    const formattedAquaBalance = hasTrustLine && formatBalance(aquaBalance);

    const onRangeChange = (percent) => {
        setPercent(percent);

        const amountValue = (aquaBalance * percent) / 100;

        setAmount(roundToPrecision(amountValue, 7));
    };

    const onInputChange = (value) => {
        if (Number.isNaN(Number(value))) {
            return;
        }
        setAmount(value);

        const percentValue = roundToPrecision((Number(value) / Number(aquaBalance)) * 100, 2);

        setPercent(+percentValue);
    };

    const onSubmit = async () => {
        // if (pending) {
        //     return;
        // }
        // if (Number(amount) > Number(aquaBalance)) {
        //     ToastService.showErrorToast(
        //         `The value must be less or equal than ${formattedAquaBalance} AQUA`,
        //     );
        // }
        // if (Number(amount) < MINIMUM_AMOUNT) {
        //     ToastService.showErrorToast(
        //         `The value must be greater than ${MINIMUM_AMOUNT.toFixed(7)} AQUA`,
        //     );
        // }
        // try {
        //     setPending(true);
        //     const voteOp = StellarService.createVoteOperation(
        //         account.accountId(),
        //         key,
        //         amount,
        //         new Date(endDate).getTime(),
        //     );
        //     const tx = await StellarService.buildTx(account, voteOp);
        //     const result = await account.signAndSubmitTx(tx);
        //     if (isMounted.current) {
        //         setPending(false);
        //         close();
        //     }
        //
        //     if (
        //         (result as { status: BuildSignAndSubmitStatuses }).status ===
        //         BuildSignAndSubmitStatuses.pending
        //     ) {
        //         ToastService.showSuccessToast('More signatures required to complete');
        //         return;
        //     }
        //     ToastService.showSuccessToast('Your vote has been counted');
        // } catch (e) {
        //     ToastService.showErrorToast('Your vote has not been counted');
        //     if (isMounted.current) {
        //         setPending(false);
        //     }
        // }
    };

    return (
        <>
            <ModalTitle>Selected Pairs</ModalTitle>
            <ModalDescription>Lock your AQUA in the network to complete your vote</ModalDescription>
            <ContentRow>
                <Label>Amount</Label>

                {hasTrustLine ? (
                    <BalanceBlock>
                        <Balance onClick={() => onRangeChange(100)}>
                            {formattedAquaBalance} AQUA{' '}
                        </Balance>
                        available
                    </BalanceBlock>
                ) : (
                    <BalanceBlock>You don’t have AQUA trustline</BalanceBlock>
                )}
            </ContentRow>

            <AmountInput
                value={amount}
                onChange={(e) => {
                    onInputChange(e.target.value);
                }}
                placeholder="Enter voting power"
                postfix={
                    <InputPostfix>
                        <AquaLogo />
                        <span>AQUA</span>
                    </InputPostfix>
                }
                disabled={!hasTrustLine || !hasAqua}
            />

            <RangeInput
                onChange={onRangeChange}
                value={percent}
                disabled={!hasTrustLine || !hasAqua}
            />

            <ContentRow>
                <Label>Pairs ({2})</Label>
            </ContentRow>
            <PairsList>
                <Pair>
                    <AssetsInfo>
                        <IconsPair firstAsset={firstAsset} secondAsset={secondAsset} />
                        <span>
                            {firstAsset.code} / {secondAsset.code}
                        </span>
                    </AssetsInfo>
                    <StyledInput value={amount} isMedium isRightAligned />
                    <CloseButton onClick={() => console.log('delete pair')}>
                        <CloseIcon />
                    </CloseButton>
                </Pair>
                <Pair>
                    <AssetsInfo>
                        <IconsPair firstAsset={firstAsset} secondAsset={secondAsset} />
                        <span>
                            {firstAsset.code} / {secondAsset.code}
                        </span>
                    </AssetsInfo>
                    <StyledInput value={amount} isMedium isRightAligned />
                    <CloseButton onClick={() => console.log('delete pair')}>
                        <CloseIcon />
                    </CloseButton>
                </Pair>
            </PairsList>
            <TotalAmountRow>
                <Label>Total:</Label>
                <TotalAmount>
                    {amount || '0'} AQUA <AquaLogo />
                </TotalAmount>
            </TotalAmountRow>

            {hasTrustLine && hasAqua ? (
                <ClaimBack>
                    You can retrieve your AQUA + AQUA Voting reward on{' '}
                    <ClaimBackDate>
                        December 2, 2021
                        {/*{getDateString(new Date(endDate).getTime(), { withTime: true })}*/}
                    </ClaimBackDate>
                </ClaimBack>
            ) : (
                <GetAquaBlock>
                    <GetAquaLabel>You don&apos;t have enough AQUA</GetAquaLabel>
                    <ExternalLink onClick={() => ModalService.openModal(GetAquaModal, {})}>
                        <GetAquaLink>Get AQUA</GetAquaLink>
                    </ExternalLink>
                </GetAquaBlock>
            )}

            <StyledButton
                fullWidth
                onClick={() => onSubmit()}
                disabled={!amount || !Number(amount)}
                pending={pending}
            >
                CONFIRM
            </StyledButton>
        </>
    );
};

export default SelectedPairsForm;

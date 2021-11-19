import * as React from 'react';
import { useMemo, useState } from 'react';
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
import { ModalService, ToastService } from '../../../../common/services/globalServices';
import { formatBalance, roundToPrecision } from '../../../../common/helpers/helpers';
import ExternalLink from '../../../../common/basics/ExternalLink';
import GetAquaModal from '../../../../common/modals/GetAquaModal/GetAquaModal';
import Pair from './Pair/Pair';

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

const pairs = [
    {
        pairString:
            'BTC:GAUTUYY2THLF7SGITDFMXJVYH3LHDSMGEAKSBU267M2K7A3W543CKUEF/AQUA:GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA',
        baseAsset: {
            code: 'BTC',
            issuer: 'GAUTUYY2THLF7SGITDFMXJVYH3LHDSMGEAKSBU267M2K7A3W543CKUEF',
            asset_string: 'BTC:GAUTUYY2THLF7SGITDFMXJVYH3LHDSMGEAKSBU267M2K7A3W543CKUEF',
            home_domain: 'apay.io',
            name: 'Bitcoin',
            image: 'https://apay.io/public/logo/btc.svg',
        },
        counterAsset: {
            code: 'AQUA',
            issuer: 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA',
            asset_string: 'AQUA:GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA',
            home_domain: 'aqua.network',
            name: 'AQUA',
            image: 'https://aqua.network/assets/img/aqua-logo.png',
        },
    },
    {
        pairString: 'native/yXLM:GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55',
        baseAsset: {
            code: 'XLM',
            issuer: '',
            asset_string: 'native',
            home_domain: '',
            name: 'Lumens',
            image: 'https://static.lobstr.co/media/Stellar_symbol_black_RGB_xs_square3.png',
        },
        counterAsset: {
            code: 'yXLM',
            issuer: 'GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55',
            asset_string: 'yXLM:GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55',
            home_domain: 'ultrastellar.com',
            name: '',
            image: 'https://ultrastellar.com/static/images/icons/yXLM.png',
        },
    },
    {
        pairString:
            'USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN/AQUA:GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA',
        baseAsset: {
            code: 'USDC',
            issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
            asset_string: 'USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
            home_domain: 'centre.io',
            name: 'USD Coin',
            image: 'https://www.centre.io/images/usdc/usdc-icon-86074d9d49.png',
        },
        counterAsset: {
            code: 'AQUA',
            issuer: 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA',
            asset_string: 'AQUA:GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA',
            home_domain: 'aqua.network',
            name: 'AQUA',
            image: 'https://aqua.network/assets/img/aqua-logo.png',
        },
    },
];

export const SelectedPairsForm = ({
    params,
    close,
}: ModalProps<{ option: string; key: string; endDate: string }>): JSX.Element => {
    const getInitialState = () => {
        return pairs.map((pair) => {
            return { ...pair, amountAqua: 0 };
        });
    };
    const { account } = useAuthStore();

    const [percent, setPercent] = useState(0);
    const [amount, setAmount] = useState('');
    const [pending, setPending] = useState(false);
    const [selectedPairs, setSelectedPairs] = useState(() => getInitialState());
    const aquaBalance = account.getAquaBalance();

    const hasTrustLine = aquaBalance !== null;
    const hasAqua = aquaBalance !== 0;

    const formattedAquaBalance = hasTrustLine && formatBalance(aquaBalance);

    const setAmountForEachPair = (amount) => {
        const amountForEachPair = roundToPrecision(Number(amount) / selectedPairs.length, 7);
        setSelectedPairs((selectedPairs) => {
            return selectedPairs.map((pair) => ({
                ...pair,
                amountAqua: +amountForEachPair,
            }));
        });
    };

    const totalAmount = useMemo(() => {
        let totalAmount = 0;
        selectedPairs.forEach((pair) => {
            totalAmount += pair.amountAqua;
        });
        return roundToPrecision(totalAmount, 7);
    }, [selectedPairs]);

    const handlerInputPair = ({ value, pairString }) => {
        setSelectedPairs((selectedPairs) => {
            return selectedPairs.map((pair) => {
                if (pair.pairString === pairString) {
                    return { ...pair, amountAqua: Number(value) };
                } else return { ...pair };
            });
        });
    };

    const removePair = (pairString) => {
        setSelectedPairs((selectedPairs) => {
            return selectedPairs.filter((pair) => pair.pairString !== pairString);
        });
    };

    const onRangeChange = (percent) => {
        setPercent(percent);

        const amountValue = roundToPrecision((aquaBalance * percent) / 100, 7);

        setAmountForEachPair(amountValue);
        setAmount(amountValue);
    };

    const onInputChange = (value) => {
        if (Number.isNaN(Number(value))) {
            return;
        }
        setAmount(value);
        setAmountForEachPair(value);

        const percentValue = roundToPrecision((Number(value) / Number(aquaBalance)) * 100, 2);

        setPercent(+percentValue);
    };

    const onSubmit = async () => {
        if (Number(totalAmount) > Number(amount)) {
            ToastService.showErrorToast(
                `The total value cannot be greater than the selected amount of AQUA`,
            );
        }
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
                <Label>Pairs ({selectedPairs.length})</Label>
            </ContentRow>
            <PairsList>
                {selectedPairs.map((pair) => (
                    <Pair
                        key={pair.pairString}
                        pairData={pair}
                        handlerInputPair={handlerInputPair}
                        removePair={removePair}
                    />
                ))}
            </PairsList>
            <TotalAmountRow>
                <Label>Total:</Label>
                <TotalAmount>
                    {totalAmount} AQUA <AquaLogo />
                </TotalAmount>
            </TotalAmountRow>

            {hasTrustLine && hasAqua ? (
                <ClaimBack>
                    You can retrieve your AQUA + AQUA Voting reward on{' '}
                    <ClaimBackDate>December 2, 2021</ClaimBackDate>
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

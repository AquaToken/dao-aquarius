import * as React from 'react';
import { useMemo, useState } from 'react';
import styled from 'styled-components';

import {
    MAX_BOOST,
    MAX_BOOST_PERIOD,
    MAX_LOCK_PERIOD,
    MIN_BOOST_PERIOD,
    RECOMMENDED_LOCK_PERIOD,
} from 'constants/ice';
import { LS_DELEGATE_PROMO_VIEWED_LOCKER } from 'constants/local-storage';

import { getAquaAssetData } from 'helpers/assets';
import { roundMsToDays } from 'helpers/date';
import { formatBalance, roundToPrecision } from 'helpers/format-number';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService, ToastService } from 'services/globalServices';

import { flexRowSpaceBetween, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import DelegateLogo from 'assets/delegate/delegate-promo.svg';
import Info from 'assets/icons/status/icon-info-16.svg';
import Ice from 'assets/tokens/ice-logo.svg';

import Button from 'basics/buttons/Button';
import { Form } from 'basics/form/Form';
import TokenAmountFormField from 'basics/form/TokenAmountFormField';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import DelegatePromoModal from 'modals/alerts/DelegatePromoModal';
import ChooseLoginMethodModal from 'modals/auth/ChooseLoginMethodModal';

import LockDurationFormField from 'pages/locker/components/LockDurationFormField/LockDurationFormField';

import LockAquaModal from '../LockAquaModal/LockAquaModal';

const TokenAmountFormFieldStyled = styled(TokenAmountFormField)`
    margin-bottom: 0.8rem;
`;

const YouWillGet = styled.div`
    display: flex;
    padding: 0 0.8rem;
    margin: 3.2rem 0;
    align-items: center;
    justify-content: space-between;
`;

const YouWillGetLabel = styled.span`
    font-weight: 400;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.textSecondary};
    opacity: 0.7;
    white-space: nowrap;
    margin-right: 0.6rem;
`;

const YouWillGetAmount = styled.div`
    font-weight: 700;
    font-size: 2rem;
    line-height: 2.8rem;
    color: ${COLORS.textPrimary};
    display: flex;
    align-items: center;

    span {
        word-break: break-word;
    }
`;

const IceLogo = styled(Ice)`
    height: 3.2rem;
    width: 3.2rem;
    min-width: 3.2rem;
    margin-right: 0.8rem;
`;

const InfoIcon = styled(Info)`
    margin-left: 0.8rem;
`;

const TooltipInner = styled.div`
    display: flex;
    flex-direction: column;
    color: ${COLORS.textPrimary};
    width: fit-content;
`;

const TooltipRow = styled.div`
    ${flexRowSpaceBetween};
    gap: 2rem;
    padding: 0.4rem 0;
    font-weight: 400;

    span:first-child {
        font-size: 1.4rem;
        line-height: 2rem;
        color: ${COLORS.textGray};
    }

    span:last-child {
        display: flex;
        align-items: center;
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.textTertiary};
    }
`;

const IceLogoSmall = styled(Ice)`
    height: 1.8rem;
    width: 1.8rem;
    margin-right: 0.5rem;
`;

const ModalBG = styled(DelegateLogo)`
    object-position: center center;
    height: 28.2rem;
    width: 100%;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

const LockAquaForm = () => {
    const [lockPeriod, setLockPeriod] = useState(null);
    const [lockPeriodPercent, setLockPeriodPercent] = useState(0);
    const [lockAmount, setLockAmount] = useState('');

    const { isLogged, account } = useAuthStore();

    const aquaBalance = account?.getAquaBalance();

    const onLockPeriodPercentChange = value => {
        setLockPeriodPercent(value);
        const period = (RECOMMENDED_LOCK_PERIOD * value) / 100;

        setLockPeriod(period + Date.now());
    };

    const onLockPeriodChange = value => {
        setLockPeriod(value);
        if (value < Date.now()) {
            setLockPeriodPercent(0);
            return;
        }
        const period = value - Date.now();

        if (period > RECOMMENDED_LOCK_PERIOD) {
            setLockPeriodPercent(100);
            return;
        }

        const percent = roundToPrecision((period / RECOMMENDED_LOCK_PERIOD) * 100, 2);

        setLockPeriodPercent(+percent);
    };

    const iceAmount = useMemo(() => {
        const remainingPeriod = Math.max(roundMsToDays(lockPeriod) - roundMsToDays(Date.now()), 0);

        const boost = Math.min(remainingPeriod / roundMsToDays(MAX_BOOST_PERIOD), 1) * MAX_BOOST;
        return Number(lockAmount) * (1 + boost);
    }, [lockAmount, lockPeriod]);

    const resetForm = () => {
        setLockPeriod(null);
        setLockAmount('');
        setLockPeriodPercent(0);
    };

    const showDelegatePromo = () => {
        const isViewed = !!localStorage.getItem(LS_DELEGATE_PROMO_VIEWED_LOCKER);
        if (!isViewed) {
            ModalService.openModal(DelegatePromoModal, {}, false, <ModalBG />);
        }
    };

    const getButtonText = () => {
        if (!isLogged) {
            return 'Connect wallet';
        }
        if (!lockAmount) {
            return 'Enter amount';
        }

        if (!lockPeriod) {
            return 'Choose lock period';
        }

        if (account && +aquaBalance < +lockAmount) {
            return 'Insufficient balance';
        }

        return 'freeze aqua';
    };

    const onSubmit = () => {
        if (lockPeriod - Date.now() > MAX_LOCK_PERIOD) {
            ToastService.showErrorToast('The maximum allowed lock period is 10 years');
            return;
        }
        if (!isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {});
            return;
        }
        ModalService.openModal(LockAquaModal, {
            amount: lockAmount,
            period: lockPeriod,
            iceAmount,
        }).then(({ isConfirmed }) => {
            if (isConfirmed) {
                resetForm();
                showDelegatePromo();
            }
        });
    };

    const { aquaStellarAsset } = getAquaAssetData();

    return (
        <Form>
            <TokenAmountFormFieldStyled
                asset={aquaStellarAsset}
                balance={aquaBalance}
                amount={lockAmount}
                setAmount={setLockAmount}
                usdEquivalent={null}
                withAutoFocus
                withPercentButtons
                balanceLabel="Available: "
                amountLabel="Lock amount"
                isBalanceClickable
            />

            <LockDurationFormField
                lockPercent={lockPeriodPercent}
                onLockPercentChange={onLockPeriodPercentChange}
                lockPeriod={lockPeriod}
                onLockPeriodChange={onLockPeriodChange}
            />

            <YouWillGet>
                <YouWillGetLabel>You will get:</YouWillGetLabel>
                <YouWillGetAmount>
                    <IceLogo />
                    <Tooltip
                        content={
                            <TooltipInner>
                                <TooltipRow>
                                    <span>upvoteICE:</span>
                                    <span>
                                        <IceLogoSmall />
                                        {formatBalance(iceAmount * 0.8, true)}
                                    </span>
                                </TooltipRow>
                                <TooltipRow>
                                    <span>downvoteICE:</span>
                                    <span>
                                        <IceLogoSmall />
                                        {formatBalance(iceAmount * 0.2, true)}
                                    </span>
                                </TooltipRow>
                                <TooltipRow>
                                    <span>governICE:</span>
                                    <span>
                                        <IceLogoSmall />
                                        {formatBalance(iceAmount, true)}
                                    </span>
                                </TooltipRow>
                            </TooltipInner>
                        }
                        position={TOOLTIP_POSITION.left}
                        background={COLORS.white}
                        showOnHover
                    >
                        <span>
                            {formatBalance(iceAmount, true)} ICE <InfoIcon />
                        </span>
                    </Tooltip>
                </YouWillGetAmount>
            </YouWillGet>

            <Button
                isBig
                isRounded
                fullWidth
                disabled={
                    isLogged &&
                    (!lockAmount ||
                        !lockPeriod ||
                        lockPeriod - Date.now() < MIN_BOOST_PERIOD ||
                        +aquaBalance < +lockAmount)
                }
                type="button"
                onClick={() => onSubmit()}
            >
                {getButtonText()}
            </Button>
        </Form>
    );
};

export default LockAquaForm;

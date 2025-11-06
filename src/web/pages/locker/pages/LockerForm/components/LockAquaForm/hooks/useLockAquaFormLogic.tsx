import { useState, useMemo } from 'react';

import {
    MAX_BOOST,
    MAX_BOOST_PERIOD,
    MAX_LOCK_PERIOD,
    MIN_BOOST_PERIOD,
    RECOMMENDED_LOCK_PERIOD,
} from 'constants/ice';
import { LS_DELEGATE_PROMO_VIEWED_LOCKER } from 'constants/local-storage';

import { roundMsToDays } from 'helpers/date';
import { roundToPrecision } from 'helpers/format-number';

import AccountService from 'services/account.service';
import { ModalService, ToastService } from 'services/globalServices';

import DelegatePromoModal from 'modals/alerts/DelegatePromoModal';
import ChooseLoginMethodModal from 'modals/auth/ChooseLoginMethodModal';

import LockAquaModal from '../../LockAquaModal/LockAquaModal';
import { ModalBG } from '../LockAquaForm.styled';

export const useLockAquaFormLogic = (
    isLogged: boolean,
    account: AccountService,
    aquaBalance: number,
) => {
    const [lockPeriod, setLockPeriod] = useState<number | null>(null);
    const [lockPeriodPercent, setLockPeriodPercent] = useState(0);
    const [lockAmount, setLockAmount] = useState('');

    const onLockPeriodPercentChange = (value: number) => {
        setLockPeriodPercent(value);
        const period = (RECOMMENDED_LOCK_PERIOD * value) / 100;
        setLockPeriod(period + Date.now());
    };

    const onLockPeriodChange = (value: number) => {
        setLockPeriod(value);
        if (value < Date.now()) return setLockPeriodPercent(0);
        const period = value - Date.now();
        const percent = Math.min(
            +roundToPrecision((period / RECOMMENDED_LOCK_PERIOD) * 100, 2),
            100,
        );
        setLockPeriodPercent(percent);
    };

    const iceAmount = useMemo(() => {
        if (!lockAmount || !lockPeriod) return 0;
        const remainingDays = Math.max(roundMsToDays(lockPeriod) - roundMsToDays(Date.now()), 0);
        const boost = Math.min(remainingDays / roundMsToDays(MAX_BOOST_PERIOD), 1) * MAX_BOOST;
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

    const handleSubmit = () => {
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

    const isDisabled =
        isLogged &&
        (!lockAmount ||
            !lockPeriod ||
            lockPeriod - Date.now() < MIN_BOOST_PERIOD ||
            +aquaBalance < +lockAmount);

    const getButtonText = () => {
        if (!isLogged) return 'Connect wallet';
        if (!lockAmount) return 'Enter amount';
        if (!lockPeriod) return 'Choose lock period';
        if (account && +aquaBalance < +lockAmount) return 'Insufficient balance';
        return 'freeze aqua';
    };

    return {
        lockAmount,
        setLockAmount,
        lockPeriod,
        lockPeriodPercent,
        onLockPeriodChange,
        onLockPeriodPercentChange,
        iceAmount,
        handleSubmit,
        isDisabled,
        getButtonText,
    };
};

import { useEffect, useMemo, useState } from 'react';

import { getMarketPair } from 'api/bribes';

import { CreateBribeStep } from 'constants/bribes';
import { MAX_TOKEN_AMOUNT } from 'constants/incentives';

import {
    convertLocalDateToUTCIgnoringTimezone,
    getBribePeriodRange,
    getNextAvailableBribeStartDate,
} from 'helpers/date';
import { createAsset } from 'helpers/token';

import { useDebounce } from 'hooks/useDebounce';

import { LoginTypes } from 'store/authStore/types';
import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService, StellarService } from 'services/globalServices';

import { ClassicToken } from 'types/token';

import ChooseLoginMethodModal from 'modals/auth/ChooseLoginMethodModal';
import ConfirmBribeModal from 'modals/ConfirmBribeModal/ConfirmBribeModal';

import { MarketKey } from 'pages/vote/api/types';
import CreatePairModal from 'pages/vote/components/MainPage/CreatePairModal/CreatePairModal';

/** Hook state and methods for AddBribePage form */
export const useBribeForm = () => {
    const [step, setStep] = useState<CreateBribeStep>(CreateBribeStep.pair);
    const [base, setBase] = useState<ClassicToken | null>(null);
    const [counter, setCounter] = useState<ClassicToken | null>(null);
    const [pairInfo, setPairInfo] = useState<MarketKey | null | undefined>(undefined);

    const [rewardAsset, setRewardAsset] = useState<ClassicToken | null>(null);
    const [amount, setAmount] = useState<string>('');
    const [aquaEquivalent, setAquaEquivalent] = useState<string | null>(null);
    const [isInvalidAmount, setIsInvalidAmount] = useState<boolean>(false);

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [duration, setDuration] = useState<string>('1');

    const { isLogged, account } = useAuthStore();

    /** Reset entire form to defaults */
    const resetForm = () => {
        setStep(CreateBribeStep.pair);
        setBase(null);
        setCounter(null);
        setPairInfo(undefined);
        setRewardAsset(null);
        setAmount('');
        setStartDate(null);
        setEndDate(null);
        setSelectedDate(null);
    };

    /** Fetch market pair info when base/counter selected */
    useEffect(() => {
        if (!base || !counter) {
            setPairInfo(undefined);
            return;
        }

        setPairInfo(undefined);
        getMarketPair(base, counter).then(setPairInfo);
    }, [base, counter]);

    /** Debounced reward amount to limit re-fetch */
    const debouncedAmount = useDebounce(amount, 700);

    /** Fetch AQUA equivalent for given reward asset and amount */
    useEffect(() => {
        setAquaEquivalent(null);
        if (!debouncedAmount.current || !rewardAsset) return;

        if (Number(debouncedAmount.current) > MAX_TOKEN_AMOUNT) {
            setAquaEquivalent('0');
            setIsInvalidAmount(true);
            return;
        }

        setIsInvalidAmount(false);

        StellarService.price
            .getAquaEquivalent(
                createAsset(rewardAsset.code, rewardAsset.issuer),
                debouncedAmount.current,
            )
            .then(setAquaEquivalent)
            .catch(() => setAquaEquivalent('0'));
    }, [debouncedAmount, rewardAsset]);

    /** Ledger users limited to 5 weeks, others — 100 */
    const maxDuration = useMemo<number>(
        () => (isLogged && account.authType === LoginTypes.ledger ? 5 : 100),
        [isLogged],
    );

    /** Automatically compute end date based on start + duration */
    useEffect(() => {
        if (!startDate || !Number(duration) || Number(duration) > maxDuration) return;

        const { end } = getBribePeriodRange(
            convertLocalDateToUTCIgnoringTimezone(startDate),
            Number(duration),
        );
        setEndDate(end);
    }, [startDate, duration]);

    /** First valid start date (the next Monday window) */
    const minDate = getNextAvailableBribeStartDate();

    /** Open modal for creating new market pair */
    const createPair = () => {
        const openCreateModal = () => ModalService.openModal(CreatePairModal, { base, counter });
        if (isLogged) return openCreateModal();
        ModalService.openModal(ChooseLoginMethodModal, { callback: openCreateModal });
    };

    /** Confirm creation of bribe (opens modal) */
    const onSubmit = (e: SubmitEvent) => {
        console.log('submit', e);
        e.preventDefault();
        const modalProps = {
            base,
            counter,
            rewardAsset,
            amount,
            startDate,
            endDate,
            duration,
            marketKey: pairInfo?.account_id,
            resetForm,
        };

        const openConfirm = () => ModalService.openModal(ConfirmBribeModal, modalProps);

        if (isLogged) return openConfirm();
        ModalService.openModal(ChooseLoginMethodModal, { callback: openConfirm });
    };

    return {
        step,
        base,
        counter,
        pairInfo,
        rewardAsset,
        amount,
        aquaEquivalent,
        isInvalidAmount,
        startDate,
        endDate,
        selectedDate,
        duration,
        maxDuration,
        minDate,
        setStep,
        setBase,
        setCounter,
        setRewardAsset,
        setAmount,
        setStartDate,
        setEndDate,
        setSelectedDate,
        setDuration,
        createPair,
        onSubmit,
        resetForm,
        debouncedAmount,
    };
};

export type UseBribeFormReturn = ReturnType<typeof useBribeForm>;

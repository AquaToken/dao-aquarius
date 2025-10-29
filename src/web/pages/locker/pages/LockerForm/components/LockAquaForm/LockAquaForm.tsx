import * as React from 'react';

import { getAquaAssetData } from 'helpers/assets';

import useAuthStore from 'store/authStore/useAuthStore';

import Button from 'basics/buttons/Button';
import { Form } from 'basics/form/Form';

import { YouWillGetSection } from './components/YouWillGetSection';
import { useLockAquaFormLogic } from './hooks/useLockAquaFormLogic';
import { TokenAmountFormFieldStyled } from './LockAquaForm.styled';

import LockDurationFormField from '../LockDurationFormField/LockDurationFormField';

const LockAquaForm = () => {
    const { isLogged, account } = useAuthStore();
    const aquaBalance = account?.getAquaBalance() ?? 0;
    const { aquaStellarAsset } = getAquaAssetData();

    const {
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
    } = useLockAquaFormLogic(isLogged, account, aquaBalance);

    return (
        <Form>
            <TokenAmountFormFieldStyled
                asset={aquaStellarAsset}
                balance={aquaBalance}
                amount={lockAmount}
                setAmount={setLockAmount}
                withPercentButtons
                isBalanceClickable
                balanceLabel="Available: "
                amountLabel="Lock amount"
                withAutoFocus
            />

            <LockDurationFormField
                lockPercent={lockPeriodPercent}
                onLockPercentChange={onLockPeriodPercentChange}
                lockPeriod={lockPeriod}
                onLockPeriodChange={onLockPeriodChange}
            />

            <YouWillGetSection iceAmount={iceAmount} />

            <Button
                isBig
                isRounded
                fullWidth
                type="button"
                disabled={isDisabled}
                onClick={handleSubmit}
            >
                {getButtonText()}
            </Button>
        </Form>
    );
};

export default LockAquaForm;

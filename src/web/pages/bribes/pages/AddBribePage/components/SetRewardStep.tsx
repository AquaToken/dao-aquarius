import * as React from 'react';

import { MINIMUM_BRIBES_AQUA_EQUIVALENT, CreateBribeStep } from 'constants/bribes';
import { MAX_TOKEN_AMOUNT } from 'constants/incentives';

import { formatBalance } from 'helpers/format-number';

import { ClassicToken } from 'types/token';

import AssetDropdown from 'basics/asset-pickers/AssetDropdown';
import { CircleLoader } from 'basics/loaders';
import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import {
    FormRow,
    FormSection,
    FormSectionDescription,
    FormSectionTitle,
} from 'styles/sharedFormPage.styled';
import { COLORS } from 'styles/style-constants';

import {
    AmountInput,
    NextButton,
    SuccessIcon,
    FailIcon,
    TooltipInner,
} from '../AddBribePage.styled';
import { UseBribeFormReturn } from '../hooks/useBribeForm';

type Props = Pick<
    UseBribeFormReturn,
    | 'rewardAsset'
    | 'setRewardAsset'
    | 'amount'
    | 'setAmount'
    | 'step'
    | 'setStep'
    | 'debouncedAmount'
    | 'aquaEquivalent'
    | 'isInvalidAmount'
>;

export const SetRewardStep: React.FC<Props> = ({
    rewardAsset,
    setRewardAsset,
    amount,
    setAmount,
    step,
    setStep,
    debouncedAmount,
    aquaEquivalent,
    isInvalidAmount,
}) => {
    const amountInputPostfix =
        debouncedAmount.current !== null && aquaEquivalent === null ? (
            <CircleLoader size="small" />
        ) : Number(aquaEquivalent) >= MINIMUM_BRIBES_AQUA_EQUIVALENT ? (
            <SuccessIcon />
        ) : isInvalidAmount ? (
            <Tooltip
                content={<div>Value must be less or equal {formatBalance(MAX_TOKEN_AMOUNT)}</div>}
                position={window.innerWidth > 992 ? TOOLTIP_POSITION.top : TOOLTIP_POSITION.left}
                isShow
                background={COLORS.red500}
            >
                <FailIcon />
            </Tooltip>
        ) : (
            <Tooltip
                content={
                    <TooltipInner>
                        The bribe appears to be under 100,000 AQUA in value. Bribes below 100,000
                        AQUA will not be accepted and will be sent back by the bribe collector. Are
                        you sure you want to continue?
                    </TooltipInner>
                }
                position={window.innerWidth > 992 ? TOOLTIP_POSITION.top : TOOLTIP_POSITION.left}
                isShow
                background={COLORS.red500}
            >
                <FailIcon />
            </Tooltip>
        );

    return (
        <FormSection>
            <FormSectionTitle>Set Reward</FormSectionTitle>
            <FormSectionDescription>
                Set the reward asset and amount that will be distributed during one week. Note, your
                bribe should be worth at least 100,000 AQUA, otherwise it won't be accepted.
            </FormSectionDescription>

            <FormRow>
                <AssetDropdown
                    asset={rewardAsset}
                    onUpdate={token => setRewardAsset(token as ClassicToken)}
                    placeholder="Search or pick asset"
                    label="Reward asset"
                />

                <AmountInput
                    placeholder="0"
                    type="number"
                    label="Weekly reward amount"
                    value={amount}
                    required
                    onChange={({ target }) => setAmount(target.value)}
                    postfix={debouncedAmount.current && rewardAsset ? amountInputPostfix : null}
                    inputMode="decimal"
                />
            </FormRow>

            {step === CreateBribeStep.bribeAmount && (
                <NextButton
                    isBig
                    fullWidth
                    disabled={!rewardAsset || !Number(amount) || Number(amount) <= 0}
                    onClick={() => setStep(CreateBribeStep.period)}
                >
                    next
                </NextButton>
            )}
        </FormSection>
    );
};

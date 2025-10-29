import * as React from 'react';

import { CreateBribeStep } from 'constants/bribes';

import { ClassicToken } from 'types/token';

import AssetDropdown from 'basics/asset-pickers/AssetDropdown';

import {
    FormSection,
    FormSectionDescription,
    FormSectionTitle,
    FormRow,
} from 'styles/sharedFormPage.styled';

import { NextButton, PairDivider } from '../AddBribePage.styled';
import { UseBribeFormReturn } from '../hooks/useBribeForm';

export const SelectMarketStep: React.FC<
    Pick<
        UseBribeFormReturn,
        | 'base'
        | 'counter'
        | 'pairInfo'
        | 'setBase'
        | 'setCounter'
        | 'createPair'
        | 'setStep'
        | 'step'
    >
> = ({ base, counter, pairInfo, setBase, setCounter, createPair, setStep, step }) => (
    <FormSection>
        <FormSectionTitle>Select Market</FormSectionTitle>
        <FormSectionDescription>
            Choose the assets to define a market for your bribe.
        </FormSectionDescription>

        <FormRow>
            <AssetDropdown
                asset={base}
                onUpdate={token => setBase(token as ClassicToken)}
                exclude={counter}
                placeholder="Search or pick asset"
                label="Choose asset"
            />
            <PairDivider />
            <AssetDropdown
                asset={counter}
                onUpdate={token => setCounter(token as ClassicToken)}
                exclude={base}
                placeholder="Search or pick asset"
                label="Choose asset"
            />
        </FormRow>

        {base && counter && pairInfo === null && (
            <NextButton isBig fullWidth onClick={createPair}>
                create market
            </NextButton>
        )}

        {step === CreateBribeStep.pair && (
            <NextButton
                isBig
                fullWidth
                disabled={!base || !counter || !pairInfo}
                onClick={() => setStep(CreateBribeStep.bribeAmount)}
            >
                next
            </NextButton>
        )}
    </FormSection>
);

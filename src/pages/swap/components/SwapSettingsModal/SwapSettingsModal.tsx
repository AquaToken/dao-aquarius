import * as React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

import { ModalProps } from 'types/modal';

import { ToastService } from 'services/globalServices';
import { respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Button from 'basics/buttons/Button';
import Input from 'basics/inputs/Input';
import ToggleGroup from 'basics/inputs/ToggleGroup';
import { ModalDescription, ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

const FormRow = styled.div`
    display: flex;
    gap: 0.7rem;
    align-items: center;
`;
const ToggleGroupStyled = styled(ToggleGroup)`
    width: fit-content;
`;

const InputStyled = styled(Input)`
    width: 10rem;
`;

const Divider = styled.div`
    border-bottom: 0.1rem dashed ${COLORS.gray};
    margin: 4.2rem 0 3.2rem;
`;

export const SWAP_SLIPPAGE_ALIAS = 'swap-slippage';
export const DEFAULT_SLIPPAGE = '1'; // 1%

const SwapSettingsModal = ({ close }: ModalProps<never>): React.ReactNode => {
    const [slippage, setSlippage] = useState(
        localStorage.getItem(SWAP_SLIPPAGE_ALIAS) || DEFAULT_SLIPPAGE,
    );

    const onSave = () => {
        if (!Number(slippage) || Number(slippage) <= 0 || Number(slippage) > 10) {
            ToastService.showErrorToast('Invalid slippage value');
            return;
        }
        localStorage.setItem(SWAP_SLIPPAGE_ALIAS, slippage);
        ToastService.showSuccessToast('Saved!');
        close();
    };

    return (
        <ModalWrapper>
            <ModalTitle>Transaction settings</ModalTitle>
            <ModalDescription>
                Swap transactions will fail if the price changes unfavorably during processing by
                more than the tolerance percentage you set. Be aware, a slippage tolerance above 1%
                can result in unfavorable transactions
            </ModalDescription>

            <FormRow>
                <ToggleGroupStyled
                    value={slippage}
                    options={[
                        { label: '0.1%', value: '0.1' },
                        { label: '0.5%', value: '0.5' },
                        { label: '1%', value: '1' },
                    ]}
                    onChange={setSlippage}
                />
                <InputStyled
                    isMedium
                    postfix="%"
                    value={slippage}
                    onChange={({ target }) => setSlippage(target.value)}
                    inputMode="decimal"
                />
            </FormRow>

            <Divider />

            <Button fullWidth isBig onClick={() => onSave()}>
                Save
            </Button>
        </ModalWrapper>
    );
};

export default SwapSettingsModal;

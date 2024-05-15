import * as React from 'react';
import styled from 'styled-components';
import { respondDown } from '../../../common/mixins';
import { Breakpoints, COLORS } from '../../../common/styles';
import { ModalDescription, ModalTitle } from '../../../common/modals/atoms/ModalAtoms';
import ToggleGroup from '../../../common/basics/ToggleGroup';
import { useState } from 'react';
import Input from '../../../common/basics/Input';
import Button from '../../../common/basics/Button';
import { ToastService } from '../../../common/services/globalServices';

const Container = styled.div`
    width: 52.3rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

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

const SwapSettingsModal = ({ close }) => {
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
        <Container>
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
                />
            </FormRow>

            <Divider />

            <Button fullWidth isBig onClick={() => onSave()}>
                Save
            </Button>
        </Container>
    );
};

export default SwapSettingsModal;

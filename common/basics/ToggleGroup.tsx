import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../styles';
import { useEffect, useState } from 'react';
import { Option } from './Select';

const ToggleBlock = styled.div`
    background-color: ${COLORS.gray};
    border-radius: 5px;
    display: flex;

    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.paragraphText};
`;

const InputItem = styled.input`
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
`;

const VoteOption = styled.label`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.8rem 1.6rem;
    margin: 0.4rem;
    white-space: nowrap;
    background-color: ${COLORS.gray};
    border-radius: 3px;

    font-size: 1.6rem;
    line-height: 1.8rem;

    transition: all ease 200ms;

    ${({ isChecked }: { isChecked: boolean }) =>
        isChecked ? `background-color: ${COLORS.white};` : `background-color: ${COLORS.gray};`};
    &:hover {
        ${({ isChecked }: { isChecked: boolean }) =>
            !isChecked &&
            `cursor: pointer;
             background: ${COLORS.white};
             box-shadow: 0px 20px 30px rgba(0, 6, 54, 0.06);
             `};
    }
`;

const ToggleGroup = <T,>({
    options,
    value,
    onChange,
}: {
    value: T;
    options: Option<T>[];
    onChange: (value: T) => void;
}): JSX.Element => {
    const [selectedOption, setSelectedOption] = useState(
        options.find((option) => option.value === value),
    );

    useEffect(() => {
        setSelectedOption(options.find((option) => option.value === value));
    }, [value]);

    return (
        <ToggleBlock>
            {options.map((item) => {
                const isSelected = selectedOption?.value === item.value;
                return (
                    <VoteOption key={item.value.toString()} isChecked={isSelected}>
                        <InputItem
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                                onChange(item.value);
                            }}
                        />
                        {item.label}
                    </VoteOption>
                );
            })}
        </ToggleBlock>
    );
};

export default ToggleGroup;

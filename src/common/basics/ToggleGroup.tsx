import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { Option } from './Select';

import { COLORS } from '../styles';

const ToggleBlock = styled.div`
    background-color: ${COLORS.gray};
    border-radius: 5px;
    display: flex;
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.paragraphText};
`;

const VoteOption = styled.label<{ isChecked: boolean }>`
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
    ...props
}: {
    value: T;
    options: Option<T>[];
    onChange: (value: T) => void;
}): JSX.Element => {
    const [selectedOption, setSelectedOption] = useState(
        options.find(option => option.value === value),
    );

    useEffect(() => {
        setSelectedOption(options.find(option => option.value === value));
    }, [value]);

    return (
        <ToggleBlock {...props}>
            {options.map(item => {
                const isSelected = selectedOption?.value === item.value;
                return (
                    <VoteOption
                        key={item.value.toString()}
                        isChecked={isSelected}
                        onClick={e => {
                            e.preventDefault();
                            onChange(item.value);
                        }}
                    >
                        {item.label}
                    </VoteOption>
                );
            })}
        </ToggleBlock>
    );
};

export default ToggleGroup;

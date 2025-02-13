import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { COLORS } from 'web/styles';

import { Option } from 'basics/inputs/Select';

const ToggleBlock = styled.div<{ $isRounded: boolean }>`
    background-color: ${({ $isRounded }) => ($isRounded ? COLORS.white : COLORS.gray)};
    border: ${({ $isRounded }) => ($isRounded ? `0.1rem solid ${COLORS.gray}` : 'none')};
    border-radius: ${({ $isRounded }) => ($isRounded ? '3.2rem' : '0.5rem')};
    display: flex;
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.paragraphText};
`;

const ToggleOption = styled.label<{ $isChecked: boolean; $isRounded: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.8rem 1.6rem;
    margin: 0.4rem;
    white-space: nowrap;
    background-color: ${COLORS.gray};
    border-radius: ${({ $isRounded }) => ($isRounded ? '3.2rem' : '0.3rem')};

    font-size: 1.6rem;
    line-height: 1.8rem;

    transition: all ease 200ms;

    ${({ $isChecked, $isRounded }) =>
        $isChecked
            ? `background-color: ${$isRounded ? COLORS.gray : COLORS.white};`
            : `background-color: ${$isRounded ? COLORS.white : COLORS.gray};`};
    &:hover {
        ${({ $isChecked, $isRounded }) =>
            !$isChecked &&
            `cursor: pointer;
             background: ${$isRounded ? COLORS.gray : COLORS.white};
             box-shadow: 0px 20px 30px rgba(0, 6, 54, 0.06);
             `};
    }
`;

const ToggleGroup = <T,>({
    options,
    value,
    onChange,
    isRounded,
    ...props
}: {
    value: T;
    options: Option<T>[];
    onChange: (value: T) => void;
    isRounded?: boolean;
}): React.ReactNode => {
    const [selectedOption, setSelectedOption] = useState(
        options.find(option => option.value === value),
    );

    useEffect(() => {
        setSelectedOption(options.find(option => option.value === value));
    }, [value]);

    return (
        <ToggleBlock {...props} $isRounded={isRounded}>
            {options.map(item => {
                const isSelected = selectedOption?.value === item.value;
                return (
                    <ToggleOption
                        key={item.value.toString()}
                        $isChecked={isSelected}
                        $isRounded={isRounded}
                        onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            onChange(item.value);
                        }}
                    >
                        {item.label}
                    </ToggleOption>
                );
            })}
        </ToggleBlock>
    );
};

export default ToggleGroup;

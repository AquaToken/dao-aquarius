import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import useOnClickOutside from 'hooks/useOutsideClick';

import { COLORS } from 'web/styles';

import ArrowDown from 'assets/icon-arrow-down.svg';

import { noSelect } from '../../mixins';

const DropDown = styled.div<{ $isOpen: boolean; $disabled: boolean }>`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    min-height: 6.6rem;
    position: relative;
    cursor: pointer;
    border: ${({ $isOpen }) =>
        $isOpen ? `0.2rem solid ${COLORS.purple}` : `0.1rem solid ${COLORS.gray}`};
    border-radius: ${({ $isOpen }) => ($isOpen ? '0.5rem 0.5rem 0 0' : '0.5rem')};
    padding: ${({ $isOpen }) => ($isOpen ? '0.1rem' : '0.2rem')};
    box-sizing: border-box;
    pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
    font-size: 1.4rem;
    background-color: ${({ $disabled }) => ($disabled ? COLORS.lightGray : COLORS.white)};
    ${noSelect};

    &:hover {
        border-color: ${COLORS.purple};
    }
`;

const DropdownItem = styled.div`
    display: flex;
    align-items: center;
    height: 100%;
    width: 100%;
    padding: 2.4rem;
    box-sizing: border-box;
    cursor: pointer;
    font-size: 1.6rem;

    svg {
        margin-right: 0.8rem;
    }
`;

const Placeholder = styled(DropdownItem)`
    color: ${COLORS.placeholder};
`;

const DropdownArrow = styled(ArrowDown)<{ $isOpen: boolean }>`
    position: absolute;
    right: 1.4rem;
    top: 50%;
    padding: 1rem;
    box-sizing: content-box;
    transform-origin: center;
    transform: translateY(-50%) ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : '')};
    transition: transform linear 200ms;
    margin-right: ${({ $isOpen }) => ($isOpen ? '0' : '0.1rem')};
`;

const DropdownList = styled.div`
    position: absolute;
    left: -0.2rem;
    top: calc(100% + 0.2rem);
    background-color: ${COLORS.white};
    box-shadow: 0 2rem 3rem rgba(0, 6, 54, 0.06);
    width: calc(100% + 0.4rem);
    box-sizing: border-box;
    border-radius: 0 0 0.5rem 0.5rem;
    animation: openDropdown ease-in-out 0.2s;
    transform-origin: top center;
    max-height: 24rem;
    overflow-y: scroll;
    z-index: 10;

    &::-webkit-scrollbar {
        width: 0.5rem;
    }

    /* Track */
    &::-webkit-scrollbar-track {
        background: ${COLORS.white};
    }

    /* Handle */
    &::-webkit-scrollbar-thumb {
        background: ${COLORS.purple};
        border-radius: 0.25rem;
    }

    @keyframes openDropdown {
        0% {
            transform: scaleY(0);
        }
        80% {
            transform: scaleY(1.1);
        }
        100% {
            transform: scaleY(1);
        }
    }
`;

export type Option<T> = {
    label: string | React.ReactNode;
    value: T;
    icon?: React.ReactNode;
};

type SelectProps<T> = {
    options: Option<T>[];
    value: T;
    onChange: (value: T) => void;
    disabled?: boolean;
    placeholder?: string;
};

const Select = <T,>({
    options,
    value,
    onChange,
    disabled,
    placeholder,
    ...props
}: SelectProps<T>): React.ReactNode => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(
        options.find(option => option.value === value),
    );

    const selectRef = useRef(null);

    useOnClickOutside(selectRef, () => setIsOpen(false));

    const toggle = () => {
        setIsOpen(prev => !prev);
    };

    const onSelect = (item: Option<T>) => {
        onChange(item.value);
    };

    useEffect(() => {
        setSelectedOption(options.find(option => option.value === value));
    }, [value]);

    return (
        <DropDown
            $isOpen={isOpen}
            $disabled={disabled}
            ref={selectRef}
            onClick={() => toggle()}
            {...props}
        >
            <DropdownArrow $isOpen={isOpen} />
            {selectedOption && !isOpen ? (
                <DropdownItem>
                    {Boolean(selectedOption.icon) && selectedOption.icon}
                    {selectedOption?.label}
                </DropdownItem>
            ) : (
                <Placeholder>{placeholder || 'Select'}</Placeholder>
            )}

            {isOpen && (
                <DropdownList>
                    {options.map(option => (
                        <DropdownItem
                            key={option.value.toString()}
                            onClick={() => onSelect(option)}
                        >
                            {Boolean(option.icon) && option.icon}
                            {option.label}
                        </DropdownItem>
                    ))}
                </DropdownList>
            )}
        </DropDown>
    );
};

export default Select;

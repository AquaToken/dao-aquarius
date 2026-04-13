import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

import useOnClickOutside from 'hooks/useOutsideClick';

import { Option } from 'types/option';

import ArrowDown from 'assets/icons/arrows/arrow-down-16.svg';

import { cardBoxShadow, customScroll, noSelect, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS, Z_INDEX } from 'styles/style-constants';

const DropDown = styled.div<{ $isOpen: boolean; $disabled: boolean }>`
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    min-height: 6.6rem;
    position: relative;
    cursor: pointer;
    box-sizing: border-box;

    border-radius: ${({ $isOpen }) => ($isOpen ? '0.5rem 0.5rem 0 0' : '0.5rem')};
    background-color: ${({ $disabled }) => ($disabled ? COLORS.gray50 : COLORS.white)};
    pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
    font-size: 1.4rem;
    ${noSelect};

    box-shadow: inset 0 0 0 ${({ $isOpen }) => ($isOpen ? '0.2rem' : '0.1rem')}
        ${({ $isOpen }) => ($isOpen ? COLORS.purple500 : COLORS.gray100)};

    &:hover {
        box-shadow: inset 0 0 0 ${({ $isOpen }) => ($isOpen ? '0.2rem' : '0.1rem')}
            ${COLORS.purple500};
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

    &:hover {
        background-color: ${COLORS.gray50};
    }
`;

const DropdownItemIcon = styled.span`
    display: inline-flex;
    align-items: center;
    margin-right: 0.8rem;
`;

const DropdownItemHead = styled(DropdownItem)`
    padding: 0 6rem 0 1.2rem;
    min-height: 6.6rem;
    cursor: inherit;

    &:hover {
        background-color: transparent;
    }

    ${respondDown(Breakpoints.md)`
        padding: 1.2rem 6rem 1.2rem 1.2rem;;
    `}
`;

const Placeholder = styled(DropdownItem)`
    color: ${COLORS.gray200};
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
    background-color: ${COLORS.white};
    width: 100%;
    box-sizing: border-box;
    border-radius: 0 0 0.5rem 0.5rem;
    animation: openDropdown ease-in-out 0.2s;
    transform-origin: top center;
    max-height: 24rem;
    overflow-y: scroll;
    z-index: 10;
    ${customScroll};
    ${cardBoxShadow};

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

const DropdownInlineList = styled(DropdownList)`
    left: -0.2rem;
    top: calc(100% + 0.2rem);
    width: calc(100% + 0.4rem);
    z-index: 10;
`;

const DropdownPortalList = styled(DropdownList)<{ $top: number; $left: number; $width: number }>`
    position: fixed;
    top: ${({ $top }) => `${$top}px`};
    left: ${({ $left }) => `${$left}px`};
    width: ${({ $width }) => `${$width}px`};
    z-index: ${Z_INDEX.modal + 1};
`;

type SelectProps<T> = {
    options: Option<T>[];
    value: T;
    onChange: (value: T) => void;
    disabled?: boolean;
    placeholder?: string;
    usePortal?: boolean;
    headClassName?: string;
};

const Select = <T,>({
    options,
    value,
    onChange,
    disabled,
    placeholder,
    usePortal = false,
    headClassName,
    ...props
}: SelectProps<T>): React.ReactNode => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState<{
        top: number;
        left: number;
        width: number;
    } | null>(null);
    const [selectedOption, setSelectedOption] = useState(
        options.find(option => option.value === value),
    );

    const selectRef = useRef<HTMLDivElement>(null);

    useOnClickOutside(selectRef, () => setIsOpen(false));

    const toggle = () => {
        setIsOpen(prev => !prev);
    };

    const onSelect = (item: Option<T>, event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        onChange(item.value);
        setIsOpen(false);
    };

    useEffect(() => {
        setSelectedOption(options.find(option => option.value === value));
    }, [options, value]);

    useEffect(() => {
        if (!isOpen || !usePortal) {
            return;
        }

        const updateDropdownPosition = () => {
            if (!selectRef.current) {
                return;
            }

            const { bottom, left, width } = selectRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: bottom + 2,
                left,
                width: width + 4,
            });
        };

        updateDropdownPosition();

        window.addEventListener('resize', updateDropdownPosition);
        window.addEventListener('scroll', updateDropdownPosition, true);

        return () => {
            window.removeEventListener('resize', updateDropdownPosition);
            window.removeEventListener('scroll', updateDropdownPosition, true);
        };
    }, [isOpen, usePortal]);

    const dropdownContent = (
        <>
            {options.map(option => (
                <DropdownItem
                    key={option.value.toString()}
                    onClick={event => onSelect(option, event)}
                >
                    {Boolean(option.icon) && option.icon}
                    {option.label}
                </DropdownItem>
            ))}
        </>
    );

    const renderDropdown = () => {
        if (!isOpen) {
            return null;
        }

        if (usePortal && dropdownPosition && typeof document !== 'undefined') {
            return createPortal(
                <DropdownPortalList
                    $top={dropdownPosition.top}
                    $left={dropdownPosition.left - 2}
                    $width={dropdownPosition.width}
                    onMouseDown={event => event.stopPropagation()}
                    onTouchStart={event => event.stopPropagation()}
                >
                    {dropdownContent}
                </DropdownPortalList>,
                document.body,
            );
        }

        return (
            <DropdownInlineList
                onMouseDown={event => event.stopPropagation()}
                onTouchStart={event => event.stopPropagation()}
            >
                {dropdownContent}
            </DropdownInlineList>
        );
    };

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
                <DropdownItemHead className={headClassName}>
                    {Boolean(selectedOption.icon) && (
                        <DropdownItemIcon>{selectedOption.icon}</DropdownItemIcon>
                    )}
                    {selectedOption?.label}
                </DropdownItemHead>
            ) : (
                <Placeholder>{placeholder || 'Select'}</Placeholder>
            )}
            {renderDropdown()}
        </DropDown>
    );
};

export default Select;

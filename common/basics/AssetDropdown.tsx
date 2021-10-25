import * as React from 'react';
import styled from 'styled-components';
import ArrowDown from '../assets/img/icon-arrow-down.svg';
import { useRef, useState } from 'react';
import { COLORS } from '../styles';
import useOnClickOutside from '../hooks/useOutsideClick';

const DropDown = styled.div<{ isOpen: boolean }>`
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 6.6rem;
    position: relative;
    cursor: pointer;
    border: ${({ isOpen }) =>
        isOpen ? `0.2rem solid ${COLORS.purple}` : `0.1rem solid ${COLORS.gray}`};
    border-radius: ${({ isOpen }) => (isOpen ? '0.5rem 0.5rem 0 0' : '0.5rem')};
    padding: ${({ isOpen }) => (isOpen ? '0.1rem' : '0.2rem')};
    box-sizing: border-box;
`;

const DropdownSearch = styled.input`
    border: none;
    height: 100%;
    width: 100%;
    padding: 2.4rem;
    box-sizing: border-box;
    cursor: pointer;
`;

const DropdownArrow = styled(ArrowDown)<{ isOpen: boolean }>`
    position: absolute;
    right: 2.4rem;
    top: 50%;
    transform-origin: center;
    transform: translateY(-50%) ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : '')};
    transition: transform linear 200ms;
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
    overflow-y: auto;

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

const DropdownListItem = styled.div`
    height: 6.6rem;
    display: flex;
    align-items: center;
    padding: 0 2.4rem;
`;

type AssetDropdownProps = {
    defaultAsset?: any;
    onUpdate?: any;
    assets?: any;
};

const AssetDropdown = ({ defaultAsset, onUpdate, assets }: AssetDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useOnClickOutside(ref, () => setIsOpen(false));

    const toggleDropdown = () => {
        setIsOpen((prev) => !prev);
    };

    return (
        <DropDown onClick={() => toggleDropdown()} isOpen={isOpen} ref={ref}>
            <DropdownSearch placeholder="Search or pick asset" />
            <DropdownArrow isOpen={isOpen} />
            {isOpen && (
                <DropdownList>
                    {assets.map((asset) => (
                        <DropdownListItem>{asset.code}</DropdownListItem>
                    ))}
                </DropdownList>
            )}
        </DropDown>
    );
};

export default AssetDropdown;

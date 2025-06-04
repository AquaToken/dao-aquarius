import * as React from 'react';
import { forwardRef, RefObject } from 'react';
import styled from 'styled-components';

import { formatBalance } from 'helpers/format-number';

import { Delegatee as DelegateeType } from 'types/delegate';

import { cardBoxShadow, flexAllCenter, flexColumn, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Arrow from 'assets/icon-arrow-down.svg';

import PublicKeyWithIcon from 'basics/PublicKeyWithIcon';

const Container = styled.div<{ $isSelected: boolean }>`
    display: flex;
    flex-direction: column;
    background-color: ${COLORS.white};
    ${cardBoxShadow};
    padding: 2.4rem;
    border-radius: 2.4rem;
    margin-bottom: 2.4rem;
    cursor: pointer;
    border: ${({ $isSelected }) =>
        `0.2rem solid ${$isSelected ? COLORS.purple : COLORS.transparent}`};
    position: relative;

    ${respondDown(Breakpoints.md)`
        padding: 1.6rem;
    `}
`;

const IconWrapper = styled.div`
    height: 4.8rem;
    width: 4.8rem;
    border-radius: 50%;
    border: 0.2rem solid ${COLORS.lightGray};
    ${flexAllCenter};
    margin-right: 0.8rem;

    img {
        width: 3.2rem;
        border-radius: 50%;
    }
`;

const Row = styled.div<{ $isSelected: boolean }>`
    display: flex;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        border-bottom: ${({ $isSelected }) =>
            $isSelected ? `0.1rem solid ${COLORS.lightGray}` : 'none'};
        padding-bottom: ${({ $isSelected }) => ($isSelected ? '2.4rem' : '0')};
        gap: 1.6rem;
    `}
`;

const RowContent = styled.div`
    display: flex;

    &:first-child {
        margin-right: auto;
    }

    ${respondDown(Breakpoints.md)`
        &:last-child {
            justify-content: space-between;
        }
        
        &:first-child {
            margin-right: 0;
            align-items: center;
        }
    `}
`;

const ColumnInfo = styled.div`
    ${flexColumn};
    margin-right: 3.4rem;

    span:first-child {
        font-weight: 700;
        font-size: 1.6rem;
        line-height: 2.8rem;
        color: ${COLORS.titleText};
    }

    span:last-child {
        color: ${COLORS.grayText};
    }
`;

const ColumnRight = styled(ColumnInfo)`
    align-items: flex-end;

    ${respondDown(Breakpoints.md)`
        align-items: flex-start;
    `}
`;

const ArrowIcon = styled(Arrow)<{ $isSelected: boolean }>`
    display: none;
    transform: rotate(${({ $isSelected }) => ($isSelected ? '180deg' : '0')});
    transition: transform 0.2s;
    margin-left: auto;

    ${respondDown(Breakpoints.md)`
        display: flex;
    `}
`;

interface Props {
    isSelected: boolean;
    onDelegateClick: () => void;
    statsBlock: React.ReactNode;
    delegatee: DelegateeType;
}

const Delegatee = forwardRef(
    (
        { isSelected, onDelegateClick, statsBlock, delegatee }: Props,
        ref: RefObject<HTMLDivElement>,
    ) => (
        <Container ref={ref} $isSelected={isSelected} onClick={onDelegateClick}>
            <Row $isSelected={isSelected}>
                <RowContent>
                    <IconWrapper>
                        <img src={delegatee.image} alt={delegatee.name} width={32} />
                    </IconWrapper>
                    <ColumnInfo>
                        <span>{delegatee.name}</span>
                        <span>
                            <PublicKeyWithIcon pubKey={delegatee.account} lettersCount={4} />
                        </span>
                    </ColumnInfo>
                    <ArrowIcon $isSelected={isSelected} />
                </RowContent>

                <RowContent>
                    <ColumnRight>
                        <span>{formatBalance(Number(delegatee.managed_ice), true)}</span>
                        <span>Managed ICE</span>
                    </ColumnRight>
                    <ColumnRight>
                        <span>{formatBalance(Number(delegatee.delegated), true)}</span>
                        <span>Delegated</span>
                    </ColumnRight>
                </RowContent>
            </Row>
            {statsBlock}
        </Container>
    ),
);

Delegatee.displayName = 'Delegatee';

export default Delegatee;

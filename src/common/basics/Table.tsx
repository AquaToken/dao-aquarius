import * as React from 'react';
import { forwardRef, RefObject } from 'react';
import styled from 'styled-components';
import { Breakpoints, COLORS } from '../styles';
import { flexAllCenter, respondDown } from '../mixins';
import PageLoader from './PageLoader';
import { IconSort } from './Icons';

interface Sort {
    onClick: () => void;
    isEnabled: boolean;
    isReversed: boolean;
}

export enum CellAlign {
    Right = 'right',
    Left = 'left',
    Center = 'center',
}

interface TableItem {
    children: React.ReactNode | string;
    align?: CellAlign;
    flexSize?: number;
    label?: string;
    labelColor?: string;
    color?: string;
}

interface TableHeadItem extends TableItem {
    sort?: Sort;
}

interface TableRow {
    rowItems: TableItem[];
    onRowClick?: () => void;
    key: string;
    afterRow?: React.ReactNode;
    isNarrow?: boolean;
    mobileBackground?: string;
    mobileFontSize?: string;
}

interface TableProps {
    pending?: boolean;
    head: TableHeadItem[];
    body: TableRow[];
}

const Container = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative;
`;

const TableLoader = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 10;
    ${flexAllCenter};
    animation: showLoader 0.1s ease-in-out;

    @keyframes showLoader {
        0% {
            background-color: rgba(255, 255, 255, 0);
        }
        100% {
            background-color: rgba(255, 255, 255, 0.8);
        }
    }
`;

const TableHead = styled.div`
    display: flex;
    width: 100%;

    ${respondDown(Breakpoints.md)`
         display: none;
    `}
`;

const TableHeadRow = styled.div`
    display: flex;
    align-items: stretch;
    width: 100%;
    min-height: 5.2rem;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
    white-space: nowrap;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        background: ${COLORS.white};
        padding: 2.7rem 1.6rem 1.6rem;
        margin-bottom: 1.6rem;
    `}
`;

const Cell = styled.div<{
    align?: CellAlign;
    flexSize?: number;
    color?: string;
    labelColor?: string;
}>`
    display: flex;
    align-items: center;
    color: ${({ color }) => color ?? COLORS.paragraphText};
    justify-content: ${({ align }) => {
        switch (align) {
            case CellAlign.Left:
                return 'flex-start';
            case CellAlign.Center:
                return 'center';
            case CellAlign.Right:
                return 'flex-end';
            default:
                return 'flex-start';
        }
    }};

    flex: ${({ flexSize }) => flexSize ?? 1};

    label {
        display: none;
        color: ${({ labelColor }) => labelColor ?? COLORS.grayText};
    }

    ${respondDown(Breakpoints.md)`
        align-items: center;
        margin-bottom: 1.6rem;
          
        label {
            display: block;
            margin-right: auto;
            display: flex;
            align-items: center;
        }
    `}
`;

const HeadCell = styled(Cell)<{ withSort?: boolean }>`
    color: ${COLORS.grayText};
    cursor: ${({ withSort }) => (withSort ? 'pointer' : 'unset')};

    & > svg {
        margin-left: 0.4rem;
    }

    &:hover {
        color: ${({ withSort }) => (withSort ? COLORS.purple : COLORS.grayText)};
    }
`;

const TableBody = styled.div`
    display: flex;
    flex-direction: column;
`;

const TableRowWrap = styled.div<{
    isClickable?: boolean;
    mobileBackground?: string;
}>`
    border-radius: 0.5rem;
    cursor: ${({ isClickable }) => (isClickable ? 'pointer' : 'unset')};
    border: 0.1rem solid ${COLORS.transparent};
    padding: ${({ isClickable }) => (isClickable ? '0.8rem' : 'unset')};

    &:hover {
        background: ${({ isClickable }) => (isClickable ? COLORS.lightGray : 'unset')};
        border: 0.1rem solid
            ${({ isClickable }) => (isClickable ? COLORS.gray : COLORS.transparent)};
    }

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        background: ${({ mobileBackground }) => mobileBackground ?? COLORS.white};
        padding: 2.7rem 1.6rem 1.6rem;
        margin-bottom: 1.6rem;
        
        &:hover {
            background: ${({ isClickable, mobileBackground }) =>
                isClickable ? COLORS.lightGray : mobileBackground ?? COLORS.white};
        }
    `}
`;

const TableRow = styled.div<{ isNarrow?: boolean; mobileFontSize?: string }>`
    display: flex;
    align-items: stretch;
    width: 100%;
    min-height: ${({ isNarrow }) => (isNarrow ? '5rem' : '9.6rem')};
    font-size: 1.6rem;
    line-height: 2.8rem;
    position: relative;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        font-size: ${({ mobileFontSize }) => mobileFontSize ?? '1.6rem'};
    `}
`;

const Table = forwardRef(
    ({ pending, head, body, ...props }: TableProps, ref: RefObject<HTMLDivElement>) => {
        return (
            <Container ref={ref} {...props}>
                {pending && (
                    <TableLoader>
                        <PageLoader />
                    </TableLoader>
                )}
                <TableHead>
                    <TableHeadRow>
                        {head.map(({ children, sort, align, flexSize }) => (
                            <HeadCell
                                key={children.toString()}
                                align={align}
                                withSort={Boolean(sort)}
                                onClick={() => sort?.onClick()}
                                flexSize={flexSize}
                            >
                                {children}
                                {Boolean(sort) && (
                                    <IconSort
                                        isEnabled={sort.isEnabled}
                                        isReversed={sort.isReversed}
                                    />
                                )}
                            </HeadCell>
                        ))}
                    </TableHeadRow>
                </TableHead>
                <TableBody>
                    {body?.map((row) => (
                        <TableRowWrap
                            mobileBackground={row.mobileBackground}
                            isClickable={Boolean(row.onRowClick)}
                            onClick={() => row.onRowClick?.()}
                            key={row.key}
                        >
                            <TableRow isNarrow={row.isNarrow} mobileFontSize={row.mobileFontSize}>
                                {row?.rowItems.map(
                                    (
                                        { children, align, color, label, labelColor, flexSize },
                                        index,
                                    ) => (
                                        <Cell
                                            align={align}
                                            color={color}
                                            labelColor={labelColor}
                                            flexSize={flexSize}
                                            key={`${row.key}_${index}`}
                                        >
                                            {Boolean(label) && <label>{label}</label>}
                                            {children}
                                        </Cell>
                                    ),
                                )}
                            </TableRow>
                            {Boolean(row.afterRow) && row.afterRow}
                        </TableRowWrap>
                    ))}
                </TableBody>
            </Container>
        );
    },
);

export default Table;

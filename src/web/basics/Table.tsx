import * as React from 'react';
import { forwardRef, RefObject, useMemo } from 'react';
import * as Virtualized from 'react-virtualized';
import styled from 'styled-components';

import { flexAllCenter, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import { IconSort } from 'basics/Icons';
import PageLoader from 'basics/loaders/PageLoader';

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
    label?: string | React.ReactNode;
    labelColor?: string;
    color?: string;
    hideOnWeb?: boolean;
    hideOnMobile?: boolean;
    style?: React.CSSProperties;
    mobileStyle?: React.CSSProperties;
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
    style?: React.CSSProperties;
    hoverBackground?: string;
}

interface TableProps {
    pending?: boolean;
    head: TableHeadItem[];
    body: TableRow[];
    virtualScrollProps?: {
        loadMore: () => void;
        loadMoreOffset: number;
    };
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

const TableHeadRow = styled.div<{ $withPadding: boolean; $isClickable?: boolean }>`
    display: flex;
    align-items: stretch;
    width: 100%;
    min-height: 5.2rem;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
    white-space: nowrap;
    padding-right: ${({ $withPadding, $isClickable }) =>
        $withPadding ? '1.5rem' : $isClickable ? '3.2rem' : 'unset'};

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        background: ${COLORS.white};
        padding: 2.7rem rem 1.6rem;
        margin-bottom: 1.6rem;
    `}
`;

const Cell = styled.div<{
    $align?: CellAlign;
    $flexSize?: number;
    $label?: string;
    $labelColor?: string;
    $color?: string;
    $hideOnWeb?: boolean;
    $hideOnMobile?: boolean;
}>`
    display: ${({ $hideOnWeb }) => ($hideOnWeb ? 'none' : 'flex')};
    align-items: center;
    color: ${({ $color }) => $color ?? COLORS.paragraphText};
    justify-content: ${({ $align }) => {
        switch ($align) {
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

    flex: ${({ $flexSize }) => $flexSize ?? 1};

    label {
        display: none;
        color: ${({ $labelColor }) => $labelColor ?? COLORS.grayText};
    }

    ${respondDown(Breakpoints.md)`
        display: ${({ $hideOnMobile }) => ($hideOnMobile ? 'none' : 'flex')};
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

const HeadCell = styled(Cell)<{ $withSort?: boolean }>`
    color: ${COLORS.grayText};
    cursor: ${({ $withSort }) => ($withSort ? 'pointer' : 'unset')};

    & > svg {
        margin-left: 0.4rem;
    }

    &:hover {
        color: ${({ $withSort }) => ($withSort ? COLORS.purple : COLORS.grayText)};
    }
`;

const TableBody = styled.div<{ $withScroll: boolean }>`
    display: flex;
    flex-direction: column;

    height: ${({ $withScroll }) => ($withScroll ? '36rem' : 'unset')};

    ${respondDown(Breakpoints.md)`
        height: ${({ $withScroll }) => ($withScroll ? '50rem' : 'unset')};
    `}
`;

const ListStyled = styled(Virtualized.List)`
    padding-right: 1rem;

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
`;

const TableRowWrap = styled.div<{
    $isClickable?: boolean;
    $mobileBackground?: string;
    $hoverBackground?: string;
}>`
    border-radius: 0.5rem;
    cursor: ${({ $isClickable }) => ($isClickable ? 'pointer' : 'unset')};
    border: 0.1rem solid ${COLORS.transparent};
    padding: ${({ $isClickable }) => ($isClickable ? '0.8rem 3.2rem 0.8rem 0.8rem' : 'unset')};

    &:hover {
        background: ${({ $isClickable, $hoverBackground }) =>
            $isClickable ? $hoverBackground ?? COLORS.lightGray : 'unset'}!important;
        border: 0.1rem solid
            ${({ $isClickable }) => ($isClickable ? COLORS.gray : COLORS.transparent)};
    }

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        background: ${({ $mobileBackground }) => $mobileBackground ?? COLORS.white};
        padding: 2.7rem 1.6rem 1.6rem;
        margin-bottom: 1.6rem;
        
        &:hover {
            background: ${({ $isClickable, $mobileBackground, $hoverBackground }) =>
                $isClickable
                    ? $hoverBackground ?? COLORS.lightGray
                    : $mobileBackground ?? COLORS.white}!important;
        }
    `}
`;

const TableRow = styled.div<{ $isNarrow?: boolean; $mobileFontSize?: string }>`
    display: flex;
    align-items: stretch;
    width: 100%;
    min-height: ${({ $isNarrow }) => ($isNarrow ? '5rem' : '9.6rem')};
    font-size: 1.6rem;
    line-height: 2.8rem;
    position: relative;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        font-size: ${({ $mobileFontSize }) => $mobileFontSize ?? '1.6rem'};
    `}
`;

const CellContent = styled.div`
    display: flex;
    align-items: center;
`;

const Row = ({ row }: { row: TableRow; style?: React.CSSProperties }): React.ReactNode => (
    <TableRowWrap
        $mobileBackground={row.mobileBackground}
        $isClickable={Boolean(row.onRowClick)}
        $hoverBackground={row.hoverBackground}
        onClick={() => row.onRowClick?.()}
        style={row.style}
    >
        <TableRow $isNarrow={row.isNarrow} $mobileFontSize={row.mobileFontSize}>
            {row?.rowItems.map(
                (
                    {
                        children,
                        align,
                        color,
                        label,
                        labelColor,
                        flexSize,
                        hideOnWeb,
                        hideOnMobile,
                        style,
                        mobileStyle,
                    },
                    index,
                ) => (
                    <Cell
                        key={`${row.key}_${index}`}
                        $align={align}
                        $color={color}
                        $labelColor={labelColor}
                        $flexSize={flexSize}
                        $hideOnWeb={hideOnWeb}
                        $hideOnMobile={hideOnMobile}
                    >
                        {Boolean(label) && <label>{label}</label>}
                        <CellContent style={+window.innerWidth > 992 ? style : mobileStyle}>
                            {children}
                        </CellContent>
                    </Cell>
                ),
            )}
        </TableRow>
        {Boolean(row.afterRow) && row.afterRow}
    </TableRowWrap>
);

const Table = forwardRef(
    (
        { pending, head, body, virtualScrollProps, ...props }: TableProps,
        ref: RefObject<HTMLDivElement>,
    ) => {
        const rowHeight = useMemo(() => {
            if (+window.innerWidth > 992) {
                return body[0]?.isNarrow ? 50 : 96;
            }
            return body[0]?.rowItems.length * 50 + 50;
        }, [body]);

        const rowMargin = +window.innerWidth > 992 ? 0 : 16;

        return (
            <Container ref={ref} {...props}>
                {pending && (
                    <TableLoader>
                        <PageLoader />
                    </TableLoader>
                )}
                <TableHead>
                    <TableHeadRow
                        $withPadding={Boolean(virtualScrollProps)}
                        $isClickable={Boolean(body[0]?.onRowClick)}
                    >
                        {head.map(
                            (
                                { children, sort, align, flexSize, hideOnWeb, hideOnMobile },
                                index,
                            ) => (
                                <HeadCell
                                    key={`${children.toString()}_${index}`}
                                    onClick={() => sort?.onClick()}
                                    $align={align}
                                    $withSort={Boolean(sort)}
                                    $flexSize={flexSize}
                                    $hideOnWeb={hideOnWeb}
                                    $hideOnMobile={hideOnMobile}
                                >
                                    {children}
                                    {Boolean(sort) && (
                                        <IconSort
                                            isEnabled={sort.isEnabled}
                                            isReversed={sort.isReversed}
                                        />
                                    )}
                                </HeadCell>
                            ),
                        )}
                    </TableHeadRow>
                </TableHead>
                <TableBody $withScroll={Boolean(virtualScrollProps)}>
                    {virtualScrollProps ? (
                        <Virtualized.AutoSizer>
                            {({ height, width }) => (
                                <Virtualized.InfiniteLoader
                                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                    // @ts-ignore
                                    isRowLoaded={() => {}}
                                    rowCount={body.length}
                                    loadMoreRows={(e: Virtualized.IndexRange) => {
                                        if (
                                            e.stopIndex + virtualScrollProps.loadMoreOffset >
                                            body.length
                                        ) {
                                            virtualScrollProps.loadMore();
                                        }
                                        return Promise.resolve();
                                    }}
                                >
                                    {({ onRowsRendered, registerChild }) => (
                                        <ListStyled
                                            width={width}
                                            height={height}
                                            onRowsRendered={onRowsRendered}
                                            ref={registerChild}
                                            rowHeight={rowHeight}
                                            rowCount={body.length}
                                            rowRenderer={({ key, index, style }) => (
                                                <Row
                                                    row={body[index]}
                                                    key={key}
                                                    style={{
                                                        ...style,
                                                        height: rowHeight - rowMargin,
                                                    }}
                                                />
                                            )}
                                        />
                                    )}
                                </Virtualized.InfiniteLoader>
                            )}
                        </Virtualized.AutoSizer>
                    ) : (
                        body?.map(row => <Row row={row} key={row.key} />)
                    )}
                </TableBody>
            </Container>
        );
    },
);

Table.displayName = 'Table';

export default Table;

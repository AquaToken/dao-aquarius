import * as React from 'react';
import { forwardRef, RefObject, useMemo } from 'react';
import * as Virtualized from 'react-virtualized';
import styled from 'styled-components';

import { IconSort } from 'basics/icons';
import PageLoader from 'basics/loaders/PageLoader';

import { customScroll, flexAllCenter, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

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
}

interface TableProps {
    pending?: boolean;
    head: TableHeadItem[];
    body: TableRow[];
    virtualScrollProps?: {
        loadMore: () => void;
        loadMoreOffset: number;
    };
    mobileBreakpoint?: Breakpoints;
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

const TableHead = styled.div<{ $mobileBreakpoint: Breakpoints }>`
    display: flex;
    width: 100%;

    ${({ $mobileBreakpoint }) => respondDown($mobileBreakpoint)`
         display: none;
    `}
`;

const TableHeadRow = styled.div<{
    $withPadding: boolean;
    $bodyIsClickable: boolean;
    $mobileBreakpoint: Breakpoints;
}>`
    display: flex;
    align-items: stretch;
    width: 100%;
    min-height: 5.2rem;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.textGray};
    white-space: nowrap;
    padding-right: ${({ $withPadding }) => ($withPadding ? '1.5rem' : 'unset')};
    padding: ${({ $bodyIsClickable }) => ($bodyIsClickable ? '0.8rem' : 'unset')};

    ${({ $mobileBreakpoint }) => respondDown($mobileBreakpoint)`
        flex-direction: column;
        background: ${COLORS.white};
        padding: 2.7rem 1.6rem 1.6rem;
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
    $mobileBreakpoint: Breakpoints;
}>`
    display: ${({ $hideOnWeb }) => ($hideOnWeb ? 'none' : 'flex')};
    align-items: center;
    color: ${({ $color }) => $color ?? COLORS.textTertiary};
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
        color: ${({ $labelColor }) => $labelColor ?? COLORS.textGray};
    }

    ${({ $mobileBreakpoint }) => respondDown($mobileBreakpoint)`
        display: ${({ $hideOnMobile }) => ($hideOnMobile ? 'none' : 'flex')};
        align-items: center;
        margin-bottom: 1.6rem;
          
        label {
            margin-right: auto;
            display: flex;
            align-items: center;
        }
    `}
`;

const HeadCell = styled(Cell)<{ $withSort?: boolean; $sortActive?: boolean }>`
    color: ${COLORS.textGray};
    cursor: ${({ $withSort }) => ($withSort ? 'pointer' : 'unset')};
    font-weight: ${({ $sortActive }) => ($sortActive ? 700 : 400)};

    & > svg {
        margin-left: 0.4rem;
    }

    &:hover {
        color: ${({ $withSort }) => ($withSort ? COLORS.purple500 : COLORS.textGray)};
    }

    & > div {
        display: flex;
        align-items: center;
    }
`;

const TableBody = styled.div<{ $withScroll: boolean; $mobileBreakpoint: Breakpoints }>`
    display: flex;
    flex-direction: column;

    height: ${({ $withScroll }) => ($withScroll ? '36rem' : 'unset')};

    ${({ $mobileBreakpoint }) => respondDown($mobileBreakpoint)`
        height: ${({ $withScroll }) => ($withScroll ? '50rem' : 'unset')};
    `}
`;

const ListStyled = styled(Virtualized.List)`
    padding-right: 1rem;
    ${customScroll};
`;

const TableRowWrap = styled.div<{
    $isClickable?: boolean;
    $mobileBackground?: string;
    $mobileBreakpoint: Breakpoints;
}>`
    border-radius: 0.5rem;
    cursor: ${({ $isClickable }) => ($isClickable ? 'pointer' : 'unset')};
    border: 0.1rem solid ${COLORS.transparent};
    padding: ${({ $isClickable }) => ($isClickable ? '0.8rem' : 'unset')};

    &:hover {
        background: ${({ $isClickable }) => ($isClickable ? COLORS.gray50 : 'unset')};
        border: 0.1rem solid
            ${({ $isClickable }) => ($isClickable ? COLORS.gray100 : COLORS.transparent)};
    }

    ${({ $mobileBreakpoint }) => respondDown($mobileBreakpoint)`
        flex-direction: column;
        background: ${({ $mobileBackground }) => $mobileBackground ?? COLORS.white};
        padding: 2.7rem 1.6rem 1.6rem;
        margin-bottom: 1.6rem;
        
        &:hover {
            background: ${({ $isClickable, $mobileBackground }) =>
                $isClickable ? COLORS.gray50 : $mobileBackground ?? COLORS.white};
        }
    `}
`;

const TableRow = styled.div<{
    $isNarrow?: boolean;
    $mobileFontSize?: string;
    $mobileBreakpoint: Breakpoints;
}>`
    display: flex;
    align-items: stretch;
    width: 100%;
    min-height: ${({ $isNarrow }) => ($isNarrow ? '5rem' : '9.6rem')};
    font-size: 1.6rem;
    line-height: 2.8rem;
    position: relative;

    ${({ $mobileBreakpoint }) => respondDown($mobileBreakpoint)`
        flex-direction: column;
        font-size: ${({ $mobileFontSize }) => $mobileFontSize ?? '1.6rem'};
    `}
`;

const CellContent = styled.div`
    display: flex;
    align-items: center;
`;

const Row = ({
    row,
    style,
    $mobileBreakpoint,
}: {
    row: TableRow;
    style?: React.CSSProperties;
    $mobileBreakpoint: Breakpoints;
}): React.ReactNode => (
    <TableRowWrap
        $mobileBackground={row.mobileBackground}
        $isClickable={Boolean(row.onRowClick)}
        onClick={() => row.onRowClick?.()}
        style={style}
        $mobileBreakpoint={$mobileBreakpoint}
    >
        <TableRow
            $isNarrow={row.isNarrow}
            $mobileFontSize={row.mobileFontSize}
            $mobileBreakpoint={$mobileBreakpoint}
        >
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
                        $mobileBreakpoint={$mobileBreakpoint}
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
        {
            pending,
            head,
            body,
            virtualScrollProps,
            mobileBreakpoint = Breakpoints.md,
            ...props
        }: TableProps,
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
                <TableHead $mobileBreakpoint={mobileBreakpoint}>
                    <TableHeadRow
                        $withPadding={Boolean(virtualScrollProps)}
                        $bodyIsClickable={Boolean(body?.[0]?.onRowClick)}
                        $mobileBreakpoint={mobileBreakpoint}
                    >
                        {head.map(
                            (
                                { children, sort, align, flexSize, hideOnWeb, hideOnMobile, style },
                                index,
                            ) => (
                                <HeadCell
                                    key={`${children.toString()}_${index}`}
                                    onClick={() => sort?.onClick()}
                                    $align={align}
                                    $withSort={Boolean(sort)}
                                    $sortActive={sort?.isEnabled}
                                    $flexSize={flexSize}
                                    $hideOnWeb={hideOnWeb}
                                    $hideOnMobile={hideOnMobile}
                                    $mobileBreakpoint={mobileBreakpoint}
                                >
                                    <div style={style}>
                                        {children}
                                        {Boolean(sort) && (
                                            <IconSort
                                                isEnabled={sort.isEnabled}
                                                isReversed={sort.isReversed}
                                            />
                                        )}
                                    </div>
                                </HeadCell>
                            ),
                        )}
                    </TableHeadRow>
                </TableHead>
                <TableBody
                    $withScroll={Boolean(virtualScrollProps)}
                    $mobileBreakpoint={mobileBreakpoint}
                >
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
                                                    $mobileBreakpoint={mobileBreakpoint}
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
                        body?.map(row => (
                            <Row
                                row={row}
                                key={row.key}
                                style={row.style}
                                $mobileBreakpoint={mobileBreakpoint}
                            />
                        ))
                    )}
                </TableBody>
            </Container>
        );
    },
);

Table.displayName = 'Table';

export default Table;

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import { Breakpoints, COLORS } from '../styles';
import Left from '../assets/img/icon-arrow-left.svg';
import Right from '../assets/img/icon-arrow-right.svg';
import { flexAllCenter, respondDown } from '../mixins';

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    padding: 3.2rem 0;
    border-top: 0.1rem solid ${COLORS.gray};
    margin-top: 1.6rem;
    justify-content: space-between;
    color: ${COLORS.grayText};

    &::after {
        content: '';
        flex: 1;
    }

    ${respondDown(Breakpoints.md)`
        flex-direction: column-reverse;
        align-items: center;
    `}
`;

const PaginationState = styled.div`
    flex: 1;
`;

const PaginationControls = styled.div`
    ${flexAllCenter};

    ${respondDown(Breakpoints.md)`
        margin-bottom: 1.6rem;
    `}
`;

const arrowStyle = css`
    cursor: pointer;
    margin: 0 1.2rem;
`;

const ArrowLeft = styled(Left)`
    ${arrowStyle};
`;

const ArrowRight = styled(Right)`
    ${arrowStyle};
`;

const BlackText = styled.span`
    color: ${COLORS.paragraphText};
`;

type PaginationProps = {
    pageSize: number;
    totalCount: number;
    onPageChange: (number) => void;
    currentPage: number;
    itemName: string;
};

const PageButton = styled.span<{ isActive: boolean }>`
    padding: 0 1.2rem;
    cursor: pointer;
    color: ${({ isActive }) => (isActive ? COLORS.paragraphText : COLORS.grayText)};
`;

const PAGES_CONTROLS_COUNT = 3;

const getVisiblePages = (pages: number[], currentPage: number): number[] => {
    if (pages.length <= PAGES_CONTROLS_COUNT) {
        return pages;
    }

    if (currentPage === 1) {
        return pages.slice(0, PAGES_CONTROLS_COUNT);
    }

    if (currentPage === pages.length) {
        return pages.slice(-PAGES_CONTROLS_COUNT);
    }

    return pages.slice(currentPage - 2, currentPage - 2 + PAGES_CONTROLS_COUNT);
};

const Pagination = ({
    pageSize,
    totalCount,
    onPageChange,
    currentPage,
    itemName,
}: PaginationProps) => {
    const [page, setPage] = useState(currentPage);
    const currentItems = `${(page - 1) * pageSize + 1} - ${
        page * pageSize > totalCount ? totalCount : page * pageSize
    }`;

    useEffect(() => {
        setPage(currentPage);
    }, [currentPage]);

    const pages = useMemo(() => {
        const pagesCount = Math.ceil(totalCount / pageSize);
        return Array.from(Array(pagesCount), (_, i) => i + 1);
    }, [totalCount, pageSize]);

    if (totalCount <= pageSize) {
        return null;
    }

    const visiblePages = getVisiblePages(pages, page);

    const onPageClick = (clickedPage: number): void => {
        if (page !== clickedPage) {
            onPageChange(clickedPage);
        }
    };

    const nextPage = () => {
        if (page !== pages.length) {
            onPageChange(page + 1);
        }
    };

    const prevPage = () => {
        if (page !== 1) {
            onPageChange(page - 1);
        }
    };

    return (
        <Container>
            <PaginationState>
                <BlackText>{currentItems}</BlackText> of <BlackText>{totalCount}</BlackText>{' '}
                {itemName}
            </PaginationState>
            <PaginationControls>
                <ArrowLeft onClick={() => prevPage()} />
                {visiblePages.map((pageItem) => (
                    <PageButton
                        key={pageItem}
                        isActive={page === pageItem}
                        onClick={() => onPageClick(pageItem)}
                    >
                        {pageItem}
                    </PageButton>
                ))}
                <ArrowRight onClick={() => nextPage()} />
            </PaginationControls>
        </Container>
    );
};

export default Pagination;

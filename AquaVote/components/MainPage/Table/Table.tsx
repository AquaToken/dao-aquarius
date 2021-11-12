import * as React from 'react';
import styled from 'styled-components';
import { IconSort } from '../../../../common/basics/Icons';
import { useState } from 'react';
import { COLORS } from '../../../../common/styles';
import Button from '../../../../common/basics/Button';
import IconsPair from '../../PairIcons/IconsPair';

const TableBlock = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;
const TableHead = styled.div`
    display: flex;
    width: 100%;
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
`;

const TableCell = styled.div`
    display: flex;
    align-items: center;
    flex: 2 0 0;
    min-width: 14rem;
    max-width: 100%;
    &:first-child {
        flex: 4;
        min-width: 48rem;
    }
    &:nth-child(2) {
        flex: 1;
        min-width: 10rem;
    }
    &:last-child {
        justify-content: flex-end;
        min-width: 17rem;
    }
`;

const TableBody = styled.div`
    display: flex;
    flex-direction: column;
`;

const TableBodyRow = styled.div`
    display: flex;
    align-items: stretch;
    width: 100%;
    min-height: 9.6rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};

    ${TableCell}:nth-child(2) {
        font-size: 1.4rem;
        line-height: 2rem;
        color: ${COLORS.grayText};
    }
`;

const SortingHeader = styled.button`
    background: none;
    border: none;
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
    padding: 0;
    margin: 0;
    width: 100%;
    height: 100%;
    color: inherit;

    display: flex;
    align-items: center;
    justify-content: ${({ position }: { position?: string }) => {
        if (position === 'right') return 'flex-end';
        if (position === 'left') return 'flex-start';
        return 'center';
    }};

    & > svg {
        margin-left: 0.4rem;
    }
    &:hover {
        color: ${COLORS.purple};
    }
`;

const AssetsContainer = styled.div`
    margin-left: 1.6rem;
`;
const IssuersPair = styled.div`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
`;

const firstAsset = {
    code: 'BTC',
    issuer: 'GAUTUYY2THLF7SGITDFMXJVYH3LHDSMGEAKSBU267M2K7A3W543CKUEF',
    asset_string: 'BTC:GAUTUYY2THLF7SGITDFMXJVYH3LHDSMGEAKSBU267M2K7A3W543CKUEF',
    home_domain: 'apay.io',
    name: 'Bitcoin',
    image: 'https://apay.io/public/logo/btc.svg',
};

const secondAsset = {
    code: 'yXLM',
    issuer: 'GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55',
    asset_string: 'yXLM:GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55',
    home_domain: 'ultrastellar.com',
    name: '',
    image: 'https://ultrastellar.com/static/images/icons/yXLM.png',
};

const Table = (): JSX.Element => {
    const [sort, setSort] = useState('');
    const [isReversedSort, setIsReversedSort] = useState(false);

    const changeSort = (newSort) => {
        const isEqualSort = sort === newSort;
        setSort(newSort);
        setIsReversedSort(isEqualSort ? !isReversedSort : false);
    };

    const assetsPairs = new Array(7).fill(null);

    return (
        <TableBlock>
            <TableHead>
                <TableHeadRow>
                    <TableCell>
                        <SortingHeader position="left" onClick={() => changeSort('Pair')}>
                            Pair{' '}
                            <IconSort isEnabled={sort === 'Pair'} isReversed={isReversedSort} />
                        </SortingHeader>
                    </TableCell>
                    <TableCell>
                        <SortingHeader position="left" onClick={() => changeSort('Users Voted')}>
                            Users Voted{' '}
                            <IconSort
                                isEnabled={sort === 'Users Voted'}
                                isReversed={isReversedSort}
                            />
                        </SortingHeader>
                    </TableCell>
                    <TableCell>
                        <SortingHeader
                            position="left"
                            onClick={() => changeSort('Your AQUA in Vote')}
                        >
                            Your AQUA in Vote{' '}
                            <IconSort
                                isEnabled={sort === 'Your AQUA in Vote'}
                                isReversed={isReversedSort}
                            />
                        </SortingHeader>
                    </TableCell>
                    <TableCell>
                        <SortingHeader position="left" onClick={() => changeSort('AQUA Voted')}>
                            AQUA Voted{' '}
                            <IconSort
                                isEnabled={sort === 'AQUA Voted'}
                                isReversed={isReversedSort}
                            />
                        </SortingHeader>
                    </TableCell>
                    <TableCell />
                </TableHeadRow>
            </TableHead>
            <TableBody>
                {assetsPairs.map((pair, index) => {
                    return (
                        <TableBodyRow key={index}>
                            <TableCell>
                                <IconsPair firstAsset={firstAsset} secondAsset={secondAsset} />
                                <AssetsContainer>
                                    <div>
                                        {firstAsset.code} / {secondAsset.code}
                                    </div>
                                    <IssuersPair>
                                        {firstAsset.name || firstAsset.code} (
                                        {firstAsset.home_domain}) &#183;{' '}
                                        {secondAsset.name || secondAsset.code} (
                                        {secondAsset.home_domain})
                                    </IssuersPair>
                                </AssetsContainer>
                            </TableCell>
                            <TableCell>12,811</TableCell>
                            <TableCell> </TableCell>
                            <TableCell>155,042 AQUA</TableCell>
                            <TableCell>
                                <Button>Add To Vote</Button>
                            </TableCell>
                        </TableBodyRow>
                    );
                })}
            </TableBody>
        </TableBlock>
    );
};

export default Table;

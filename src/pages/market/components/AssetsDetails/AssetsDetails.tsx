import * as React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getAssetDetails } from 'api/stellar-expert';

import { getDateString } from 'helpers/date';
import { formatBalance } from 'helpers/format-number';

import { ModalService } from 'services/globalServices';

import { ClassicToken } from 'types/token';

import { respondDown } from 'web/mixins';
import AssetInfoModal from 'web/modals/AssetInfoModal';
import { Breakpoints, COLORS } from 'web/styles';

import Asset from 'basics/Asset';
import Changes24 from 'basics/Changes24';
import ExternalLink from 'basics/ExternalLink';
import { PageLoader } from 'basics/loaders';

const Table = styled.div`
    display: flex;
    width: 100%;

    ${respondDown(Breakpoints.sm)`
        flex-direction: column;
        gap: 3rem
    `}
`;

const Column = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
`;

const TitleColumn = styled(Column)`
    ${respondDown(Breakpoints.sm)`
        display: none;
    `}
`;

const Cell = styled.div`
    color: ${COLORS.paragraphText};
    margin-bottom: 0.8rem;
    display: flex;
    align-items: center;
    height: 2.4rem;

    span:last-child {
        text-align: right;
    }

    ${respondDown(Breakpoints.sm)`
        justify-content: space-between;
    `}
`;

const TitleCell = styled(Cell)`
    color: ${COLORS.grayText};
`;

const MobileLabel = styled.span`
    color: ${COLORS.grayText};
    display: none;

    ${respondDown(Breakpoints.sm)`
        display: inline;
    `}
`;

interface Props {
    assets: ClassicToken[];
}

const AssetsDetails = ({ assets }: Props) => {
    const [details, setDetails] = useState(null);

    useEffect(() => {
        Promise.all(assets.map(asset => getAssetDetails(asset))).then(res => {
            setDetails(res);
        });
    }, []);

    if (!details) {
        return <PageLoader />;
    }

    return (
        <Table>
            <TitleColumn>
                <TitleCell>Asset:</TitleCell>
                <TitleCell>24h change:</TitleCell>
                <TitleCell>Current price:</TitleCell>
                <TitleCell>Asset holders:</TitleCell>
                <TitleCell>Payments volume:</TitleCell>
                <TitleCell>Trading volume:</TitleCell>
                <TitleCell>First transaction:</TitleCell>
                <TitleCell>More info:</TitleCell>
            </TitleColumn>
            {assets.map((asset, index) => (
                <Column key={asset.code + asset.issuer}>
                    <Cell>
                        <MobileLabel>Asset:</MobileLabel>
                        <Asset asset={asset} logoAndCode />
                    </Cell>
                    <Cell>
                        <MobileLabel>24h change:</MobileLabel>
                        <Changes24 expertData={details[index]} />
                    </Cell>
                    <Cell>
                        <MobileLabel>Current price:</MobileLabel>
                        <span>
                            $
                            {formatBalance(
                                details[index]?.price7d?.[
                                    details[index]?.price7d.length - 1
                                ]?.[1] ?? 0,
                                true,
                            )}
                        </span>
                    </Cell>
                    <Cell>
                        <MobileLabel>Asset holders:</MobileLabel>
                        <span>{formatBalance(details[index]?.trustlines[0])}</span>
                    </Cell>
                    <Cell>
                        <MobileLabel>Payments volume:</MobileLabel>
                        <span>
                            {formatBalance(details[index]?.payments_amount / 1e7, true, true)}{' '}
                            {asset.code}
                        </span>
                    </Cell>
                    <Cell>
                        <MobileLabel>Trading volume:</MobileLabel>
                        <span>
                            {formatBalance(details[index]?.traded_amount / 1e7, true, true)}{' '}
                            {asset.code}
                        </span>
                    </Cell>
                    <Cell>
                        <MobileLabel>First transaction:</MobileLabel>
                        <span>
                            {details[index]?.created
                                ? getDateString(details[index]?.created * 1000)
                                : '-'}
                        </span>
                    </Cell>
                    <Cell>
                        <MobileLabel>More info:</MobileLabel>
                        {asset.isNative() ? (
                            '-'
                        ) : (
                            <ExternalLink
                                asDiv
                                onClick={() => ModalService.openModal(AssetInfoModal, { asset })}
                            >
                                Details
                            </ExternalLink>
                        )}
                    </Cell>
                </Column>
            ))}
        </Table>
    );
};

export default AssetsDetails;

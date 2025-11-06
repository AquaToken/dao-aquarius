import * as React from 'react';
import { useCallback } from 'react';
import styled from 'styled-components';

import { getAssetString } from 'helpers/assets';
import getExplorerLink, { ExplorerSection } from 'helpers/explorer-links';
import { truncateString } from 'helpers/truncate-string';

import { LumenInfo } from 'store/assetsStore/reducer';
import useAssetsStore from 'store/assetsStore/useAssetsStore';

import { ModalService } from 'services/globalServices';

import { ClassicToken, Token, TokenType } from 'types/token';

import Arrow from 'assets/icons/arrows/arrow-alt2-16.svg';

import AssetLogo from 'basics/AssetLogo';

import AssetInfoModal from 'modals/AssetInfoModal';

import { flexAllCenter, respondDown } from '../mixins';
import { Breakpoints, COLORS } from '../styles';

const ArrowRightContainer = styled.div`
    position: absolute;
    top: calc(50% - 2rem);
    left: calc(50% - 2rem);
    background-color: ${COLORS.white};
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    border: 0.1rem solid ${COLORS.gray100};
    ${flexAllCenter}
    ${respondDown(Breakpoints.md)`
        transform: rotate(90deg);
    `}
`;

const ArrowRight = styled(Arrow)`
    path {
        fill: ${COLORS.purple950};
    }
`;

const SegmentContainer = styled.div`
    position: relative;
    display: flex;
    gap: 16px;
    ${respondDown(Breakpoints.md)`
        flex-direction: column;
    `}
`;

const Segment = styled.div`
    display: flex;
    align-items: center;
    border-radius: 2.4rem;
    padding: 2.4rem;
    width: 100%;
    gap: 0.8rem;
    background-color: ${COLORS.gray50};
`;

const CodeContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const Code = styled.span`
    color: ${COLORS.textTertiary};
    font-size: 2.2rem;
    font-weight: 400;
    line-height: 100%;
    vertical-align: middle;
`;

const Description = styled.span`
    color: ${COLORS.textGray};
    font-size: 1rem;
`;

const DescriptionName = styled.span``;

const DescriptionDomain = styled.span`
    cursor: pointer;
    &:hover {
        text-decoration: underline;
        text-decoration-style: dashed;
    }
`;

type Props = {
    assets: [Token, Token];
};

const SwapTokenDirection = ({ assets }: Props) => {
    const { assetsInfo } = useAssetsStore();

    const getAssetDetails = useCallback((asset: Token) => {
        if (asset.type === TokenType.soroban) {
            return [asset.name, 'soroban token'];
        }
        if (asset?.isNative?.()) {
            return [LumenInfo.name, LumenInfo.home_domain];
        }

        const { name, home_domain } = assetsInfo.get(getAssetString(asset)) || {};

        return [name || asset.code, home_domain || truncateString(asset.issuer, 4)];
    }, []);

    const onDomainClick = useCallback(async (e: React.MouseEvent, asset: Token) => {
        e.preventDefault();
        e.stopPropagation();

        if (asset.type === TokenType.soroban) {
            window.open(getExplorerLink(ExplorerSection.contract, asset.contract), '_blank');
            return;
        }

        await ModalService.openModal(AssetInfoModal, { asset });
    }, []);

    const AssetSegment = useCallback((asset: Token) => {
        const [name, domain] = getAssetDetails(asset);
        const isNative = (asset as ClassicToken)?.isNative?.() ?? false;
        return (
            <Segment>
                <AssetLogo size={4} asset={asset} />
                <CodeContainer>
                    <Code>{asset.code}</Code>
                    <Description>
                        <DescriptionName>{name}</DescriptionName>
                        <span>&nbsp;</span>
                        {isNative ? (
                            <span>({domain})</span>
                        ) : (
                            <DescriptionDomain
                                onClick={(event: React.MouseEvent) => onDomainClick(event, asset)}
                            >
                                ({domain})
                            </DescriptionDomain>
                        )}
                    </Description>
                </CodeContainer>
            </Segment>
        );
    }, []);

    return (
        <SegmentContainer>
            {AssetSegment(assets[0])}
            <ArrowRightContainer>
                <ArrowRight />
            </ArrowRightContainer>
            {AssetSegment(assets[1])}
        </SegmentContainer>
    );
};

export default SwapTokenDirection;

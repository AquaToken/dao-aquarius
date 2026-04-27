import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { AppRoutes } from 'constants/routes';

import { getAssetString, getEnvClassicAssetData } from 'helpers/assets';
import { createLumen } from 'helpers/token';

import { ModalService } from 'services/globalServices';

import { ModalProps } from 'types/modal';
import { ClassicToken } from 'types/token';

import Button from 'basics/buttons/Button';
import { ModalWrapper } from 'basics/ModalAtoms';

import AssetInfoContent from 'components/AssetInfoContent/AssetInfoContent';
import NoTrustline from 'components/NoTrustline';

import { respondDown } from 'styles/mixins';
import { Breakpoints } from 'styles/style-constants';

const Buttons = styled.div`
    display: flex;
    margin-top: 3.2rem;
    gap: 1.2rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
    `}
`;

const LinkStyled = styled(Link)`
    display: flex;
    flex: 1;
    text-decoration: none;

    Button {
        width: 100%;
        flex: 1;
    }
`;

interface AssetInfoModalParams {
    asset: ClassicToken;
}

const AssetInfoModal = ({ params }: ModalProps<AssetInfoModalParams>): React.ReactNode => {
    const { asset } = params;
    const {
        code: aquaCode,
        issuer: aquaIssuer,
        asset: aquaStellarAsset,
    } = getEnvClassicAssetData('aqua');

    return (
        <ModalWrapper $isWide>
            <AssetInfoContent asset={asset} />
            <Buttons>
                <LinkStyled
                    to={AppRoutes.section.swap.to.index({
                        source: getAssetString(asset),
                        destination: getAssetString(
                            asset.code === aquaCode && asset.issuer === aquaIssuer
                                ? createLumen()
                                : aquaStellarAsset,
                        ),
                    })}
                    onClick={() => ModalService.closeAllModals()}
                >
                    <Button isBig>swap</Button>
                </LinkStyled>

                <LinkStyled
                    to={`${AppRoutes.page.vote}?base=${getAssetString(asset)}`}
                    onClick={() => ModalService.closeAllModals()}
                >
                    <Button isBig>vote</Button>
                </LinkStyled>

                <NoTrustline asset={asset} onlyButton secondary isBig />
            </Buttons>
        </ModalWrapper>
    );
};

export default AssetInfoModal;

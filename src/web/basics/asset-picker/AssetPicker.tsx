import * as React from 'react';
import styled from 'styled-components';

import { AssetSimple } from 'store/assetsStore/types';

import { ModalService } from 'services/globalServices';

import { Asset as AssetType } from 'types/stellar';

import { COLORS } from 'web/styles';

import Arrow from 'assets/icon-arrow-down.svg';

import AssetPickerModal from 'basics/asset-picker/AssetPickerModal';
import AssetLogo from 'basics/AssetLogo';

import { textEllipsis } from '../../mixins';

const Container = styled.div`
    display: flex;
    width: fit-content;
    max-width: 15rem;
    height: 4.8rem;
    border-radius: 3.8rem;
    border: 0.1rem solid ${COLORS.gray};
    padding: 0.8rem;
    background-color: ${COLORS.white};
    align-items: center;
    gap: 0.8rem;
    cursor: pointer;
    margin: 0.9rem 0;

    &:hover {
        border-color: ${COLORS.grayText};
    }
`;

const Code = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;
    ${textEllipsis};
`;

const ArrowIcon = styled(Arrow)`
    min-width: 1.6rem;
`;

type Props = {
    asset: AssetType;
    onUpdate: (asset: AssetType) => void;
    assetsList: AssetSimple[];
};

const AssetPicker = ({ asset, onUpdate, assetsList }: Props) => (
    <Container onClick={() => ModalService.openModal(AssetPickerModal, { assetsList, onUpdate })}>
        <AssetLogo asset={asset} />
        <Code>{asset.code}</Code>
        <ArrowIcon />
    </Container>
);

export default AssetPicker;

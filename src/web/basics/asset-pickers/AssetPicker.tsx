import * as React from 'react';
import styled from 'styled-components';

import { ModalService } from 'services/globalServices';

import { Token } from 'types/token';

import { textEllipsis } from 'web/mixins';
import { COLORS } from 'web/styles';

import Arrow from 'assets/icons/arrows/arrow-down-16.svg';

import AssetPickerModal from 'basics/asset-pickers/AssetPickerModal';
import AssetLogo from 'basics/AssetLogo';

const Container = styled.div`
    display: flex;
    width: fit-content;
    max-width: 15rem;
    height: 4.8rem;
    border-radius: 3.8rem;
    border: 0.1rem solid ${COLORS.gray100};
    padding: 0.8rem;
    background-color: ${COLORS.white};
    align-items: center;
    gap: 0.8rem;
    cursor: pointer;
    margin: 0.9rem 0;
    position: relative;

    &:hover {
        border-color: ${COLORS.purple500};
    }
`;

const Code = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;
    ${textEllipsis};
`;

const ArrowIcon = styled(Arrow)`
    min-width: 1.6rem;
    margin-left: auto;
`;

const Label = styled.span`
    position: absolute;
    bottom: calc(100% + 1.2rem);
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.textTertiary};
    left: 0;
`;

type Props = {
    asset: Token;
    onUpdate: (asset: Token) => void;
    assetsList: Token[];
    label?: string;
};

const AssetPicker = ({ asset, onUpdate, assetsList, label, ...props }: Props) => (
    <Container
        onClick={() => ModalService.openModal(AssetPickerModal, { assetsList, onUpdate })}
        {...props}
    >
        {label && <Label>{label}</Label>}
        <AssetLogo asset={asset} />
        <Code>{asset.code}</Code>
        <ArrowIcon />
    </Container>
);

export default AssetPicker;

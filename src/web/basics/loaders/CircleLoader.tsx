import { memo } from 'react';
import styled from 'styled-components';

import Loader from 'assets/loader.svg';

import { COLORS } from '../../styles';

const SizedLoader = styled(Loader)`
    height: ${({ size }) => size}rem;
    width: ${({ size }) => size}rem;
    color: ${({ isWhite }) => (isWhite ? COLORS.white : COLORS.titleText)};
`;

export enum SIZES {
    small = 1.6,
    medium = 3.2,
    large = 5.2,
}

type CircleLoaderProps = {
    size?: keyof typeof SIZES;
    isWhite?: boolean;
};

const CircleLoader = ({ size = 'medium', isWhite = false }: CircleLoaderProps): JSX.Element => (
    <SizedLoader size={SIZES[size]} isWhite={isWhite} />
);

export default memo(CircleLoader);

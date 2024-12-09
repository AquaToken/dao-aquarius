import { memo } from 'react';
import styled from 'styled-components';

import Loader from 'assets/loader.svg';

const SizedLoader = styled(Loader)`
    height: ${({ size }) => size}rem;
    width: ${({ size }) => size}rem;
`;

export enum SIZES {
    small = 1.6,
    medium = 3.2,
    large = 5.2,
}

type CircleLoaderProps = {
    size?: keyof typeof SIZES;
};

const CircleLoader = ({ size = 'medium' }: CircleLoaderProps): JSX.Element => (
    <SizedLoader size={SIZES[size]} />
);

export default memo(CircleLoader);

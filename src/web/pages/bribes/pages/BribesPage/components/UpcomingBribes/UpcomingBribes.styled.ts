import styled from 'styled-components';

import Asset from 'basics/Asset';
import Checkbox from 'basics/inputs/Checkbox';
import Select from 'basics/inputs/Select';

import { flexAllCenter, flexColumn, respondDown } from 'styles/mixins';
import { Breakpoints } from 'styles/style-constants';

export const Container = styled.div`
    ${flexColumn};
`;

export const WebAsset = styled(Asset)`
    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

export const MobileAsset = styled(Asset)`
    display: none;

    ${respondDown(Breakpoints.md)`
        display: flex;
    `}
`;

export const LoaderContainer = styled.div`
    ${flexAllCenter};
    margin: 5rem 0;
`;

export const CheckboxStyled = styled(Checkbox)`
    margin-bottom: 3rem;
`;

export const SelectStyled = styled(Select)`
    display: none;
    margin-bottom: 3rem;

    ${respondDown(Breakpoints.md)`
        display: flex;
    `}
`;

import styled from 'styled-components';

import Plus from 'assets/icons/nav/icon-plus-16.svg';

import Button from 'basics/buttons/Button';
import { ToggleGroup } from 'basics/inputs';

import { flexRowSpaceBetween, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 8.3rem;

    ${respondDown(Breakpoints.md)`
         margin-top: 3.3rem;
    `}
`;

export const TitleBlock = styled.div`
    ${flexRowSpaceBetween};
    margin-bottom: 5.3rem;

    ${respondDown(Breakpoints.md)`
        margin-bottom: 2.3rem;
    `}
`;

export const Title = styled.span`
    font-weight: bold;
    font-size: 5.6rem;
    line-height: 6.4rem;
    color: ${COLORS.purple950};

    ${respondDown(Breakpoints.md)`
        font-weight: normal;
        font-size: 2.9rem;
        line-height: 3.4rem;
    `}
`;

export const AddBribeButton = styled(Button)`
    width: 22.2rem;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

export const PlusIcon = styled(Plus)`
    margin-left: 1.6rem;
`;

export const ToggleGroupStyled = styled(ToggleGroup)`
    width: fit-content;
    margin-bottom: 5.3rem;
`;

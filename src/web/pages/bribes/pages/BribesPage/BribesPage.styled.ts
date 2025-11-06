import styled from 'styled-components';

import Bribes from 'assets/bribes-page/bribes.svg';
import Plus from 'assets/icons/nav/icon-plus-16.svg';

import Button from 'basics/buttons/Button';

import { commonMaxWidth, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

export const Background = styled.div`
    display: flex;
    align-items: center;
    background-color: ${COLORS.gray50};
    min-height: 10rem;
    overflow: hidden;
    position: relative;
    width: 100%;

    ${respondDown(Breakpoints.md)`
        padding: 0;
        flex-direction: column-reverse;
    `}
`;

export const MainContentWrap = styled.div`
    ${commonMaxWidth};
    display: flex;
    flex-direction: column;
    width: 100%;
    z-index: 1;
`;

export const Banner = styled(MainContentWrap)`
    padding: 0 4rem;
`;

export const MainContent = styled.div`
    max-width: 60rem;
    padding: 10% 4rem;

    ${respondDown(Breakpoints.md)`
        max-width: unset;
        background: ${COLORS.white};
        padding: 1.6rem;
    `}
`;

export const BribesLogo = styled(Bribes)`
    height: 100%;
    position: absolute;
    right: 5%;
    max-width: 40%;

    ${respondDown(Breakpoints.md)`
        position: relative;
        right: unset;
        max-width: unset;
    `}
`;

export const Title = styled.span`
    font-weight: bold;
    font-size: 8rem;
    line-height: 9.4rem;
    color: ${COLORS.purple950};
    white-space: nowrap;
    z-index: 1;
    margin-bottom: 1.6rem;

    ${respondDown(Breakpoints.lg)`
        font-size: 7rem;
        line-height: 8rem;
        margin-bottom: 1.2rem;
    `}

    ${respondDown(Breakpoints.md)`
        font-size: 5.5rem;
        line-height: 6rem;
        margin-bottom: 1rem;
        display: block;
        text-align: center;
    `}
      
    ${respondDown(Breakpoints.sm)`
        font-size: 4rem;
        line-height: 5rem;
        margin-bottom: 0.8rem;
    `}
`;

export const Description = styled.p`
    font-size: 1.6rem;
    line-height: 2.4rem;
    color: ${COLORS.textGray};
    margin-bottom: 2.4rem;
`;

export const MainContentFooter = styled.div`
    display: flex;
    justify-content: space-between;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
    `}
`;

export const PlusIcon = styled(Plus)`
    margin-left: 1.6rem;
`;

export const AddBribeButton = styled(Button)`
    flex: 1;
    max-width: 22.2rem;
    margin-right: 1.6rem;

    ${respondDown(Breakpoints.md)`
        max-width: unset;
        width: 100%;
        flex: unset;
        margin-bottom: 1.6rem;
    `}
`;

export const TableContainer = styled.div`
    position: relative;
    padding: 0 4rem;
    ${commonMaxWidth};
    margin-bottom: 10rem;
    width: 100%;

    ${respondDown(Breakpoints.md)`
        padding: 0 1.6rem;
        background: ${COLORS.gray50};
        margin-bottom: 3rem;
    `}
`;

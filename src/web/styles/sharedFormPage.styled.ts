import styled from 'styled-components';

import Dash from 'assets/icons/objects/icon-dash-16.svg';

import { cardBoxShadow, flexAllCenter, respondDown } from 'styles/mixins';
import { Breakpoints, COLORS } from 'styles/style-constants';

import CircleButton from '../basics/buttons/CircleButton';

export const FormPageHeaderWrap = styled.div`
    width: 100%;
    background-color: ${COLORS.gray50};
    padding: 7.7rem 0 14.3rem;
    ${flexAllCenter};
`;

export const FormPageContentWrap = styled.div`
    display: flex;
    flex-direction: column;
    width: 79.2rem;

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

export const FormPageHeaderTitle = styled.span`
    font-weight: bold;
    font-size: 5.6rem;
    line-height: 6.4rem;
    color: ${COLORS.purple950};
    margin-bottom: 1.2rem;

    ${respondDown(Breakpoints.md)`
        padding: 0 1.6rem;
    `}
`;

export const FormPageHeaderDescription = styled.div`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textGray};
    margin-bottom: 1.2rem;

    ${respondDown(Breakpoints.md)`
          padding: 0 1.6rem;
      `}
`;

export const FormBackButton = styled(CircleButton)`
    margin-bottom: 3.2rem;

    ${respondDown(Breakpoints.md)`
          padding: 0 1.6rem;
      `}
`;

export const FormWrap = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: -7.7rem;
    ${flexAllCenter};

    ${respondDown(Breakpoints.md)`
        width: 100%;
    `}
`;

export const Form = styled.form`
    width: 100%;
    background: ${COLORS.white};
    border-radius: 0.5rem;
    ${cardBoxShadow};
`;

export const FormSectionTitle = styled.span`
    font-size: 3.6rem;
    line-height: 4.2rem;
    color: ${COLORS.purple950};
    margin-bottom: 0.8rem;
`;

export const FormSectionDescription = styled.span`
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textGray};
    margin-bottom: 4.8rem;
`;

export const FormSection = styled.section`
    display: flex;
    flex-direction: column;
    padding: 4.8rem;

    &:not(:last-child) {
        border-bottom: 0.1rem solid ${COLORS.gray100};
    }

    ${respondDown(Breakpoints.md)`
          padding: 3.2rem 1.6rem;
    `}
`;

export const FormRow = styled.div`
    display: flex;
    align-items: center;
    margin-top: 3rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
    `}
`;

export const DashIcon = styled(Dash)`
    margin: 0 2rem;
    min-width: 1.6rem;
    min-height: 1.6rem;

    ${respondDown(Breakpoints.md)`
        display: none;
    `}
`;

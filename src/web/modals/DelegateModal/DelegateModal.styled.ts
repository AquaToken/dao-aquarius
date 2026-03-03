import styled from 'styled-components';

import { Button } from 'basics/buttons';

import PublicKeyWithIcon from 'components/PublicKeyWithIcon';

import { flexAllCenter, flexColumn } from 'styles/mixins';
import { COLORS } from 'styles/style-constants';

export const DelegateButton = styled(Button)`
    margin-top: 4rem;
`;

export const Amounts = styled.div`
    ${flexColumn};
    gap: 0.8rem;
    margin-top: -3rem;
`;

export const FormRow = styled.div`
    display: flex;
    margin: 7rem 0 2rem;
    position: relative;
`;

export const Labels = styled.div`
    position: absolute;
    bottom: calc(100% + 1.2rem);
    left: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

export const SelectItem = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
`;

export const Avatar = styled.img`
    border-radius: 50%;
`;

export const IconWrapper = styled.div`
    height: 2.4rem;
    width: 2.4rem;
    background: ${COLORS.gray100};
    border-radius: 50%;
    ${flexAllCenter};
    color: ${COLORS.gray300};

    svg {
        margin: 0 !important;
        height: 1.2rem;
        width: 1.2rem;
    }
`;

export const PublicKeyWithIconStyled = styled(PublicKeyWithIcon)`
    color: ${COLORS.textGray};
    margin-left: 1rem;
`;

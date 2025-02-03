import * as React from 'react';
import { memo, useState } from 'react';
import styled from 'styled-components';

import { flexAllCenter } from 'web/mixins';
import { COLORS } from 'web/styles';

import IconAlert from 'assets/icon-alert.svg';

import { Checkbox } from 'basics/inputs';

const Container = styled.div`
    display: flex;
    background-color: ${COLORS.lightGray};
    border-radius: 0.5rem;
    padding: 3.2rem 2.4rem;
    margin-top: 1.6rem;
    width: 100%;
`;

const IconWrapper = styled.div`
    ${flexAllCenter};
    height: 7.4rem;
    min-height: 7.4rem;
    width: 7.4rem;
    min-width: 7.4rem;
    background-color: ${COLORS.white};
    border-radius: 50%;
    border: 0.2rem solid ${COLORS.lightGray};
    margin-right: 2.4rem;
`;

const Content = styled.div`
    display: flex;
    flex-direction: column;
`;

const Title = styled.span`
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 2.3rem;
    color: ${COLORS.paragraphText};
    margin-bottom: 0.8rem;
`;

const Text = styled.span`
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.grayText};
`;

const Icon = styled(IconAlert)`
    path {
        fill: ${({ $color }) => $color};
    }
`;

const CheckboxStyled = styled(Checkbox)`
    margin-top: 0.8rem;

    div {
        font-size: 1.4rem;
    }
`;

const iconFillColor = {
    orange: COLORS.orange,
    red: COLORS.pinkRed,
} as const;

interface CheckboxProps {
    label?: string;
    onChange?: (checked: boolean) => void;
}

interface AlertProps {
    title?: string;
    text: string | React.ReactNode;
    iconColor?: keyof typeof iconFillColor;
    checkbox?: CheckboxProps | null;
}

const Alert = ({ title, text, iconColor = 'red', checkbox = null }: AlertProps) => {
    const [checked, setChecked] = useState(false);

    const handleCheckboxChange = (value: boolean) => {
        setChecked(value);
        if (checkbox?.onChange) {
            checkbox.onChange(value);
        }
    };

    return (
        <Container>
            <IconWrapper>
                <Icon $color={iconFillColor[iconColor]} />
            </IconWrapper>
            <Content>
                <Title>{title}</Title>
                <Text>{text}</Text>
                {Boolean(checkbox) && (
                    <CheckboxStyled
                        label={checkbox.label || 'I acknowledge'}
                        checked={checked}
                        onChange={handleCheckboxChange}
                    />
                )}
            </Content>
        </Container>
    );
};

export default memo(Alert);

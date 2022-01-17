import * as React from 'react';
import styled from 'styled-components';
import CopyIcon from '../assets/img/icon-copy.svg';
import { COLORS } from '../styles';
import Tooltip, { TOOLTIP_POSITION } from './Tooltip';
import { useEffect, useRef, useState } from 'react';

const CopyButtonContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.purple};
    cursor: pointer;
`;

const CopyIconStyled = styled(CopyIcon)`
    margin-left: 0.8rem;
`;

const CopyButton = ({
    text,
    children,
    withoutLogo,
    ...props
}: {
    text: string;
    children: React.ReactNode;
    withoutLogo?: boolean;
}): JSX.Element => {
    const [isShowTooltip, setIsShowTooltip] = useState(false);
    const timerRef = useRef(null);

    const copyText = () => {
        clearTimeout(timerRef.current);
        if (!navigator.clipboard) {
            const el = document.createElement('textarea');
            el.value = text;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        } else {
            navigator.clipboard.writeText(text);
        }

        setIsShowTooltip(true);
        timerRef.current = setTimeout(() => {
            setIsShowTooltip(false);
        }, 2000);
    };

    // unmount effect
    useEffect(() => () => clearTimeout(timerRef.current), []);

    return (
        <Tooltip
            content={<span>Copied!</span>}
            position={TOOLTIP_POSITION.top}
            isShow={isShowTooltip}
            {...props}
        >
            <CopyButtonContainer onClick={() => copyText()} {...props}>
                {children}
                {!withoutLogo && <CopyIconStyled />}
            </CopyButtonContainer>
        </Tooltip>
    );
};

export default CopyButton;

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import Tooltip, { TOOLTIP_POSITION } from './Tooltip';

import CopyIcon from 'assets/icon-copy.svg';
import { COLORS } from '../styles';

const CopyButtonContainer = styled(props => <div {...props} />)`
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

interface CopyButtonProps extends React.DOMAttributes<HTMLDivElement> {
    text: string;
    children: React.ReactNode;
    withoutLogo?: boolean;
}

const CopyButton = ({
    text,
    children,
    withoutLogo,
    ...props
}: CopyButtonProps): React.ReactNode => {
    const [isShowTooltip, setIsShowTooltip] = useState(false);
    const timerRef = useRef<number | null>(null);

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
        >
            <CopyButtonContainer onClick={() => copyText()} {...props}>
                {children}
                {!withoutLogo && <CopyIconStyled />}
            </CopyButtonContainer>
        </Tooltip>
    );
};

export default CopyButton;

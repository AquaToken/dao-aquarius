import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import CopyIcon from 'assets/icons/actions/icon-copy-16.svg';

import Tooltip, { TOOLTIP_POSITION } from 'basics/Tooltip';

import { COLORS } from 'styles/style-constants';

const CopyButtonContainer = styled.div<{ isBlackText?: boolean }>`
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${({ isBlackText }) => (isBlackText ? COLORS.textTertiary : COLORS.purple500)};
    cursor: pointer;
`;

const CopyIconStyled = styled(CopyIcon)`
    margin-left: 0.8rem;
`;

interface CopyButtonProps extends React.DOMAttributes<HTMLDivElement> {
    text: string;
    children: React.ReactNode;
    withoutLogo?: boolean;
    isBlackText?: boolean;
}

const Inner = styled.div`
    color: ${COLORS.white};
`;

const CopyButton = ({
    text,
    children,
    withoutLogo,
    isBlackText,
    ...props
}: CopyButtonProps): React.ReactNode => {
    const [isShowTooltip, setIsShowTooltip] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const copyText = async () => {
        clearTimeout(timerRef.current);
        if (!navigator.clipboard) {
            const el = document.createElement('textarea');
            el.value = text;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        } else {
            await navigator.clipboard.writeText(text);
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
            content={<Inner>Copied!</Inner>}
            position={TOOLTIP_POSITION.top}
            isShow={isShowTooltip}
            color={COLORS.white}
        >
            <CopyButtonContainer onClick={() => copyText()} {...props} isBlackText={isBlackText}>
                {children}
                {!withoutLogo && <CopyIconStyled />}
            </CopyButtonContainer>
        </Tooltip>
    );
};

export default CopyButton;

import * as React from 'react';
import styled from 'styled-components';

import { flexAllCenter } from 'web/mixins';
import { COLORS } from 'web/styles';

const BadgeWrapper = styled.div`
    position: relative;
    width: 2rem;
    height: 2rem;
`;

const CircleSvg = styled.svg`
    position: absolute;
    top: 0;
    left: 0;
`;

const CountText = styled.div`
    ${flexAllCenter};
    position: absolute;
    inset: 0;
    font-size: 1rem;
    font-weight: 700;
    color: ${COLORS.textPrimary};
`;

interface ActiveProposalsProps {
    discussionCount: number;
    activeCount: number;
}

export const ActiveProposals = ({
    discussionCount,
    activeCount,
}: ActiveProposalsProps): React.ReactNode => {
    const total = discussionCount + activeCount;

    if (total === 0) return null;

    const hasDiscussion = discussionCount > 0;
    const hasActive = activeCount > 0;

    if (!hasActive && !hasDiscussion) {
        return null;
    }

    return (
        <BadgeWrapper>
            <CircleSvg width="20" height="20" viewBox="0 0 20 20">
                {/* only discussions */}
                {hasDiscussion && !hasActive && (
                    <circle
                        cx="10"
                        cy="10"
                        r="9"
                        fill="none"
                        stroke={COLORS.orange500}
                        strokeWidth="2"
                    />
                )}

                {/* only active */}
                {hasActive && !hasDiscussion && (
                    <circle
                        cx="10"
                        cy="10"
                        r="9"
                        fill="none"
                        stroke={COLORS.purple500}
                        strokeWidth="2"
                    />
                )}

                {/* both */}
                {hasDiscussion && hasActive && (
                    <>
                        <path
                            d="M10,1 A9,9 0 0,0 10,19"
                            fill="none"
                            stroke={COLORS.orange500}
                            strokeWidth="2"
                        />
                        <path
                            d="M10,1 A9,9 0 0,1 10,19"
                            fill="none"
                            stroke={COLORS.purple500}
                            strokeWidth="2"
                        />

                        <line x1="10" y1="0" x2="10" y2="20" stroke="white" strokeWidth="2" />
                    </>
                )}
            </CircleSvg>
            <CountText>{total}</CountText>
        </BadgeWrapper>
    );
};

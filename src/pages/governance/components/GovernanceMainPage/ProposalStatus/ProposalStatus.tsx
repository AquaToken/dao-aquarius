import * as React from 'react';
import styled from 'styled-components';

import IconPending from 'assets/icons/status/pending.svg';
import IconSuccess from 'assets/icons/status/success.svg';

import { flexAllCenter } from 'styles/mixins';
import { COLORS } from 'styles/style-constants';

export enum PROPOSAL_STATUS {
    DISCUSSION = 'discussion',
    ACTIVE = 'active',
    CLOSED = 'closed',
    DEPRECATED = 'deprecated',
    EXPIRED = 'expired',
}

const StatusLabels = {
    [PROPOSAL_STATUS.DISCUSSION]: 'Discussion',
    [PROPOSAL_STATUS.ACTIVE]: 'Active',
    [PROPOSAL_STATUS.CLOSED]: 'Finished',
    [PROPOSAL_STATUS.DEPRECATED]: 'Deprecated',
    [PROPOSAL_STATUS.EXPIRED]: 'Expired',
};

const Container = styled.div<{ $status: PROPOSAL_STATUS }>`
    ${flexAllCenter};
    height: 3.2rem;
    padding: ${({ $status }) => {
        switch ($status) {
            case PROPOSAL_STATUS.CLOSED:
                return '0 1.4rem';
            default:
                return '0 0.8rem';
        }
    }};
    border-radius: 1.6rem;
    width: min-content;
    background-color: ${({ $status }) => {
        switch ($status) {
            case PROPOSAL_STATUS.DISCUSSION:
                return COLORS.orange500;
            case PROPOSAL_STATUS.ACTIVE:
                return COLORS.purple500;
            case PROPOSAL_STATUS.CLOSED:
                return COLORS.gray100;
            case PROPOSAL_STATUS.DEPRECATED:
                return COLORS.gray200;
            case PROPOSAL_STATUS.EXPIRED:
                return COLORS.gray200;
        }
    }};
    color: ${({ $status }) => {
        switch ($status) {
            case PROPOSAL_STATUS.DISCUSSION:
                return COLORS.white;
            case PROPOSAL_STATUS.ACTIVE:
                return COLORS.white;
            case PROPOSAL_STATUS.CLOSED:
                return COLORS.textDark;
            case PROPOSAL_STATUS.DEPRECATED:
                return COLORS.white;
            case PROPOSAL_STATUS.EXPIRED:
                return COLORS.white;
        }
    }};
`;

const ActiveIcon = styled(IconSuccess)`
    height: 1.6rem;
    width: 1.6rem;
    margin-right: 0.4rem;
    rect {
        fill: ${COLORS.white};
    }

    path {
        stroke: ${COLORS.purple500};
    }
`;

const DiscussionIcon = styled(IconPending)`
    height: 1.6rem;
    width: 1.6rem;
    margin-right: 0.4rem;
    rect {
        fill: ${COLORS.white};
    }

    path,
    circle {
        stroke: ${COLORS.orange500};
    }
`;

const DeprecatedIcon = styled(IconPending)`
    height: 1.6rem;
    width: 1.6rem;
    margin-right: 0.4rem;
    rect {
        fill: ${COLORS.white};
    }

    path,
    circle {
        stroke: ${COLORS.gray200};
    }
`;

const ProposalStatus = ({ status, ...props }: { status: PROPOSAL_STATUS }) => (
    <Container $status={status} {...props}>
        {status === PROPOSAL_STATUS.ACTIVE && <ActiveIcon />}
        {status === PROPOSAL_STATUS.DISCUSSION && <DiscussionIcon />}
        {status === PROPOSAL_STATUS.DEPRECATED && <DeprecatedIcon />}
        {status === PROPOSAL_STATUS.EXPIRED && <DeprecatedIcon />}
        {StatusLabels[status]}
    </Container>
);

export default ProposalStatus;

import * as React from 'react';
import styled, { css } from 'styled-components';

import { PROPOSAL_STATUS, StatusLabels } from 'constants/dao';

import IconError from 'assets/icons/status/fail-red.svg';
import IconPending from 'assets/icons/status/pending.svg';
import IconSuccess from 'assets/icons/status/success.svg';

import { flexAllCenter } from 'styles/mixins';
import { COLORS } from 'styles/style-constants';

const Container = styled.div<{ $status: PROPOSAL_STATUS }>`
    ${flexAllCenter};
    height: 3.2rem;
    padding: ${({ $status }) => {
        switch ($status) {
            case PROPOSAL_STATUS.EXPIRED:
            case PROPOSAL_STATUS.NO_QUORUM:
                return '0 1.4rem';
            default:
                return '0 0.8rem';
        }
    }};
    border-radius: 1.6rem;
    width: min-content;
    white-space: nowrap;
    background-color: ${({ $status }) => {
        switch ($status) {
            case PROPOSAL_STATUS.DISCUSSION:
                return COLORS.orange500;
            case PROPOSAL_STATUS.ACTIVE:
                return COLORS.purple500;

            case PROPOSAL_STATUS.ACCEPTED:
                return COLORS.green500;

            case PROPOSAL_STATUS.REJECTED:
                return COLORS.red500;

            case PROPOSAL_STATUS.DEPRECATED:
            case PROPOSAL_STATUS.EXPIRED:
            case PROPOSAL_STATUS.NO_QUORUM:
                return COLORS.gray200;
        }
    }};
    color: ${({ $status }) => {
        switch ($status) {
            case PROPOSAL_STATUS.DISCUSSION:
            case PROPOSAL_STATUS.ACTIVE:
            case PROPOSAL_STATUS.ACCEPTED:
            case PROPOSAL_STATUS.REJECTED:
            case PROPOSAL_STATUS.DEPRECATED:
                return COLORS.white;

            case PROPOSAL_STATUS.EXPIRED:
            case PROPOSAL_STATUS.NO_QUORUM:
                return COLORS.white;
        }
    }};
`;

const iconStyles = css`
    height: 1.6rem;
    width: 1.6rem;
    margin-right: 0.4rem;
`;

const ActiveIcon = styled(IconSuccess)`
    ${iconStyles};
    rect {
        fill: ${COLORS.white};
    }

    path {
        stroke: ${COLORS.purple500};
    }
`;

const DiscussionIcon = styled(IconPending)`
    ${iconStyles};
    rect {
        fill: ${COLORS.white};
    }

    path,
    circle {
        stroke: ${COLORS.orange500};
    }
`;

const DeprecatedIcon = styled(IconPending)`
    ${iconStyles};
    rect {
        fill: ${COLORS.white};
    }

    path,
    circle {
        stroke: ${COLORS.gray200};
    }
`;

const AcceptedIcon = styled(IconSuccess)`
    ${iconStyles};
    rect {
        fill: ${COLORS.white};
    }

    path,
    circle {
        stroke: ${COLORS.green500};
    }
`;

const RejectedIcon = styled(IconError)`
    ${iconStyles};

    rect {
        fill: ${COLORS.white};
    }

    path,
    circle {
        stroke: ${COLORS.red500};
    }
`;

const ProposalStatus = ({ status, ...props }: { status: PROPOSAL_STATUS }) => (
    <Container $status={status} {...props}>
        {status === PROPOSAL_STATUS.ACTIVE && <ActiveIcon />}
        {status === PROPOSAL_STATUS.DISCUSSION && <DiscussionIcon />}
        {status === PROPOSAL_STATUS.DEPRECATED && <DeprecatedIcon />}
        {status === PROPOSAL_STATUS.ACCEPTED && <AcceptedIcon />}
        {status === PROPOSAL_STATUS.REJECTED && <RejectedIcon />}
        {StatusLabels[status]}
    </Container>
);

export default ProposalStatus;

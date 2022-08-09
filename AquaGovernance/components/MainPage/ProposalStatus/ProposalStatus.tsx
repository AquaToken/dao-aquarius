import * as React from 'react';
import styled from 'styled-components';
import { flexAllCenter } from '../../../../common/mixins';
import { COLORS } from '../../../../common/styles';
import IconSuccess from '../../../../common/assets/img/icon-success.svg';
import IconPending from '../../../../common/assets/img/icon-pending.svg';

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

const Container = styled.div<{ status: PROPOSAL_STATUS }>`
    ${flexAllCenter};
    height: 3.2rem;
    padding: ${({ status }) => {
        switch (status) {
            case PROPOSAL_STATUS.CLOSED:
                return '0 1.4rem';
            default:
                return '0 0.8rem';
        }
    }};
    border-radius: 1.6rem;
    width: min-content;
    background-color: ${({ status }) => {
        switch (status) {
            case PROPOSAL_STATUS.DISCUSSION:
                return COLORS.orange;
            case PROPOSAL_STATUS.ACTIVE:
                return COLORS.purple;
            case PROPOSAL_STATUS.CLOSED:
                return COLORS.gray;
            case PROPOSAL_STATUS.DEPRECATED:
                return COLORS.placeholder;
            case PROPOSAL_STATUS.EXPIRED:
                return COLORS.placeholder;
        }
    }};
    color: ${({ status }) => {
        switch (status) {
            case PROPOSAL_STATUS.DISCUSSION:
                return COLORS.white;
            case PROPOSAL_STATUS.ACTIVE:
                return COLORS.white;
            case PROPOSAL_STATUS.CLOSED:
                return COLORS.darkGrayText;
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
        stroke: ${COLORS.purple};
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
        stroke: ${COLORS.orange};
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
        stroke: ${COLORS.placeholder};
    }
`;

const ProposalStatus = ({ status, ...props }: { status: PROPOSAL_STATUS }) => {
    return (
        <Container status={status} {...props}>
            {status === PROPOSAL_STATUS.ACTIVE && <ActiveIcon />}
            {status === PROPOSAL_STATUS.DISCUSSION && <DiscussionIcon />}
            {status === PROPOSAL_STATUS.DEPRECATED && <DeprecatedIcon />}
            {status === PROPOSAL_STATUS.EXPIRED && <DeprecatedIcon />}
            {StatusLabels[status]}
        </Container>
    );
};

export default ProposalStatus;

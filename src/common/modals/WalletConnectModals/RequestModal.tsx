import * as React from 'react';
import { useEffect, useState } from 'react';
import { ModalDescription, ModalProps, ModalTitle } from '../atoms/ModalAtoms';
import Button from '../../basics/Button';
import styled from 'styled-components';
import { IconFail, IconPending, IconSuccess } from '../../basics/Icons';
import { flexAllCenter, respondDown } from '../../mixins';
import DotsLoader from '../../basics/DotsLoader';
import { BuildSignAndSubmitStatuses } from '../../services/wallet-connect.service';
import { Breakpoints, COLORS } from '../../styles';
import { useIsMounted } from '../../hooks/useIsMounted';
import { isMobile } from '../../helpers/browser';
import { getCurrentWallet } from '../../helpers/wallet-connect-helpers';

enum TX_STATUSES {
    pending = 'pending',
    success = 'success',
    fail = 'fail',
    awaitSigners = 'await signers',
}

const STATUS_DESCRIPTION = {
    [TX_STATUSES.pending]: 'Waiting For Confirmation',
    [TX_STATUSES.success]: 'Transaction Completed',
    [TX_STATUSES.fail]: 'Transaction Rejected',
    [TX_STATUSES.awaitSigners]: 'Transaction Confirmed. More signatures required to complete',
};

const IconContainer = styled.div`
    padding-top: 8rem;
    padding-bottom: 2.4rem;
    width: 50rem;
    background-color: ${COLORS.lightGray};
    ${flexAllCenter};

    ${respondDown(Breakpoints.md)`
        width: unset;
    `}
`;

const Status = styled.div`
    padding-top: 2.4rem;
    padding-bottom: 4.5rem;
    margin-bottom: 3.2rem;
    background-color: ${COLORS.lightGray};
    ${flexAllCenter};
    text-align: center;
`;

const RightButton = styled(Button)`
    margin-top: 1.6rem;
    margin-left: auto;

    ${respondDown(Breakpoints.md)`
          margin-left: unset;
          width: 100%;
    `}
`;

interface RequestModalProps {
    name: string;
    result: Promise<{ status?: BuildSignAndSubmitStatuses; signedXDR?: string }>;
}

const RequestModal = ({ params, close }: ModalProps<RequestModalProps>) => {
    const { name, result } = params;

    const [status, setStatus] = useState(TX_STATUSES.pending);

    const isMounted = useIsMounted();

    useEffect(() => {
        result
            .then((result) => {
                if (!result || !isMounted.current) {
                    return;
                }
                if (
                    result.status === BuildSignAndSubmitStatuses.success ||
                    Boolean(result.signedXDR)
                ) {
                    setStatus(TX_STATUSES.success);
                } else if (result.status === BuildSignAndSubmitStatuses.pending) {
                    setStatus(TX_STATUSES.awaitSigners);
                }
            })
            .catch(() => {
                if (isMounted.current) {
                    setStatus(TX_STATUSES.fail);
                }
            });
    }, []);

    const savedApp = getCurrentWallet();

    return (
        <>
            <ModalTitle>Transaction</ModalTitle>
            <ModalDescription>View and sign the transaction in {name}</ModalDescription>

            <IconContainer>
                {status === TX_STATUSES.pending && <IconPending isBig />}
                {status === TX_STATUSES.fail && <IconFail isBig />}
                {(status === TX_STATUSES.success || status === TX_STATUSES.awaitSigners) && (
                    <IconSuccess isBig />
                )}
            </IconContainer>

            <Status>
                {STATUS_DESCRIPTION[status]}
                {status === TX_STATUSES.pending && <DotsLoader />}
            </Status>

            {isMobile() && Boolean(savedApp) && status === TX_STATUSES.pending && (
                <Button
                    fullWidth
                    onClick={() => {
                        window.open(savedApp.uri, '_blank');
                    }}
                >
                    Open {name}
                </Button>
            )}

            <RightButton onClick={() => close()}>Close</RightButton>
        </>
    );
};

export default RequestModal;

import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../../../../../common/styles';
import IconChecked from '../../../../../common/assets/img/icon-checked.svg';
import { useEffect, useState } from 'react';
import { StellarService } from '../../../../../common/services/globalServices';
import { StellarEvents } from '../../../../../common/services/stellar.service';
import { formatBalance } from '../../../../../common/helpers/helpers';

const StatusTagBody = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10rem;
    padding: 0.8rem;
    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.white};
    background: linear-gradient(300.06deg, #3d075c -19.81%, #8620b9 141.52%);

    svg {
        margin-right: 0.4rem;
    }
`;

const StatusTag = ({ marketKey }: { marketKey: string }): JSX.Element => {
    const [balance, setBalance] = useState(StellarService.getMarketVotesValue(marketKey));

    useEffect(() => {
        const unsub = StellarService.event.sub(({ type }) => {
            if (type === StellarEvents.claimableUpdate) {
                setBalance(StellarService.getMarketVotesValue(marketKey));
            }
        });

        return () => unsub();
    }, []);

    if (!balance) {
        return null;
    }

    return (
        <StatusTagBody>
            <IconChecked />
            {formatBalance(balance, true)} AQUA
        </StatusTagBody>
    );
};

export default StatusTag;

import { ICE_DELEGATION_MAP, ICE_TO_DELEGATE } from 'constants/assets';

import { formatBalance } from 'helpers/format-number';

import { Delegatee } from 'types/delegate';

export const getVotingPower = (delegatee: Partial<Delegatee>): string =>
    ICE_TO_DELEGATE.filter(str => !!Number(delegatee.managed_ice[str]))
        .map(
            str =>
                `${formatBalance(Number(delegatee.managed_ice[str]), true)} ${
                    ICE_DELEGATION_MAP.get(str).split(':')[0]
                }`,
        )
        .join(', ');

export const getTrusted = (delegatee: Partial<Delegatee>): string =>
    ICE_TO_DELEGATE.filter(str => !!Number(delegatee.delegated[str]))
        .map(str => `${formatBalance(Number(delegatee.delegated[str]), true)} ${str.split(':')[0]}`)
        .join(', ');

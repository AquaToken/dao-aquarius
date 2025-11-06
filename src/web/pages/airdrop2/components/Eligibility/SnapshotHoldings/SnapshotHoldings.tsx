import * as React from 'react';
import { Link } from 'react-router-dom';

import { LockerRoutes } from 'constants/routes';

import { formatBalance } from 'helpers/format-number';

import { AccountEligibility } from 'types/airdrop2';

import Aqua from 'assets/aqua/aqua-logo.svg';
import Xlm from 'assets/tokens/xlm-logo.svg';
import YXlm from 'assets/tokens/yxlm-logo.svg';

import { ExternalLink } from 'basics/links';

import { COLORS } from 'styles/style-constants';

import {
    Container,
    Title,
    Date,
    Balances,
    Asset,
    Amount,
    AmmAmount,
    LockAmount,
    BalanceLabel,
} from './SnapshotHoldings.styled';

interface SnapshotHoldingsProps {
    accountEligibility: AccountEligibility;
}

const SnapshotHoldings: React.FC<SnapshotHoldingsProps> = ({ accountEligibility }) => {
    const renderAsset = (
        Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>,
        label: string,
        balance: number,
        poolBalance: number,
    ) => (
        <div>
            <Asset>
                <Icon />
                {label}
            </Asset>
            <Amount>
                {formatBalance(balance, true)} {label}
            </Amount>
            {Boolean(poolBalance) && (
                <AmmAmount>
                    <BalanceLabel $color={COLORS.yellow500} $textColor={COLORS.textPrimary}>
                        AMM
                    </BalanceLabel>
                    {formatBalance(poolBalance, true)} {label}
                </AmmAmount>
            )}
        </div>
    );

    return (
        <Container>
            <Title>Snapshot holdings</Title>
            <Date>January 15, 2022 00:00:00 UTC</Date>

            <Balances>
                {renderAsset(
                    Aqua,
                    'AQUA',
                    +accountEligibility.aqua_balance,
                    +accountEligibility.aqua_pool_balance,
                )}
                {renderAsset(
                    Xlm,
                    'XLM',
                    +accountEligibility.native_balance,
                    +accountEligibility.native_pool_balance,
                )}
                {renderAsset(
                    YXlm,
                    'yXLM',
                    +accountEligibility.yxlm_balance,
                    +accountEligibility.yxlm_pool_balance,
                )}
            </Balances>

            {Boolean(Number(accountEligibility.aqua_lock_balance)) && (
                <LockAmount>
                    <div>
                        AQUA locked:{' '}
                        <b>{formatBalance(+accountEligibility.aqua_lock_balance, true)} AQUA</b>
                    </div>
                    <ExternalLink asDiv>
                        <Link
                            to={`${LockerRoutes.main}/GACCUBVEQDNC453CIF5XSB4PCF7IRQTET2Y4FOXV44TUEWI6Z65GXQ47`}
                        >
                            View locks history
                        </Link>
                    </ExternalLink>
                </LockAmount>
            )}
        </Container>
    );
};

export default SnapshotHoldings;

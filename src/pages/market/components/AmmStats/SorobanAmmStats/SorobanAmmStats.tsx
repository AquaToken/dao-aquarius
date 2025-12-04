import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getPoolsWithAssets } from 'api/amm';

import { AppRoutes } from 'constants/routes';

import useAuthStore from 'store/authStore/useAuthStore';

import { ModalService } from 'services/globalServices';

import { Asset } from 'types/stellar';

import ChooseLoginMethodModal from 'web/modals/auth/ChooseLoginMethodModal';

import { PageLoader } from 'basics/loaders';

import PoolsList from 'pages/amm/components/PoolsList/PoolsList';
import { ExternalLinkStyled, Section } from 'pages/profile/SdexRewards/SdexRewards';
import { Empty } from 'pages/profile/YourVotes/YourVotes';

interface Props {
    assets: Asset[];
}

const SorobanAmmStats = ({ assets }: Props) => {
    const [pools, setPools] = useState(null);

    const { isLogged } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        getPoolsWithAssets(assets).then(res => {
            setPools(res);
        });
    }, []);

    if (!pools) {
        return <PageLoader />;
    }

    if (!pools.length) {
        return (
            <Section>
                <Empty>
                    <h3>There's nothing here.</h3>

                    <ExternalLinkStyled asDiv>
                        <div
                            onClick={() => {
                                if (!isLogged) {
                                    ModalService.openModal(ChooseLoginMethodModal, {
                                        redirectURL: AppRoutes.section.amm.link.create,
                                    });
                                    return;
                                }
                                navigate(AppRoutes.section.amm.link.create);
                            }}
                        >
                            Create pool
                        </div>
                    </ExternalLinkStyled>
                </Empty>
            </Section>
        );
    }

    return (
        <div>
            <PoolsList pools={pools} onUpdate={void 0} isCommonList />
        </div>
    );
};

export default SorobanAmmStats;

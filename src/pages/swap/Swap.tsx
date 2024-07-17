import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { MainRoutes } from '../../routes';
import { ModalService, StellarService } from '../../common/services/globalServices';
import { AQUA_CODE, AQUA_ISSUER } from '../../common/services/stellar.service';
import { getAssetString } from '../../common/helpers/helpers';
import SwapPage from './pages/SwapPage';
import { useEffect } from 'react';
import MainNetPurposeModal, {
    SHOW_PURPOSE_ALIAS_MAIN_NET,
} from '../../common/modals/MainNetPurposeModal';

const Swap = () => {
    useEffect(() => {
        const showPurpose = JSON.parse(localStorage.getItem(SHOW_PURPOSE_ALIAS_MAIN_NET) || 'true');
        if (showPurpose) {
            ModalService.openModal(MainNetPurposeModal, {}, false);
        }
    }, []);
    return (
        <Switch>
            <Route exact path={`${MainRoutes.swap}/:source/:destination/`}>
                <SwapPage />
            </Route>
            <Route
                component={() => (
                    <Redirect
                        to={{
                            pathname: `${MainRoutes.swap}/${getAssetString(
                                StellarService.createLumen(),
                            )}/${getAssetString(
                                StellarService.createAsset(AQUA_CODE, AQUA_ISSUER),
                            )}`,
                        }}
                    />
                )}
            ></Route>
        </Switch>
    );
};

export default Swap;

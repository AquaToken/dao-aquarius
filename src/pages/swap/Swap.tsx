import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { MainRoutes } from '../../routes';
import { StellarService } from '../../common/services/globalServices';
import { AQUA_CODE, AQUA_ISSUER } from '../../common/services/stellar.service';
import { getAssetString } from '../../common/helpers/helpers';
import { lazy } from 'react';

const SwapPageLazy = lazy(() => import('./pages/SwapPage'));

const Swap = () => {
    return (
        <Switch>
            <Route exact path={`${MainRoutes.swap}/:source/:destination/`}>
                <SwapPageLazy />
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

import { lazy } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { AQUA_CODE, AQUA_ISSUER } from 'constants/assets';
import { MainRoutes } from 'constants/routes';

import { getAssetString } from 'helpers/assets';

import { StellarService } from 'services/globalServices';

const SwapPageLazy = lazy(() => import('./pages/SwapPage'));

const Swap = () => (
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
                        )}/${getAssetString(StellarService.createAsset(AQUA_CODE, AQUA_ISSUER))}`,
                    }}
                />
            )}
        ></Route>
    </Switch>
);

export default Swap;

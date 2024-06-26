import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { MainRoutes } from '../../routes';
import { StellarService } from '../../common/services/globalServices';
import { AQUA_CODE, AQUA_ISSUER } from '../../common/services/stellar.service';
import { getAssetString } from '../../common/helpers/helpers';
import SwapPage from './pages/SwapPage';

const Swap = ({ balances }) => {
    return (
        <Switch>
            <Route exact path={`${MainRoutes.swap}/:source/:destination/`}>
                <SwapPage balances={balances} />
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

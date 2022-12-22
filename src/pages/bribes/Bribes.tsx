import * as React from 'react';
import { lazy } from 'react';
import { Route, Switch } from 'react-router-dom';
import NotFoundPage from '../../common/components/NotFoundPage/NotFoundPage';
import { BribesRoutes } from '../../routes';

const BribesPage = lazy(() => import('./pages/BribesPage'));
const AddBribePage = lazy(() => import('./pages/AddBribePage'));

const Bribes = () => {
    return (
        <Switch>
            <Route exact path={BribesRoutes.bribes}>
                <BribesPage />
            </Route>
            <Route path={BribesRoutes.addBribe}>
                <AddBribePage />
            </Route>
            <Route component={NotFoundPage} />
        </Switch>
    );
};

export default Bribes;

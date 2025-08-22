import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { IncentivesRoutes } from 'constants/routes';

import { Button } from 'basics/buttons';

const Main = styled.main`
    flex: 1 0 auto;
`;

const IncentivesMainPage = () => {
    console.log('Incentives Main');
    return (
        <Main>
            <Link to={IncentivesRoutes.addIncentive}>
                <Button>Create incentive</Button>
            </Link>
        </Main>
    );
};

export default IncentivesMainPage;

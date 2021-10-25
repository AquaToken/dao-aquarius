import * as React from 'react';
import AssetDropdown from '../../../common/basics/AssetDropdown';
import styled from 'styled-components';

const mock = [
    { code: 'AQUA', issuer: 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA' },
    { code: 'USDC', issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN' },
    { code: 'DOGET', issuer: 'GDOEVDDBU6OBWKL7VHDAOKD77UP4DKHQYKOKJJT5PR3WRDBTX35HUEUX' },
    { code: 'SLT', issuer: 'GCKA6K5PCQ6PNF5RQBF7PQDJWRHO6UOGFMRLK3DYHDOI244V47XKQ4GP' },
    { code: 'XLM', issuer: 'native' },
];

const AboutPageBlock = styled.div`
    padding: 2.4rem;
`;

const AboutPage = (): JSX.Element => {
    return (
        <AboutPageBlock>
            <AssetDropdown assets={mock} />
        </AboutPageBlock>
    );
};

export default AboutPage;

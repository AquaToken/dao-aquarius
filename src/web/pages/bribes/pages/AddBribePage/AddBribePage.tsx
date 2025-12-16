import { AppRoutes } from 'constants/routes';

import ArrowLeft from 'assets/icons/arrows/arrow-left-16.svg';

import { PageContainer } from 'styles/commonPageStyles';
import {
    Form,
    FormPageHeaderWrap,
    FormPageContentWrap,
    FormPageHeaderTitle,
    FormPageHeaderDescription,
    FormWrap,
    FormBackButton,
} from 'styles/sharedFormPage.styled';

import { ExternalLinkStyled } from './AddBribePage.styled';
import { SelectMarketStep } from './components/SelectMarketStep';
import { SetPeriodStep } from './components/SetPeriodStep';
import { SetRewardStep } from './components/SetRewardStep';
import { useBribeForm } from './hooks/useBribeForm';

const AddBribePage = () => {
    const form = useBribeForm();

    return (
        <PageContainer>
            <FormPageHeaderWrap>
                <FormPageContentWrap>
                    <FormBackButton label="Bribes" to={AppRoutes.section.bribes.link.index}>
                        <ArrowLeft />
                    </FormBackButton>
                    <FormPageHeaderTitle>Create Bribe</FormPageHeaderTitle>
                    <FormPageHeaderDescription>
                        You are creating a bribe using any Stellar asset to incentivize voting for a
                        specific market in Aquarius. Each bribe is distributed over 7 days to voters
                        of the chosen market. To ensure validity, a portion of the bribe will be
                        converted to 100,000 AQUA before distribution.
                    </FormPageHeaderDescription>
                    <ExternalLinkStyled href="https://docs.aqua.network/bribes/what-are-bribes">
                        Learn more
                    </ExternalLinkStyled>
                </FormPageContentWrap>
            </FormPageHeaderWrap>

            <FormWrap>
                <FormPageContentWrap>
                    <Form onSubmit={form.onSubmit}>
                        <SelectMarketStep {...form} />
                        {form.step >= 1 && <SetRewardStep {...form} />}
                        {form.step === 2 && <SetPeriodStep {...form} />}
                    </Form>
                </FormPageContentWrap>
            </FormWrap>
        </PageContainer>
    );
};

export default AddBribePage;

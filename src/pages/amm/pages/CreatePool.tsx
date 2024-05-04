import * as React from 'react';
import styled from 'styled-components';
import {
    commonMaxWidth,
    flexAllCenter,
    flexRowSpaceBetween,
    respondDown,
} from '../../../common/mixins';
import { Breakpoints, COLORS } from '../../../common/styles';
import { AmmRoutes } from '../../../routes';
import ArrowLeft from '../../../common/assets/img/icon-arrow-left.svg';
import Tick from '../../../common/assets/img/icon-tick-white.svg';
import {
    Back,
    BackButton,
    Background,
    Content,
    Form,
    FormSection,
    FormSectionTitle,
    FormWrap,
    MainBlock,
    Title,
} from '../../bribes/pages/AddBribePage';
import { useState } from 'react';
import AssetDropdown from '../../vote/components/AssetDropdown/AssetDropdown';
import { StellarService } from '../../../common/services/globalServices';
import Button from '../../../common/basics/Button';
import Input from '../../../common/basics/Input';

const StyledForm = styled(Form)`
    padding: 0 4.8rem;
`;

const StyledFormSection = styled(FormSection)`
    padding: 4.8rem 0;

    &:last-child {
        border-bottom: none;
    }
`;

const PoolType = styled.div<{ isActive?: boolean }>`
    ${flexRowSpaceBetween};
    cursor: pointer;
    width: 100%;
    padding: 3.7rem 3.2rem;
    border-radius: 1rem;
    background-color: ${({ isActive }) => (isActive ? COLORS.purple : COLORS.lightGray)};
    color: ${({ isActive }) => (isActive ? COLORS.white : COLORS.paragraphText)};

    svg {
        display: ${({ isActive }) => (isActive ? 'block' : 'none')};
    }

    &:first-of-type {
        margin-top: 5.8rem;
    }
`;

const StyledAssetDropdown = styled(AssetDropdown)`
    margin-top: 6.7rem;
`;

const FormRow = styled.div`
    display: flex;
    gap: 5.4rem;
    margin-top: 3.7rem;
    margin-bottom: 5.8rem;
`;

const AddRowButton = styled(Button)`
    margin-top: 3.7rem;
    width: fit-content;
`;

enum PoolTypes {
    stable = 'stable',
    constant = 'constant',
}

const CreatePool = () => {
    const [type, setType] = useState(PoolTypes.stable);
    return (
        <MainBlock>
            <Background>
                <Content>
                    <Back to={AmmRoutes.analytics}>
                        <BackButton>
                            <ArrowLeft />
                        </BackButton>
                        <span>Pools</span>
                    </Back>
                    <Title>Create Pool</Title>
                </Content>
            </Background>
            <FormWrap>
                <Content>
                    <StyledForm
                        onSubmit={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                        }}
                    >
                        <StyledFormSection>
                            <FormSectionTitle>Select pool type</FormSectionTitle>
                            <PoolType
                                isActive={type === PoolTypes.stable}
                                onClick={() => setType(PoolTypes.stable)}
                            >
                                Stable swap <Tick />
                            </PoolType>
                            <PoolType
                                isActive={type === PoolTypes.constant}
                                onClick={() => setType(PoolTypes.constant)}
                            >
                                Constant product
                                <Tick />
                            </PoolType>
                        </StyledFormSection>
                        <StyledFormSection>
                            <FormSectionTitle>Tokens in pool</FormSectionTitle>
                            <StyledAssetDropdown
                                label="First asset"
                                asset={StellarService.createLumen()}
                                onUpdate={() => {}}
                            />
                            <StyledAssetDropdown
                                label="Second asset"
                                asset={StellarService.createLumen()}
                                onUpdate={() => {}}
                            />
                            <AddRowButton likeDisabled isPurpleText>
                                Add third asset
                            </AddRowButton>
                        </StyledFormSection>
                        <StyledFormSection>
                            <FormSectionTitle>Fees</FormSectionTitle>
                            <FormRow>
                                <Input label="Swap Fee (0.04 - 1%)" />
                                <Input label="A (1-5000)" />
                            </FormRow>
                            <Button isBig fullWidth>
                                Create pool
                            </Button>
                        </StyledFormSection>
                    </StyledForm>
                </Content>
            </FormWrap>
        </MainBlock>
    );
};

export default CreatePool;

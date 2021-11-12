import * as React from 'react';
import styled from 'styled-components';
import { flexAllCenter } from '../../../common/mixins';

const Wrapper = styled.div`
    display: flex;
    align-items: center;
`;

const FirstIcon = styled.div`
    width: 3.8rem;
    height: 3.8rem;
    border: 0.3rem solid white;
    border-radius: 50%;
    background: center / contain no-repeat url(${({ imageUrl }: { imageUrl: string }) => imageUrl});
`;

const SecondIconWrapper = styled.div`
    ${flexAllCenter};
    width: 3.8rem;
    height: 3.8rem;
    padding: 0.3rem;
    margin-left: -14px;
    z-index: -1;
`;

const SecondIcon = styled.img`
    width: 100%;
    height: 100%;
`;

const IconsPair = ({
    firstAsset,
    secondAsset,
}: {
    firstAsset: { image: string };
    secondAsset: { image: string };
}): JSX.Element => {
    return (
        <Wrapper>
            <FirstIcon imageUrl={firstAsset.image} />
            <SecondIconWrapper>
                <SecondIcon alt="icon of asset" src={secondAsset.image} />
            </SecondIconWrapper>
        </Wrapper>
    );
};

export default IconsPair;

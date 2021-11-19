import * as React from 'react';
import IconsPair from '../../../PairIcons/IconsPair';
import CloseIcon from '../../../../../common/assets/img/icon-close-small.svg';
import styled from 'styled-components';
import { flexAllCenter } from '../../../../../common/mixins';
import { COLORS } from '../../../../../common/styles';
import Input from '../../../../../common/basics/Input';
import { Asset } from '../../../../api/types';

const PairBlock = styled.div`
    padding: 0.4rem 0;
    margin-bottom: 0.8rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.paragraphText};
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const AssetsInfo = styled.div`
    display: flex;
    align-items: center;
    span {
        margin-left: 0.8rem;
    }
`;

const CloseButton = styled.button`
    ${flexAllCenter};
    border: none;
    cursor: pointer;
    padding: 1.2rem;
    background-color: ${COLORS.lightGray};
    border-radius: 1rem;
`;

const StyledInput = styled(Input)`
    width: auto;
    margin: 0 1.2rem 0 auto;
`;

const Pair = ({
    pairData,
    handlerInputPair,
    removePair,
}: {
    pairData: { baseAsset: Asset; counterAsset: Asset; amountAqua: number; pairString: string };
    handlerInputPair: ({}) => void;
    removePair: (pairString) => void;
}): JSX.Element => {
    const { baseAsset, counterAsset, amountAqua, pairString } = pairData;

    return (
        <PairBlock>
            <AssetsInfo>
                <IconsPair firstAsset={baseAsset} secondAsset={counterAsset} />
                <span>
                    {baseAsset.code} / {counterAsset.code}
                </span>
            </AssetsInfo>
            <StyledInput
                value={amountAqua}
                onChange={(e) => handlerInputPair({ value: e.target.value, pairString })}
                isMedium
                isRightAligned
            />
            <CloseButton onClick={() => removePair(pairString)}>
                <CloseIcon />
            </CloseButton>
        </PairBlock>
    );
};

export default Pair;

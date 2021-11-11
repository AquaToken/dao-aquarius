import * as React from 'react';
import styled from 'styled-components';
import { COLORS } from '../styles';
import { useEffect, useState } from 'react';

const ToggleBlock = styled.div`
    background-color: ${COLORS.gray};
    border-radius: 5px;
    display: flex;

    font-size: 1.4rem;
    line-height: 1.6rem;
    color: ${COLORS.paragraphText};
`;

const InputItem = styled.input`
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
`;

const VoteOption = styled.label`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.8rem 1.6rem;
    margin: 0.4rem;

    background-color: ${COLORS.gray};
    border-radius: 3px;

    font-size: 1.6rem;
    line-height: 1.8rem;

    transition: all ease 200ms;

    ${({ isChecked }: { isChecked: boolean }) =>
        isChecked ? `background-color: ${COLORS.white};` : `background-color: ${COLORS.gray};`};
    &:hover {
        ${({ isChecked }: { isChecked: boolean }) =>
            !isChecked &&
            `cursor: pointer;
             background: ${COLORS.white};
             box-shadow: 0px 20px 30px rgba(0, 6, 54, 0.06);
             `};
    }
`;

const ToggleGroup = ({
    options,
    defaultChecked,
    onChange,
}: {
    defaultChecked?: string;
    options: string[];
    onChange: (value) => void;
}): JSX.Element => {
    const [selectedOption, setSelectedOption] = useState(defaultChecked || null);
    useEffect(() => {
        onChange(selectedOption);
    }, [selectedOption]);

    return (
        <ToggleBlock>
            {options.map((item) => {
                const isSelected = selectedOption === item;
                return (
                    <VoteOption key={item} isChecked={isSelected}>
                        <InputItem
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                                setSelectedOption(item);
                            }}
                        />
                        {item}
                    </VoteOption>
                );
            })}
        </ToggleBlock>
    );
};

export default ToggleGroup;

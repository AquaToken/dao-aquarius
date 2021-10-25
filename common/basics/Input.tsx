import styled from 'styled-components';
import { COLORS } from '../styles';
import { textEllipsis } from '../mixins';

const Input = styled.input`
    height: 6.6rem;
    width: 100%;
    border: 0.1rem solid ${COLORS.gray};
    border-radius: 0.5rem;
    padding: 2.4rem 6.5rem 2.4rem 2.4rem;
    font-size: 1.6rem;
    line-height: 1.8rem;
    color: ${COLORS.paragraphText};
    box-sizing: border-box;
    ${textEllipsis};

    &::placeholder {
        color: ${COLORS.placeholder};
    }

    &:focus {
        border: 0.2rem solid ${COLORS.purple};
    }
`;

export default Input;

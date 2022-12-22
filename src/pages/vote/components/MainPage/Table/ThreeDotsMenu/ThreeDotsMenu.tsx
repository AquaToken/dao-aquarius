import * as React from 'react';
import { useRef, useState } from 'react';
import styled from 'styled-components';
import { flexAllCenter } from '../../../../../../common/mixins';
import ThreeDots from '../../../../../../common/assets/img/three-dots-icon.svg';
import Dislike from '../../../../../../common/assets/img/icon-dislike.svg';
import { COLORS } from '../../../../../../common/styles';
import useOnClickOutside from '../../../../../../common/hooks/useOutsideClick';
import { ModalService } from '../../../../../../common/services/globalServices';
import VotesAmountModal from '../../VoteModals/VotesAmountModal';
import useAuthStore from '../../../../../../store/authStore/useAuthStore';
import ChooseLoginMethodModal from '../../../../../../common/modals/ChooseLoginMethodModal';

const Wrapper = styled.div`
    position: relative;
    z-index: 100;
`;

const Button = styled.div<{ disabled: boolean }>`
    height: 4.8rem;
    min-width: 2rem;
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
    ${flexAllCenter};
    margin-left: 1.2rem;

    &:hover {
        background-color: ${COLORS.lightGray};
    }
`;

const Menu = styled.div`
    position: absolute;
    height: 5.2rem;
    top: calc(100% + 1.2rem);
    right: -2.5rem;
    box-shadow: 0 0.2rem 1rem rgba(0, 6, 54, 0.06);
    border-radius: 5px;
    padding: 0 2.3rem;
    white-space: nowrap;
    background: ${COLORS.white};
    cursor: pointer;
    ${flexAllCenter};

    &:hover {
        background-color: ${COLORS.lightGray};
    }

    svg {
        margin-right: 1.6rem;
    }
`;

const ThreeDotsMenu = ({ pair, disabled, ...props }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        if (disabled) {
            return;
        }
        setIsOpen((prevState) => !prevState);
    };

    const menuRef = useRef(null);

    const { isLogged } = useAuthStore();

    useOnClickOutside(menuRef, () => {
        setIsOpen(false);
    });

    const downVote = () => {
        if (!isLogged) {
            ModalService.openModal(ChooseLoginMethodModal, {});
            return;
        }

        ModalService.openModal(VotesAmountModal, { pairs: [pair], isDownVoteModal: true });
    };

    return (
        <Wrapper onClick={() => toggleMenu()} ref={menuRef} {...props}>
            <Button disabled={disabled}>
                <ThreeDots />
            </Button>

            {isOpen && (
                <Menu onClick={() => downVote()}>
                    <Dislike />
                    Downvote this pair
                </Menu>
            )}
        </Wrapper>
    );
};

export default ThreeDotsMenu;

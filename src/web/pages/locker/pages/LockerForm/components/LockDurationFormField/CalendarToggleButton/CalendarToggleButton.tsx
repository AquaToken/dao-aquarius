import * as React from 'react';

import ArrowDownIcon from 'assets/icons/arrows/arrow-down-16.svg';
import IconClose from 'assets/icons/nav/icon-close-alt-16.svg';
import IconCalendar from 'assets/icons/objects/icon-calendar-16.svg';

import { CalendarButton } from './CalendarToggleButton.styled';

interface Props {
    isOpen: boolean;
    onClick: () => void;
}

export const CalendarToggleButton: React.FC<Props> = ({ isOpen, onClick }) => {
    const stopEvents = (e: React.SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <CalendarButton onMouseDown={stopEvents} onTouchStart={stopEvents} onClick={onClick}>
            <IconCalendar />
            {isOpen ? <IconClose /> : <ArrowDownIcon />}
        </CalendarButton>
    );
};

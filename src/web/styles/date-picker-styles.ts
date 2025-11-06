import { createGlobalStyle } from 'styled-components';

import { COLORS, FONT_FAMILY } from './style-constants';

export const DatePickerStyles = createGlobalStyle`
    div.react-datepicker-wrapper {
        width: 100%;
    }
    div.react-datepicker {
        font-family: ${FONT_FAMILY.roboto};
        font-size: 1.6rem;
        background-color: ${COLORS.white};
        color: ${COLORS.textTertiary};
        border: none;
        border-radius: 0.5rem;
        box-shadow: 0 20px 30px rgba(0, 6, 54, 0.06);
    }
    div.react-datepicker__triangle {
        display: none;
    }
    div.react-datepicker__header {
        background-color: ${COLORS.white};
        border-bottom: none;
    }
    
    div.react-datepicker-popper {
      z-index: 200;
    }
    div.react-datepicker__day-name, .react-datepicker__day, .react-datepicker__time-name {
        display: inline-block;
        width: 4.6rem;
        line-height: 4.5rem;
        margin: 0;
    }
    div.react-datepicker__day--selected {
        border-radius: 0;
        background-color: ${COLORS.purple400};
        color: ${COLORS.white};
        
        &:hover {
            background-color: ${COLORS.purple400};
        }
    }
    div.react-datepicker__day--keyboard-selected {
        background-color: unset;
        color: unset;
        
        &:hover {
          background-color: ${COLORS.gray10};
        }
    }
    div.react-datepicker__current-month  {
        color: ${COLORS.black};
        font-weight: normal;
        font-size: 1.6rem;
        line-height: 2.8rem;
    }
    div.react-datepicker__month {
        margin: 0;
        border-left: 1px solid ${COLORS.gray100};
        border-top: 1px solid ${COLORS.gray100};
    }
    div.react-datepicker__day {
        width: 4.6rem;
        line-height: 4.5rem;
        margin: 0;
        border-right: 1px solid ${COLORS.gray100};
        border-bottom: 1px solid ${COLORS.gray100};
  }
    div.react-datepicker__day--outside-month {
        color: ${COLORS.gray200};
    }
`;

import { createGlobalStyle } from 'styled-components';

import { customScroll, flexAllCenter, respondDown } from './mixins';
import { Breakpoints, COLORS, FONT_FAMILY } from './style-constants';

export const DatePickerStyles = createGlobalStyle`
    div.react-datepicker-wrapper {
        width: 100%;
    }
    div.react-datepicker {
        font-family: ${FONT_FAMILY.roboto};
        font-size: 1.6rem;
        background-color: ${COLORS.gray100};
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
        border-right: 1px solid ${COLORS.gray100};
    }
    
    div.react-datepicker-popper {
        z-index: 200;
        transform: translate(0, -50%);
    }
    .react-datepicker__day-names {
        background-color: ${COLORS.white};
        margin-bottom: 0;
        border-right: 1px solid ${COLORS.gray100};
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
            background-color: ${COLORS.purple400}!important;
            border-radius: 0!important;
        }
    }

    div.react-datepicker__day--keyboard-selected {
        background-color: unset;
        color: unset;

        &:hover {
            background-color: ${COLORS.gray10}!important;
            color: ${COLORS.black}!important;
        }
    }
    div.react-datepicker__day {
        
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
         background-color: ${COLORS.white};

        &--selected {
            background-color: ${COLORS.purple500};
        }
        
    }
    div.react-datepicker__day--outside-month {
        color: ${COLORS.gray200};
    }
    
    div.react-datepicker__time-container {
        margin-left: 0.5rem;
        border-left: none;
    }
    
    div.react-datepicker__header--time {
        border-bottom: 0.1rem solid ${COLORS.gray100};
        
        
        div.react-datepicker-time__header {
            font-size: 1.6rem;
            font-weight: 400;
        }
    }
    
    li.react-datepicker__time-list-item {
        font-size: 1.6rem;
        line-height: 1.8rem;
        border-bottom: 0.1rem solid ${COLORS.gray100};
        height: 3.6rem!important;
        ${flexAllCenter};
    }
    
    li.react-datepicker__time-list-item--selected {
        background-color: ${COLORS.purple400}!important;
    }
    
    .react-datepicker__triangle {
        display: none;
    }

    ${customScroll};
    
    ${respondDown(Breakpoints.sm)`
        div.react-datepicker__time-container {
            float: left;
            margin-left: 0;
            border-left: 1px solid ${COLORS.gray100};
            margin-top: 5px;
            width: 323px
        }

        .react-datepicker__time-list {
            height: 150px !important;
            overflow-y: scroll;
        }

        div.react-datepicker__time-box {
            width: 100%!important;
        }
    `}
`;

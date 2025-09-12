import styled from 'styled-components';

const Wrapper = styled.a`
    all: unset;
    box-sizing: border-box;
    cursor: pointer;
    display: inline-block;
    text-decoration: none;
    width: max-content;
    color: inherit;
`;

interface ExternalLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    children: string | React.ReactNode;
}

export const BlankExternalLink = ({ children, ...props }: ExternalLinkProps): React.ReactNode => {
    return (
        <Wrapper {...props} target="_blank" rel="noreferrer noopener">
            {children}
        </Wrapper>
    );
};

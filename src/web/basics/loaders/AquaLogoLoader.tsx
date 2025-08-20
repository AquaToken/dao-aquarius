import styled, { keyframes } from 'styled-components';

const flipAfterReveal = keyframes`
  0%   { transform: perspective(700px) rotateY(0deg); }
  70%  { transform: perspective(700px) rotateY(0deg); }
  85%  { transform: perspective(700px) rotateY(-180deg); }
  100% { transform: perspective(700px) rotateY(0deg); }
`;

const Root = styled.div<{ $size: number; $total: number }>`
    width: ${({ $size }) => $size}px;
    height: ${({ $size }) => $size}px;
    display: inline-block;
    transform-style: preserve-3d;
    will-change: transform;
    animation: ${flipAfterReveal} ${({ $total }) => $total}s linear infinite;
`;

const Svg = styled.svg<{ $total: number }>`
    width: 100%;
    height: 100%;
    display: block;

    .reveal {
        transform-origin: left center;
        transform-box: fill-box;
        animation: revealX ${({ $total }) => $total}s linear infinite;
    }

    @keyframes revealX {
        0% {
            transform: scaleX(0);
        }
        10% {
            transform: scaleX(0);
        }
        45% {
            transform: scaleX(1);
        }
        70% {
            transform: scaleX(1);
        }
        75% {
            transform: scaleX(0);
        }
        100% {
            transform: scaleX(0);
        }
    }
`;

type Props = {
    size?: number;
    flipDuration?: number;
    revealDuration?: number;
    className?: string;
};

const AquaLogoLoader: React.FC<Props> = ({
    size = 40,
    flipDuration = 0.6,
    revealDuration = 0.7,
    className,
}) => {
    const total = flipDuration * 2 + revealDuration;

    return (
        <Root $size={size} $total={total} className={className}>
            <Svg
                viewBox="0 0 88 88"
                xmlns="http://www.w3.org/2000/svg"
                $total={total}
                role="img"
                aria-label="Aqua logo animated"
            >
                <defs>
                    <mask id="reveal-mask">
                        <rect x="0" y="0" width="88" height="88" fill="#000" />
                        <rect className="reveal" x="0" y="0" width="88" height="88" fill="#fff" />
                    </mask>
                    <clipPath id="round-clip">
                        <path d="M0 44C0 24.9267 0 15.3901 5.17452 8.90811C6.276 7.52831 7.52831 6.276 8.90811 5.17452C15.3901 0 24.9267 0 44 0C63.0733 0 72.6099 0 79.0919 5.17452C80.4717 6.276 81.724 7.52831 82.8255 8.90811C88 15.3901 88 24.9267 88 44C88 63.0733 88 72.6099 82.8255 79.0919C81.724 80.4717 80.4717 81.724 79.0919 82.8255C72.6099 88 63.0733 88 44 88C24.9267 88 15.3901 88 8.90811 82.8255C7.52831 81.724 6.276 80.4717 5.17452 79.0919C0 72.6099 0 63.0733 0 44Z" />
                    </clipPath>
                </defs>

                <path
                    d="M0 44C0 24.9267 0 15.3901 5.17452 8.90811C6.276 7.52831 7.52831 6.276 8.90811 5.17452C15.3901 0 24.9267 0 44 0C63.0733 0 72.6099 0 79.0919 5.17452C80.4717 6.276 81.724 7.52831 82.8255 8.90811C88 15.3901 88 24.9267 88 44C88 63.0733 88 72.6099 82.8255 79.0919C81.724 80.4717 80.4717 81.724 79.0919 82.8255C72.6099 88 63.0733 88 44 88C24.9267 88 15.3901 88 8.90811 82.8255C7.52831 81.724 6.276 80.4717 5.17452 79.0919C0 72.6099 0 63.0733 0 44Z"
                    fill="#872AB0"
                />

                <g mask="url(#reveal-mask)" clipPath="url(#round-clip)" fill="white">
                    <path d="M52.07 40.4602L61.8814 50.2342L71.6242 40.5229L75.9004 44.7591L61.8827 58.7317L52.07 48.9564L36.597 64.3703L28.2944 56.0994L18.3554 66.0005L14.0804 61.763L28.2944 47.6032L36.597 55.8741L52.07 40.4602Z" />
                    <path d="M52.07 23.9805L61.8814 33.7545L71.6242 24.0432L75.9004 28.2794L61.8827 42.252L52.07 32.4767L36.597 47.8906L28.2944 39.6197L18.3554 49.5208L14.0804 45.2833L28.2944 31.1235L36.597 39.3944L52.07 23.9805Z" />
                </g>
            </Svg>
        </Root>
    );
};

export default AquaLogoLoader;

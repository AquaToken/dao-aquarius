import * as React from 'react';

import type { ConcentratedRangeMetrics } from 'helpers/amm-concentrated-position-range';

import {
    ActiveRange,
    Container,
    CurrentMarker,
    Header,
    Label,
    Track,
    TrackLine,
    Values,
} from './ConcentratedPositionPriceRange.styled';

type Props = {
    baseCode: string;
    counterCode: string;
    range: ConcentratedRangeMetrics;
    className?: string;
};

const ConcentratedPositionPriceRange = ({
    baseCode,
    counterCode,
    range,
    className,
}: Props): React.ReactNode => (
    <Container className={className}>
        <Header>
            <Label>
                Price range: ({baseCode}/{counterCode})
            </Label>
        </Header>
        <Track>
            <TrackLine />
            <ActiveRange $left={range.activeLeft} $width={range.activeWidth} />
            {!range.isFullRange && (
                <CurrentMarker $left={range.markerLeft} $inRange={range.inRange} />
            )}
        </Track>
        <Values>
            {range.isFullRange ? (
                <span>Full Range</span>
            ) : (
                <>
                    <span>{range.minLabel}</span>
                    <span>{range.maxLabel}</span>
                </>
            )}
        </Values>
    </Container>
);

export default ConcentratedPositionPriceRange;

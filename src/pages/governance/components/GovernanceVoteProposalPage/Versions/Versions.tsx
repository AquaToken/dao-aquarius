import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { AppRoutes } from 'constants/routes';

import { getDateString } from 'helpers/date';

import { Proposal } from 'types/governance';

import ExternalLinkIcon from 'assets/icons/nav/icon-external-link-16.svg';

import { flexAllCenter } from 'styles/mixins';
import { COLORS } from 'styles/style-constants';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;

    a {
        text-decoration: none;
    }
`;

const Row = styled.div`
    display: flex;
    padding: 1.1rem 0;
    font-weight: 400;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.textTertiary};
`;

const HeadRow = styled(Row)`
    padding: 1.6rem 0;
    font-weight: 400;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.textGray};
`;

const Item = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
`;

const Details = styled(Item)`
    justify-content: flex-end;
    color: ${COLORS.purple500};
    cursor: pointer;
    text-decoration: none;

    svg {
        margin-left: 1.6rem;
    }
`;

const Latest = styled.div`
    ${flexAllCenter};
    height: 2.3rem;
    padding: 0 0.8rem;
    margin-left: 0.8rem;
    border: 0.1rem solid ${COLORS.purple500};
    border-radius: 3rem;
    font-weight: 400;
    font-size: 1.2rem;
    color: ${COLORS.textPrimary};
`;

const Versions = ({ proposal }: { proposal: Proposal }) => {
    const versions = [
        ...proposal.history_proposal,
        {
            text: proposal.text,
            title: proposal.title,
            created_at: proposal.last_updated_at,
            version: proposal.version,
        },
    ];
    return (
        <Container>
            <HeadRow>
                <Item>Version</Item>
                <Item>Date/Time</Item>
                <Item />
            </HeadRow>
            {versions.map(version => (
                <Row key={version.version}>
                    <Item>
                        v{version.version}.0
                        {version.version === proposal.version && <Latest>LATEST</Latest>}
                    </Item>
                    <Item>
                        {getDateString(new Date(version.created_at).getTime(), { withTime: true })}
                    </Item>
                    <Link
                        to={AppRoutes.section.governance.to.proposal({
                            id: String(proposal.id),
                            version: String(version.version),
                        })}
                    >
                        <Details>
                            Details
                            <ExternalLinkIcon />
                        </Details>
                    </Link>
                </Row>
            ))}
        </Container>
    );
};

export default Versions;

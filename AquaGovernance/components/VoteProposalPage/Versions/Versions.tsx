import * as React from 'react';
import { Proposal } from '../../../api/types';
import styled from 'styled-components';
import { COLORS } from '../../../../common/styles';
import { getDateString } from '../../../../common/helpers/helpers';
import ExternalLinkIcon from '../../../../common/assets/img/icon-external-link.svg';
import { flexAllCenter } from '../../../../common/mixins';
import { Link } from 'react-router-dom';
import { MainRoutes } from '../../../routes';

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
    color: ${COLORS.paragraphText};
`;

const HeadRow = styled(Row)`
    padding: 1.6rem 0;
    font-weight: 400;
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
`;

const Item = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
`;

const Details = styled(Item)`
    justify-content: flex-end;
    color: ${COLORS.purple};
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
    border: 0.1rem solid ${COLORS.purple};
    border-radius: 3rem;
    font-weight: 400;
    font-size: 1.2rem;
    color: ${COLORS.titleText};
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
            {versions.map((version) => (
                <Row key={version.version}>
                    <Item>
                        v{version.version}.0
                        {version.version === proposal.version && <Latest>LATEST</Latest>}
                    </Item>
                    <Item>
                        {getDateString(new Date(version.created_at).getTime(), { withTime: true })}
                    </Item>
                    <Link to={`${MainRoutes.proposal}/${proposal.id}/${version.version}/`}>
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

import * as React from 'react';
import styled from 'styled-components';
import BackgroundImageLeft from '../../../common/assets/img/background-left.svg';
import BackgroundImageRight from '../../../common/assets/img/background-right.svg';
import { Breakpoints, COLORS } from '../../../common/styles';
import { commonMaxWidth, flexAllCenter, respondDown } from '../../../common/mixins';
import ToggleGroup from '../../../common/basics/ToggleGroup';
import { useState } from 'react';

const MainBlock = styled.main`
    flex: 1 0 auto;
`;

const Background = styled.div`
    padding: 10% 0;
    ${flexAllCenter};
    flex-direction: column;
    background-color: ${COLORS.darkPurple};
    min-height: 10rem;
    max-height: 40vh;
    overflow: hidden;
    position: relative;
`;

const BackgroundLeft = styled(BackgroundImageLeft)`
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
`;

const BackgroundRight = styled(BackgroundImageRight)`
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
`;

const Title = styled.h2`
    font-size: 8rem;
    line-height: 9.4rem;
    font-weight: bold;
    color: ${COLORS.white};
    z-index: 1;
    margin-bottom: 1.6rem;
    text-align: center;

    ${respondDown(Breakpoints.lg)`
      font-size: 7rem;
      line-height: 8rem;
      margin-bottom: 1.2rem;
    `}

    ${respondDown(Breakpoints.md)`
        font-size: 5.5rem;
        line-height: 6rem;
        margin-bottom: 1rem;
    `}
    
    ${respondDown(Breakpoints.sm)`
        font-size: 4rem;
        line-height: 5rem;
        margin-bottom: 0.8rem;
    `}
`;

const Description = styled.div`
    max-width: 79.2rem;
    font-size: 1.6rem;
    line-height: 2.8rem;
    color: ${COLORS.white};
    text-align: center;
    opacity: 0.7;
    z-index: 1;
`;

const ExploreBlock = styled.div`
    position: relative;
    padding: 0 4rem;
    ${commonMaxWidth};
`;

const PairSearch = styled.div`
    position: sticky;
    top: 3.2rem;
    margin-top: -8.5rem;
    font-size: 5.2rem;
    height: 17rem;
    background: #ffffff;
    box-shadow: 0 20px 30px rgba(0, 6, 54, 0.06);
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Header = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 5.4rem 0;
`;

const TitleHeader = styled.h3`
    font-weight: bold;
    font-size: 5.6rem;
    line-height: 6.4rem;
    color: ${COLORS.titleText};
`;

const StatusUpdate = styled.div`
    font-size: 1.4rem;
    line-height: 2rem;
    color: ${COLORS.grayText};
`;
// const options = ['Popular', 'Top 100', 'Top Volume'];

const MainPage = (): JSX.Element => {
    const [selectedOption, setSelectedOption] = useState(null);
    console.log(selectedOption);
    return (
        <MainBlock>
            <Background>
                <Title>Vote For Your Favorite Pairs</Title>
                <Description>
                    Lock your AQUA to create immutable and transparent votes direct on the Stellar
                    blockchain
                </Description>
                <BackgroundLeft />
                <BackgroundRight />
            </Background>
            <ExploreBlock>
                <PairSearch>undefined</PairSearch>
                <Header>
                    <TitleHeader>Explore</TitleHeader>
                    <ToggleGroup
                        onChange={(option) => setSelectedOption(option)}
                        defaultChecked={'Top 100'}
                        options={['Popular', 'Top 100', 'Top Volume']}
                    />
                    <StatusUpdate>Last updated 12 hours ago</StatusUpdate>
                </Header>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci, alias asperiores
                aut, beatae blanditiis consequatur consequuntur cupiditate earum expedita incidunt
                ipsum nemo placeat similique tempore ut veritatis voluptatibus! Ad aliquid animi
                aspernatur, blanditiis commodi inventore iure omnis quis. Assumenda distinctio
                dolorem et illum libero necessitatibus perferendis sunt. A, alias autem consequuntur
                delectus deserunt dignissimos et explicabo facilis fuga fugit impedit ipsa itaque
                libero, nemo nulla omnis placeat quis sapiente sed sequi temporibus vero vitae
                voluptas! Dignissimos fugiat libero magni molestias, natus nesciunt quam quasi quis
                repellat voluptates. Architecto asperiores assumenda beatae consequatur cum debitis,
                deleniti dicta dolor dolore dolorum eius eligendi excepturi expedita fugit ipsa iste
                laudantium modi, nam neque nobis odio omnis optio perferendis quasi quibusdam quo
                recusandae repellat rerum sapiente totam unde veritatis voluptates voluptatibus.
                Animi distinctio exercitationem ipsam magnam odit pariatur rerum veritatis
                voluptatibus voluptatum. Dolorum illo praesentium tempore? Aliquam atque beatae
                corporis cupiditate deserunt dicta dignissimos dolore eius eligendi enim, eveniet,
                expedita illo illum ipsum maiores maxime molestias mollitia nisi optio praesentium
                quas reprehenderit saepe sapiente similique sint, suscipit unde ut vel vitae
                voluptates. A, aliquam aperiam cupiditate dolores doloribus eaque facilis illo in
                labore neque nihil rerum tenetur totam vel veritatis. Accusamus asperiores beatae
                blanditiis commodi dolorem doloremque earum enim esse et illo in, iure libero nisi
                officiis optio praesentium quae quidem quos repudiandae tempora. Dolorum ex
                inventore laudantium quasi sunt veritatis! Ad assumenda delectus dolorum ducimus
                eius error eveniet impedit ipsum iusto minus molestias mollitia numquam, odio odit
                optio pariatur perferendis provident quia quibusdam ratione rem sapiente tenetur.
                Adipisci alias animi cum, debitis eum exercitationem, facere ipsa molestiae quaerat
                quis quisquam ratione, reprehenderit saepe. Debitis dolorem maiores non numquam
                sapiente soluta? Accusantium autem dicta ex ipsam magni nam neque qui tempora veniam
                voluptatum? Accusamus amet animi assumenda autem beatae blanditiis consectetur
                cumque distinctio dolor dolore doloremque eius eligendi et id, illum, incidunt natus
                optio praesentium quam quas recusandae rerum soluta tempore tenetur totam unde
                veritatis. Aut distinctio harum laudantium maxime molestiae, rem repellat.
                Consectetur culpa cumque, delectus eligendi fuga itaque, laborum magnam nisi numquam
                officiis porro quia, quis quo reiciendis sunt! Ab adipisci aut eaque eligendi
                inventore laboriosam maxime modi optio ratione sint. Aliquam aliquid amet aut,
                beatae commodi cum distinctio dolor doloremque exercitationem expedita facilis id
                itaque laboriosam laudantium minus molestias nostrum odio officiis omnis provident
                quia quos repellat, voluptas voluptatem voluptates. Accusantium alias architecto,
                assumenda consectetur distinctio dolorum est et facere fugit in iste nemo, odit
                praesentium quasi recusandae reprehenderit repudiandae, ut. Architecto beatae
                dolores ducimus et incidunt, maxime mollitia odit omnis porro rem, sequi, unde.
                Animi asperiores commodi dignissimos exercitationem expedita illo ipsum minus omnis
                quidem quo, quos rerum sapiente. Accusamus aliquam beatae, consequatur deserunt enim
                eum, expedita explicabo in incidunt minus neque optio reprehenderit totam ullam
                unde, ut voluptatum! Dicta ipsam libero quam? Accusantium magnam unde vel veritatis.
                Accusamus amet beatae dignissimos, eligendi numquam quidem ratione recusandae
                similique sit, ullam vel voluptatem? Accusamus ad, deleniti dolor dolorum minima
                nobis ut vel. Accusantium beatae nemo tempora! Eum officia pariatur reiciendis sunt!
            </ExploreBlock>
        </MainBlock>
    );
};

export default MainPage;

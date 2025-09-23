import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { MainRoutes } from 'constants/routes';

import { QuestTaskStatus, TaskName, TaskStatus as TaskStatusType } from 'types/quest';

import { flexAllCenter, respondDown } from 'web/mixins';
import { Breakpoints, COLORS } from 'web/styles';

import Task1 from 'assets/quest-task-1.png';
import Task2 from 'assets/quest-task-2.png';
import Task3 from 'assets/quest-task-3.png';
import Task4 from 'assets/quest-task-4.png';

import Question from 'components/Question';

import TaskStatus from 'pages/quest/TaskStatus/TaskStatus';

const Container = styled.div`
    display: flex;
    flex-direction: column;
`;

const Title = styled.h2`
    font-weight: 700;
    font-size: 5.6rem;
    line-height: 6.4rem;
    margin-bottom: 4.6rem;
`;

const Task = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;

    ${respondDown(Breakpoints.md)`
        flex-direction: column;
        align-items: flex-start;
        width: 80%;
    `}
`;

const TaskDescription = styled.div`
    display: flex;
    flex-direction: column;

    a {
        text-decoration: none;
    }
`;

const ImageWrapper = styled.div`
    background-color: ${COLORS.lightGray};
    border-radius: 2.4rem;
    ${flexAllCenter};

    img {
        max-width: 80%;
        max-height: 34rem;
    }
`;

const Optional = styled.div`
    height: 1.6rem;
    border-radius: 4.3rem;
    background-color: ${COLORS.placeholder};
    text-transform: uppercase;
    padding: 0 0.6rem;
    color: ${COLORS.white};
    font-weight: 500;
    font-size: 0.8rem;
    line-height: 2rem;
    display: flex;
    align-items: center;
`;

interface Props {
    statuses: QuestTaskStatus[] | null;
}

const QuestTasks = ({ statuses }: Props) => {
    const firstTask = statuses?.find(({ task_code }) => task_code === TaskName.swap);
    const secondTask = statuses?.find(({ task_code }) => task_code === TaskName.lock);
    const thirdTask = statuses?.find(({ task_code }) => task_code === TaskName.deposit);
    const fourthTask = statuses?.find(({ task_code }) => task_code === TaskName.vote);

    return (
        <Container>
            <Title>Quest tasks</Title>

            <Question
                question={
                    <Task>
                        <TaskStatus
                            isComplete={firstTask && firstTask.status === TaskStatusType.completed}
                        />
                        <span>Swap at least 10,000 AQUA tokens</span>
                    </Task>
                }
                answer={
                    <TaskDescription>
                        <ol>
                            <li>
                                Go to <Link to={MainRoutes.swap}>https://aqua.network/swap</Link>
                            </li>
                            <li>
                                Specify the receive amount as 10,000 AQUA (you can use any source
                                token)
                            </li>
                            <li>Make sure you have enough funds to buy AQUA</li>
                            <li>Don’t forget to provide trustline to receive AQUA</li>
                            <li>Execute swap</li>
                        </ol>
                        <h4>
                            Congrats! You now have AQUA tokens which will help you earn on Aquarius.
                        </h4>
                        <ImageWrapper>
                            <img src={Task1} alt="" />
                        </ImageWrapper>
                    </TaskDescription>
                }
            />
            <Question
                question={
                    <Task>
                        <TaskStatus
                            isComplete={
                                secondTask && secondTask.status === TaskStatusType.completed
                            }
                        />
                        <span>
                            Lock all the 10,000 AQUA tokens for at least 3 months to get ICE
                        </span>
                    </Task>
                }
                answer={
                    <TaskDescription>
                        <ol>
                            <li>
                                Go to{' '}
                                <Link to={MainRoutes.locker}>https://aqua.network/locker</Link>
                            </li>
                            <li>Enter amount of AQUA - 10,000</li>
                            <li>
                                Make sure that the Lock period is at least 3 months from the current
                                date
                            </li>
                            <li>Execute Lock transaction</li>
                        </ol>
                        <h4>Amazing! Now you have got around 17,400 ICE tokens that will:</h4>
                        <ul>
                            <li>Boost your liquidity provision rewards</li>
                            <li>Let you vote for markets with increased voting power</li>
                        </ul>
                        <ImageWrapper>
                            <img src={Task2} alt="" />
                        </ImageWrapper>
                    </TaskDescription>
                }
            />

            <Question
                question={
                    <Task>
                        <TaskStatus
                            isComplete={thirdTask && thirdTask.status === TaskStatusType.completed}
                        />
                        <span>Deposit liquidity to one of the Aquarius AMM pools</span>
                        <Optional>optional</Optional>
                    </Task>
                }
                answer={
                    <TaskDescription>
                        <ol>
                            <li>
                                Go to <Link to={MainRoutes.amm}>https://aqua.network/pools</Link>
                            </li>
                            <li>Choose one of the pools to deposit to: AQUA/USDC or XLM/USDC.</li>
                            <li>
                                Deposit at least 5 USDC worth of assets: just{' '}
                                <b>put 2.5 value in the USDC input field</b> and the other field
                                will be filled in with the relevant amount automatically
                            </li>
                            <li>
                                You will receive both Base APY (based on trading fees from the pool)
                                and Rewards APY (additional AQUA rewards)
                            </li>
                            <li>Since you have some ICE balance, enjoy a boosted Rewards APY!</li>
                            <li>Execute the deposit</li>
                        </ol>
                        <h4>
                            Important: make sure you deposited to one of the pools listed above, or
                            the quest task will not be completed!
                        </h4>
                        <br />
                        <h4>
                            Another important note: rewards are claimed manually. To do that, please
                            proceed to{' '}
                            <Link to={MainRoutes.account}>https://aqua.network/account</Link>
                        </h4>
                        <ImageWrapper>
                            <img src={Task3} alt="" />
                        </ImageWrapper>
                    </TaskDescription>
                }
            />

            <Question
                question={
                    <Task>
                        <TaskStatus
                            isComplete={
                                fourthTask && fourthTask.status === TaskStatusType.completed
                            }
                        />
                        <span>Vote for any market</span>
                        <Optional>optional</Optional>
                    </Task>
                }
                answer={
                    <TaskDescription>
                        <ol>
                            <li>
                                Go to <Link to={MainRoutes.vote}>https://aqua.network/vote</Link>
                            </li>
                            <li>Choose any market you like</li>
                            <li>Cast your vote</li>
                        </ol>
                        <ImageWrapper>
                            <img src={Task4} alt="" />
                        </ImageWrapper>
                    </TaskDescription>
                }
            />
        </Container>
    );
};

export default QuestTasks;

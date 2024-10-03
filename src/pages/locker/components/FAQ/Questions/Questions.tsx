import * as React from 'react';
import styled from 'styled-components';

import Question from 'basics/Question';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const Questions = () => (
    <Container>
        <Question
            question="What does the locker tool do?"
            answer={
                <span>
                    Although originally used to boost Airdrop #2 rewards, the locker tool now turns
                    AQUA into ICE. Those who freeze AQUA through this tool receive 4 ICE tokens in
                    return, each of which has a specific use within the Aquarius universe.
                </span>
            }
        />
        <Question
            question="Will I get my ICE, upvoteICE, downvoteICE and governICE immediately after locking AQUA?"
            answer={
                <span>
                    The tokens will be credited to your wallet balance not later than in 2 hours.
                    The reason is that the ICE tokens distribution is a scheduled operation that
                    runs every 2 hours. If you're lucky enough you'll get your ICE within minutes.
                </span>
            }
        />
        <Question
            question="What are the benefits of freezing AQUA?"
            answer={
                <span>
                    Freezing AQUA into ICE comes with multiple benefits.
                    <br />
                    <br />
                    ICE tokens, unlike AQUA, can be used simultaneously on liquidity voting &
                    governance voting. Voting restrictions are also removed, with users able to
                    change their liquidity votes anytime and able to retrieve their ICE immediately
                    after a governance proposal ends.
                </span>
            }
        />
        <Question
            question="Can holding ICE increase liquidity reward yields?"
            answer={
                <span>
                    Yes! Holding ICE can increase the rewards given to those who take part in SDEX &
                    AMM liquidity rewards.
                    <br />
                    <br />
                    The more ICE an account holds, the higher the potential rewards boost given for
                    liquidity provision on selected markets. Markets eligible for liquidity rewards
                    can be found at{' '}
                    <a
                        href="https://aqua.network/rewards"
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        aqua.network/rewards
                    </a>
                    .
                </span>
            }
        />
        <Question
            question="How can I get more ICE?"
            answer={
                <span>
                    To get more ICE, you need to either lock more AQUA or choose a longer lock
                    period when locking AQUA.
                    <br />
                    <br />
                    Users can gain up to ten times the amount of ICE compared to the AQUA they lock
                    by locking for longer. To achieve the 10 times max boost, users need to lock
                    AQUA for 3 years or longer.
                </span>
            }
        />
        <Question
            question="Can ICE tokens be bought, sold, or transferred?"
            answer={
                <span>
                    No.
                    <br />
                    <br />
                    <b>ICE tokens can only be acquired by locking AQUA.</b> If someone is offering
                    ICE tokens on Stellar, they are fake. ICE tokens have the domain
                    <i> aqua.network</i>.
                </span>
            }
        />
        <Question
            question="Why is my ICE balance going down?"
            answer={
                <span>
                    ICE tokens melt as the AQUA unlocking date gets closer. Every day, the protocol
                    claws back ICE from your wallet balance and the votes you have made. This means
                    your balance and votes will decline over time unless more AQUA is frozen.
                </span>
            }
        />
        <Question
            question="Can I avoid ICE balance declines?"
            answer={
                <span>
                    Locking more AQUA can bring your ICE balance back up.
                    <br />
                    <br />
                    Alternatively, ICE balance declines can be temporarily avoided by locking for
                    longer than 3 years. As the 10 times boost maxes out at 3 year locks, a lock of
                    4 years will see no ICE balance declines for one year. Once the lock enters the
                    last 3 years, ICE will decline accordingly.
                </span>
            }
        />
        <Question
            question="How does locking work & is it safe?"
            answer={
                <span>
                    Locking AQUA takes place entirely at the protocol level on Stellar. When you use
                    the tool above, a claimable balance is created and sent back to your wallet.
                    Only you can reclaim the locked AQUA balance, unfreezing ICE after the lock
                    period you select passes.
                    <br />
                    <br />
                    Locking AQUA is completely safe when using this tool. AQUA is securely locked
                    into the Stellar blockchain, with only you able to reclaim the tokens at a later
                    time.
                </span>
            }
        />
    </Container>
);

export default Questions;

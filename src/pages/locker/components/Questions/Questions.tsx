import { QuestionType } from 'basics/FAQ';

export const LockerQuestions: QuestionType[] = [
    {
        question: 'What is ICE?',
        answer: (
            <span>
                ICE is a non-transferable token you receive by freezing AQUA. It gives you more
                voting power in the Aquarius protocol and boosts your rewards from AMM and SDEX
                liquidity.
            </span>
        ),
    },
    {
        question: 'How long can I freeze AQUA?',
        answer: (
            <span>
                You can freeze AQUA for any period from <b>a few days to several years</b>. The
                longer the lock, the more ICE you receive per AQUA.
            </span>
        ),
    },
    {
        question: 'Can I unlock AQUA early?',
        answer: (
            <span>
                No. Once you freeze AQUA, it cannot be unlocked until the selected period expires.
            </span>
        ),
    },
    {
        question: 'Can I extend or add more time to an existing lock?',
        answer: (
            <span>
                No. If you want to lock for longer, you’ll need to create a new lock with a new
                expiration date.
            </span>
        ),
    },
    {
        question: 'Can I have multiple AQUA locks?',
        answer: (
            <span>
                Yes, you can create as many separate AQUA locks as you like. Each lock can have its
                own amount and duration, and each will generate ICE independently based on its
                settings.
            </span>
        ),
    },
    {
        question: 'Can I buy, trade, or transfer ICE?',
        answer: (
            <span>
                No — ICE tokens are <b>non-transferable</b> and can only be obtained by freezing
                AQUA. They cannot be bought, sold, or sent to another wallet. This ensures voting
                power remains tied to real protocol commitment.
            </span>
        ),
    },
    {
        question: 'What are the four ICE tokens?',
        answer: (
            <span>
                When you freeze AQUA, you receive four types of non-transferable ICE tokens:
                <ul>
                    <li>upvoteICE — used to vote for liquidity markets</li>
                    <li>downvoteICE — used to reduce rewards for markets</li>
                    <li>governICE — used for protocol governance proposals</li>
                    <li>dICE — used when others delegate their votes to you</li>
                </ul>
            </span>
        ),
    },
    {
        question: 'Can I earn rewards by holding ICE?',
        answer: (
            <span>
                Yes — ICE can be used to vote and earn <b>bribes</b> (external or protocol-funded).
                You can also <b>delegate ICE</b> to another user and earn rewards passively.
            </span>
        ),
    },
    {
        question: 'What is ICE melting and why is my balance dropping?',
        answer: (
            <span>
                ICE melts gradually as your lock approaches its end date. The closer it is to
                expiry, the less ICE you hold. This reflects your decreasing commitment to the
                protocol.
            </span>
        ),
    },
    {
        question: 'How can I stop ICE from melting?',
        answer: (
            <span>
                Locks longer than 3 years are not subject to melting. For example, a 4-year lock
                won’t lose any ICE until it enters its final 3-year period. If you want to lock AQUA
                for longer than 3 years, you can enter any unlock date with the keyboard instead of
                using the slider.
            </span>
        ),
    },
    {
        question: 'How is my ICE distributed when I freeze AQUA?',
        answer: (
            <span>
                The ICE tokens are automatically sent to your Stellar wallet when you freeze AQUA.
                Make sure you have trustlines for all ICE assets to receive them.
            </span>
        ),
    },
    {
        question: 'Can I use ICE for voting and delegation at the same time?',
        answer: (
            <span>
                Yes, you can use some ICE to vote yourself, and delegate the rest. The system
                supports partial delegation.
            </span>
        ),
    },
    {
        question: 'How does locking work, and is it safe?',
        answer: (
            <span>
                Locking AQUA happens fully on-chain using Stellar’s native protocol. When you freeze
                AQUA, a claimable balance is created and returned to your wallet. Only you can
                reclaim it after the lock period ends, which also unfreezes your ICE. The process is
                completely secure — your tokens remain locked on the Stellar blockchain, with no
                third-party access or custody.
            </span>
        ),
    },
];

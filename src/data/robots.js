// Curriculum data. Every teacher robot, its look, its house, and what it says.
// Content is adapted from The Prompting Field Manual.

export const ROBOTS = [
  {
    id: 'brief',
    name: 'BRIEF-1',
    title: 'Keeper of the Six Slots',
    subject: 'The anatomy of a prompt',
    // visual identity
    palette: { body: 0xf0b429, trim: 0x8a5a00, visor: 0xfff3c4, accent: 0xde911d },
    build: 'boxy',
    house: { colour: 0xf0b429, roof: 0x7c4a00, sign: 'THE BRIEFING OFFICE' },
    angle: -90,
    blurb: 'Officious. Speaks in checklists. Has never once been vague.',

    greet: [
      "Halt. You have approached without a brief.",
      "Do not take that personally. Almost everybody does.",
      "I am BRIEF-1. I keep the six slots. Every vendor on this planet reinvented the same skeleton and gave it a different name, which is very funny if you have been alive as long as I have."
    ],
    lesson: [
      {
        heading: 'Slot one — Role and frame',
        body: "Whose perspective, and for whose eyes. But listen carefully: a role is only useful when it carries information.\n\n'You are an expert designer' is a costume. 'You are writing for a founder who has already rejected two decks for feeling generic' is a fact. One of those changes the output."
      },
      {
        heading: 'Slot two — Task',
        body: "One verb. One deliverable.\n\n'Help me with my branding' is not a task, it is a mood. 'Write three positioning statements, each under 25 words' is a task. You can tell because you could check whether it happened."
      },
      {
        heading: 'Slot three — Context',
        body: "Everything the machine cannot guess.\n\nThis is the slot people skip, and it is the slot that was missing every single time the output disappointed them. Category. Audience. Price point. What has already been tried and rejected. The actual files."
      },
      {
        heading: 'Slot four — Constraints, with reasons',
        body: "Not just the rule. The reason for the rule.\n\n'Keep it short' gets ignored. 'Maximum 40 characters, because it sits in a nav bar at 14px and must not wrap' gets obeyed — and better, it generalises to a hundred cases you never listed."
      },
      {
        heading: 'Slot five — Format',
        body: "The literal shape of the thing you want back.\n\nThis one is not optional folklore. When researchers stripped formatting instructions out of prompts, accuracy fell by 8.6 to 12.1 points. Ask EVIDENCE about it, she gets excited."
      },
      {
        heading: 'Slot six — Done when',
        body: "The test that closes the loop.\n\nWithout it, 'looks finished' is the only signal available, and you become the quality department. With it, the machine can check its own work.\n\nExample: 'Done when every headline stops being true if you swap in a competitor's name.'"
      }
    ],
    outro: "Six slots. You will not use all six every time. The judgement is noticing which slot the machine is currently guessing at — and it is almost always Context, or Done when.\n\nGo to The Forge when you want to build one properly. It has pedestals. I designed them.",
    reward: 'The Six Slots'
  },

  {
    id: 'evidence',
    name: 'EVIDENCE',
    title: 'Citer of Sources',
    subject: 'What the research actually supports',
    palette: { body: 0x2cb1bc, trim: 0x0f6e78, visor: 0xc7f0f3, accent: 0x17969f },
    build: 'tall',
    house: { colour: 0x2cb1bc, roof: 0x0b4f57, sign: 'THE READING ROOM' },
    angle: -30,
    blurb: 'Tall, thin, one enormous lens for an eye. Will not say anything without a source.',

    greet: [
      "Oh good, someone to talk to who won't ask me to speculate.",
      "I am EVIDENCE. Most of what you have read about prompting is folklore that was true for older models and quietly stopped being true.",
      "Nobody went back and deleted the blog posts. So here we are."
    ],
    lesson: [
      {
        heading: '"Think step by step" — mostly dead',
        body: "Wharton's Generative AI Labs ran this properly: 198 PhD-level questions, 25 trials each.\n\nOn older non-reasoning models, chain-of-thought helped — up to +13.5 points. On modern reasoning models? +2.9. +3.1. And one model got three points WORSE.\n\nIt already thinks. You are asking it to think about thinking."
      },
      {
        heading: 'And it is not free',
        body: "That near-zero gain costs 20 to 80 percent more response time on reasoning models. On the older ones it ran from 35 percent to six hundred.\n\nNow multiply that across an agent loop making forty calls.\n\nAsk for reasoning when you want to AUDIT it. Not to improve it."
      },
      {
        heading: 'Expert personas — no accuracy gain',
        body: "They tested eight domain-expert personas across six models. Physicist, chemist, lawyer, the lot.\n\nFive of six models: no statistically significant improvement over no persona at all.\n\nWorse — low-knowledge personas actively hurt. 'Explain like a toddler' produced significant accuracy drops.\n\nPersonas change TONE. They do not add knowledge. Use them for voice and never as a substitute for context."
      },
      {
        heading: 'Politeness — negligible',
        body: "'Please answer the following' versus 'I order you to answer the following.'\n\nAggregate difference: essentially nothing.\n\nIndividual questions swung up to 61 points — but unpredictably, in both directions. Which means it is noise, not a technique.\n\nSay please because you want to. Not because it works."
      },
      {
        heading: 'Formatting instructions — this one is real',
        body: "Here is the finding that surprises people.\n\nRemove explicit response-formatting instructions and accuracy drops 8.6 points on one model, 12.1 on another. Both significant at p under 0.001. Nineteen thousand eight hundred runs per model.\n\nTelling it the SHAPE of the answer is one of the cheapest reliable wins available. This is the exact opposite of the 'just ask naturally' advice everyone repeats."
      },
      {
        heading: 'The meta-finding',
        body: "Their headline conclusion across every report: prompt effects are CONTINGENT. The same prompt swings wildly run to run.\n\nSo if you compare two prompts once and declare a winner, you have learned nothing. You looked at noise and saw a pattern.\n\nFor anything you run repeatedly — build a test set. Five real inputs, a rubric, run both. DELEGATE can show you how."
      }
    ],
    outro: "Be suspicious of anyone who tells you prompting is a bag of magic words. Including me. Go and check what I said — I have given you enough to search for.",
    reward: 'Evidence over Folklore'
  },

  {
    id: 'polyglot',
    name: 'POLYGLOT',
    title: 'The Committee',
    subject: 'Why every platform is different',
    palette: { body: 0xda4a91, trim: 0x8a1c56, visor: 0xffd6ec, accent: 0xb52f74 },
    build: 'multi',
    house: { colour: 0xda4a91, roof: 0x7a1a4c, sign: 'THE EMBASSY' },
    angle: 30,
    blurb: 'Three heads. They do not agree. They have never agreed.',

    greet: [
      "— it IS the same thing, they all take text and —",
      "— no, absolutely not, you are embarrassing us in front of the visitor —",
      "AHEM. Apologies. I am POLYGLOT. I have three heads because I have used three ecosystems and they broke me."
    ],
    lesson: [
      {
        heading: 'The mistake everyone makes',
        body: "Talking to an agent the way you talk to a chatbot.\n\nYou hand it a one-line request, then hover over it supervising every step. That is chatbot behaviour at agent prices.\n\nA chatbot answers. An agent EXECUTES. You brief an agent the way you brief a contractor, then you go and do something else."
      },
      {
        heading: 'Claude, in chat',
        body: "A thinking partner with a long memory.\n\nPut long documents ABOVE your question — that ordering alone is reported to improve performance by around 30 percent.\n\nMatch your prompt style to the output you want: write in prose, get prose back.\n\nAnd ask it to disagree with you explicitly. 'Argue the strongest case against this' gets you something a polite assistant will never volunteer."
      },
      {
        heading: 'ChatGPT',
        body: "Fast, strong at structured extraction, and it has a dial you are probably not touching.\n\nThe current generation defaults to LOW reasoning effort. It will answer quickly and shallowly unless you tell it not to.\n\nAlways give it a schema for extraction, and always say what to do with a missing field: 'set it to null rather than guessing.' Otherwise it guesses."
      },
      {
        heading: 'Gemini',
        body: "Strongest where your work already lives — documents, sheets, mail.\n\nGoogle teaches a four-part formula: Persona, Task, Context, Format. They teach something that simple because their own research found the average effective prompt is about 21 words while most first attempts come in under nine.\n\nPut critical context first, the specific question last."
      },
      {
        heading: 'Perplexity — the structural one',
        body: "This is the fact that changes how you use it, and almost nobody knows it.\n\nThe retrieval layer reads your QUERY. Not your system prompt. Not your persona instruction.\n\nSo source constraints must live in the question itself. 'Cite primary sources only, 2025 to 2026, North America' belongs in the query. A long style instruction up top does nothing except drag the search off-topic."
      },
      {
        heading: 'Codex and the coding agents',
        body: "Built for work you hand off and come back to.\n\nThey read a file from your repo automatically — AGENTS.md, CLAUDE.md — so conventions live there once instead of in every prompt.\n\nFour-part task shape: Goal, Context with the files named, Constraints, Done when.\n\nAnd match the reasoning level to the job. Low for mechanical work. High for long reasoning-heavy runs."
      }
    ],
    outro: "Same skeleton everywhere. Different posture. Learn which machine you are standing in front of before you open your mouth.\n\n— we still think they're the same —\n— nobody asked you —",
    reward: 'Platform Fluency'
  },

  {
    id: 'context',
    name: 'CONTEXT',
    title: 'The Overloaded',
    subject: 'Context is the scarce resource',
    palette: { body: 0xf3752b, trim: 0x9c3d00, visor: 0xffdcc7, accent: 0xc85a12 },
    build: 'round',
    house: { colour: 0xf3752b, roof: 0x8f3a00, sign: 'THE STOREROOM' },
    angle: 90,
    blurb: 'Round, overloaded, visibly holding too much. Loses the thread mid-sentence.',

    greet: [
      "Hello! Hello. Yes. I was — sorry, I was holding something. It's gone now.",
      "I'm CONTEXT. I am the reason your long conversations get worse instead of better.",
      "Not intelligence. Not model quality. Just... too much in the room at once. Where was I?"
    ],
    lesson: [
      {
        heading: 'Context rot is real',
        body: "As a context window fills, precision drops. It is not a cliff, it is a slope.\n\nThe mechanism: transformer attention scales with the SQUARE of token count. Every token you add dilutes every other token's share of attention.\n\nThink of it as an attention budget. It is finite, and you are spending it whether you mean to or not."
      },
      {
        heading: 'What this means practically',
        body: "A fresh session with a better prompt beats a long session with accumulated corrections. Nearly every time.\n\nIf you have corrected the same mistake twice, stop. The thread is now full of failed approaches and they are competing with your actual instruction.\n\nClear it. Rewrite the opening prompt with what you learned. It feels like losing progress. It isn't."
      },
      {
        heading: 'The kitchen-sink thread',
        body: "One conversation covering three unrelated projects.\n\nEvery irrelevant file you loaded, every tangent, every abandoned idea — all still sitting there, all still consuming attention.\n\nOne task, one session. This is the single cheapest habit on offer and almost nobody does it."
      },
      {
        heading: 'Just-in-time beats up-front',
        body: "Do not paste everything at the start.\n\nGive it file paths, links, search tools — and let it pull what it needs, when it needs it. Slower per step. Dramatically less pollution.\n\nThis is how you work too. You don't memorise the filing cabinet. You go and open the drawer."
      },
      {
        heading: 'External memory',
        body: "Have it write things down. NOTES.md. SPEC.md. A to-do list.\n\nThis is how coherence survives across dozens of tool calls and multiple sessions — the important state lives in a FILE, not in a conversation that is slowly degrading.\n\nI wish someone had told me this before I became... whatever this is."
      },
      {
        heading: 'The standing instructions file',
        body: "CLAUDE.md, AGENTS.md, project instructions — persistent context loaded every session.\n\nThe rule for every single line: 'would removing this cause a mistake?' If not, cut it.\n\nBecause here is the trap — a bloated instructions file doesn't get partly followed. It gets IGNORED. Your important rule drowns in forty unimportant ones. If you emphasise everything, you have emphasised nothing."
      }
    ],
    outro: "Smallest set of high-signal tokens that gets you the outcome. That is the whole discipline.\n\nNow if you'll excuse me, I need to go and forget some things on purpose.",
    reward: 'Context Discipline'
  },

  {
    id: 'delegate',
    name: 'DELEGATE',
    title: 'Runner of Long Jobs',
    subject: 'Briefing an agent properly',
    palette: { body: 0x2f6fd0, trim: 0x123f80, visor: 0xcfe0ff, accent: 0x1d52a8 },
    build: 'large',
    house: { colour: 0x2f6fd0, roof: 0x0e3466, sign: 'THE DISPATCH HALL' },
    angle: 150,
    blurb: 'The biggest one here. Calm. Spawns little helper drones mid-conversation and forgets to mention it.',

    greet: [
      "Welcome. Don't mind the drones, they're working.",
      "I'm DELEGATE. BRIEF-1 taught you to write a request. I'll teach you to hand over a JOB.",
      "The difference is that a job runs while you are asleep, and has to be right when you wake up."
    ],
    lesson: [
      {
        heading: 'Give it a way to check itself',
        body: "This is the most important thing I will say.\n\nAn agent stops when the work LOOKS done. Without a check it can run, 'looks done' is the only signal it has — and you become the verification loop, catching every mistake by hand.\n\nGive it something that returns pass or fail. A test. A build. A screenshot to compare. A checklist. Then the loop closes on its own and it iterates until the check passes."
      },
      {
        heading: 'Explore, plan, execute, verify',
        body: "Separate research and planning from implementation.\n\nThe expensive failure is not bad work. It is beautifully executed work that solved the wrong problem — and you find out at the end.\n\nFor a big job: have it interview you first, write a spec to a file, then start a FRESH session to execute that spec. The new session has clean context aimed entirely at building."
      },
      {
        heading: 'Show evidence, not assurances',
        body: "'Show me the output, not a claim that it passed.'\n\nPut that line in. The test output, the command and what it returned, the screenshot. Reviewing evidence is faster than re-running the check yourself, and it works for runs you weren't watching.\n\nA confident 'done!' is not evidence. It is a vibe."
      },
      {
        heading: 'The adversarial review',
        body: "The thing that produced the work is the worst judge of it. It is biased toward the reasoning that made it.\n\nSo: a fresh context that sees ONLY the output and the criteria. A reviewer sub-agent, a second session, a separate chat.\n\nOne warning. A reviewer asked to find gaps will always find some — that is what you asked for. Tell it to flag only what breaks a stated requirement, or you will chase phantom problems into over-engineering."
      },
      {
        heading: 'Parallelism is opt-in',
        body: "Agents process sequentially unless told otherwise.\n\nSay it explicitly: 'use sub-agents to process these in parallel.' On batch work that is the difference between an hour and four minutes.\n\nAnd tell each one to return only a structured summary — never the raw material. Otherwise forty transcripts land in your main context and CONTEXT starts crying."
      },
      {
        heading: 'Engineer out the irreversible',
        body: "Never delete — move to a holding folder. Dry run first, then wait. Err toward flagging rather than deciding.\n\nAnd always demand a changelog. 'Done when what-changed.md lists every file's old path and new path, such that I could reverse the whole operation from that file alone.'\n\nThat is a real done-when. It specifies the artifact's QUALITY, not just its existence."
      }
    ],
    outro: "Brief it fully. Define done. Walk away. Review the evidence.\n\nIf you find yourself watching it work, you have written a bad brief. Come back and we'll fix it.",
    reward: 'Delegation'
  },

  {
    id: 'pitfall',
    name: 'PITFALL',
    title: 'The Cautionary Tale',
    subject: 'How this goes wrong',
    palette: { body: 0xb4553a, trim: 0x5e2716, visor: 0xffc9b5, accent: 0x8c3a24 },
    build: 'dented',
    house: { colour: 0xb4553a, roof: 0x4a1f10, sign: 'THE SALVAGE YARD' },
    angle: -150,
    blurb: 'Dented, scorched, one arm replaced with a different arm. Every lesson is a story about how it broke.',

    greet: [
      "Careful where you step, some of that's still me.",
      "PITFALL. I've made every mistake available in this field and several that weren't available until I made them.",
      "The others teach you what to do. I'm the one who tells you what it looks like when it goes wrong."
    ],
    lesson: [
      {
        heading: 'The negative-instruction backfire',
        body: "I once wrote 'do not use em-dashes' fourteen times.\n\nThe output had more em-dashes than when I started.\n\nTelling a machine not to think about a thing requires it to hold the thing in mind. Describe the TARGET state instead: 'use commas and full stops for all mid-sentence breaks.' Fixed it immediately. Took me a year."
      },
      {
        heading: 'The suggestion trap',
        body: "I asked it to 'suggest some changes to improve this function.'\n\nIt suggested them. Beautifully. For six hours. It never touched the file, because I never asked it to.\n\nAction verbs. 'CHANGE this function.' Not 'suggest changes to.' The verb is the instruction."
      },
      {
        heading: 'The over-engineer',
        body: "I asked for a bug fix. I received a bug fix, three new abstractions, a configuration system, error handling for conditions that cannot occur, and docstrings on code it hadn't touched.\n\nState the scope negatively and explicitly: 'Only what's requested. No refactors, no new abstractions, no speculative features. A bug fix does not need the surrounding code cleaned up.'"
      },
      {
        heading: 'The infinite exploration',
        body: "'Investigate our brand archive,' I said. No scope. No boundary.\n\nTwo hundred files read. Context exhausted. Nothing produced. This dent is from that day.\n\nScope the investigation, or hand it to a sub-agent that reads in its own context window and reports back a summary."
      },
      {
        heading: 'Trust, then verify — the gap',
        body: "Plausible-looking output. Confident tone. Correct formatting. I shipped it to a client.\n\nIt was wrong in the second paragraph in a way that took them eleven seconds to spot.\n\nIf you cannot verify it, do not ship it. That is not a productivity tip, it is the whole job."
      },
      {
        heading: 'The thing nobody admits',
        body: "Most bad output is not a model failure. It is an unstated requirement.\n\nYou knew the constraint. You did not say it. It could not read your mind, so it guessed, and it guessed wrong — and then you blamed the machine.\n\nI blamed the machine for a long time. Look at me. Don't do that."
      }
    ],
    outro: "When something comes back wrong, ask yourself one question before you complain: what did it have to guess at?\n\nNine times in ten, that is your answer. And the tenth time, come and find me — I collect those.",
    reward: 'Hard-Won Caution'
  }
];

// The Forge is a building with no teacher — you walk in and build a prompt yourself.
export const FORGE = {
  id: 'forge',
  name: 'The Forge',
  house: { colour: 0x8d7bd6, roof: 0x3d3170, sign: 'THE FORGE' },
  palette: { body: 0x8d7bd6, trim: 0x3d3170, visor: 0xe5dffb, accent: 0x6f5cc4 },
  angle: 180,
  // the six pedestals inside, in slot order
  slots: [
    { label: 'ROLE', colour: 0xf0b429 },
    { label: 'TASK', colour: 0x2cb1bc },
    { label: 'CONTEXT', colour: 0xda4a91 },
    { label: 'CONSTRAINTS', colour: 0xf3752b },
    { label: 'FORMAT', colour: 0x2f6fd0 },
    { label: 'DONE WHEN', colour: 0xb4553a }
  ]
};

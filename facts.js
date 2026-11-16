/* Useful Facts — lesson data.
   Topics follow the @explain Instagram carousel (Nov 7, 2026, p/DfdGsSdn7iM)
   about Ad Astra. Wording is original. Claims were checked against
   standard sources; overstatements from the post are flagged in `watch`. */
const LESSONS = [
  {
    id: "metacognition",
    title: "Metacognition",
    blurb: "Notice your own thinking, catch mistakes, and learn more effectively.",
    color: "sage",
    facts: [
      {
        t: "Thinking about your thinking",
        b: "Metacognition is the skill of noticing what you are doing with your mind: how you are approaching a problem, whether you actually understand it, and what to try next. The psychologist John Flavell popularized the term in the 1970s. It is less a talent you either have or don't have, and more a habit you can practice."
      },
      {
        t: "Plan, monitor, evaluate",
        b: "A simple loop works in class and in real life. Before you start, plan: what is the goal, and what method will I try? While you work, monitor: is this making sense, or am I stuck? Afterward, evaluate: what worked, and what would I change? That loop is the core of metacognition."
      },
      {
        t: "Testing yourself beats rereading",
        b: "Retrieval practice — closing the notes and trying to recall the idea — usually produces stronger long-term memory than reading the same page again. Rereading can feel easier, which is part of the trap: fluency is not the same as being able to use the idea later. Roediger and Karpicke's research is a well-known demonstration of this."
      },
      {
        t: "Space it out",
        b: "Spreading practice over days (spaced practice) beats cramming for what you still remember weeks later. Cramming can get you through tomorrow's quiz and then fade. A short review after some time has passed is more work in the moment and more useful later."
      },
      {
        t: "Explain it in your own words",
        b: "Self-explanation means pausing to say why an answer is right, or how a step follows from the last one. It exposes the gaps that skimming hides. If you cannot explain a step simply, you probably do not understand it yet."
      },
      {
        t: "After a mistake, ask better questions",
        b: "A useful post-mistake checklist: What did I assume? Where did the work actually go wrong? What would I try first next time? Blaming yourself or erasing the error quickly wastes the information the mistake contains."
      },
      {
        t: "Feeling like you know it can be misleading",
        b: "Material that looks familiar can feel mastered even when you cannot reproduce it. That is why looking at a highlighted textbook is comforting and why a blank page is a better test. If you want to know whether you know it, try to write it or use it without the notes."
      }
    ],
    quiz: [
      { q: "What is metacognition, in plain terms?", a: 1, o: ["Memorizing faster by repeating a list", "Noticing and managing your own thinking and learning", "A test that measures IQ", "Trusting the first idea that feels right"] },
      { q: "Which study habit usually builds longer-lasting memory?", a: 2, o: ["Rereading the chapter until it feels familiar", "Highlighting almost every sentence", "Closing the notes and trying to recall the ideas", "Studying only the night before"] },
      { q: "What does the plan–monitor–evaluate loop ask you to do while you work?", a: 0, o: ["Check whether your approach is actually making sense", "Copy a friend's method without thinking", "Ignore confusion until the end", "Race to finish before reviewing anything"] },
      { q: "Why can rereading feel more effective than it is?", a: 3, o: ["It changes your DNA", "Teachers cannot tell the difference", "Familiar text is harder to see", "Familiarity can be mistaken for real recall"] }
    ]
  },
  {
    id: "bias",
    title: "Cognitive bias",
    blurb: "Mental shortcuts shape thinking and can sometimes lead to poor decisions.",
    color: "blue",
    facts: [
      {
        t: "Shortcuts are useful — and sometimes wrong",
        b: "The brain uses heuristics: quick rules that usually work and save time. A cognitive bias is a systematic tilt those shortcuts can produce. Daniel Kahneman and Amos Tversky mapped many of these patterns. The goal is not to feel broken. It is to know when to slow down."
      },
      {
        t: "Confirmation bias",
        b: "We tend to notice, look for, and remember evidence that supports what we already believe, and to be tougher on evidence that does not. It shows up in news feeds, friendships, and lab work. A practical counter is to spend a minute looking for a way you could be wrong."
      },
      {
        t: "The availability heuristic",
        b: "People often judge how likely something is by how easily an example comes to mind. Dramatic plane crashes are memorable; ordinary car crashes are more common and, in total, far deadlier in the United States. Vivid stories can outweigh quieter base rates."
      },
      {
        t: "Anchoring",
        b: "The first number you hear can pull later estimates toward it, even when the first number is arbitrary. If a listing or a 'was' price is high, the next figure can feel like a bargain without being one. It helps to form your own estimate before you look at the offered number."
      },
      {
        t: "The sunk cost fallacy",
        b: "A sunk cost is time, money, or effort you cannot get back. The fallacy is continuing a plan mainly because of what you already spent, rather than because the future benefits still beat the future costs. Good decision-making looks forward."
      },
      {
        t: "Survivorship bias",
        b: "If you only study the winners, you miss the failures that had the same recipe. A famous example is Abraham Wald's World War II work: extra armor belongs where returning planes were not shot, because the planes hit there never came back to be counted. Advice based only on success stories is incomplete."
      },
      {
        t: "You cannot delete biases, but you can check them",
        b: "Slowing down, asking for the base rate ('how common is this, usually?'), and 'considering the opposite' all help. So does writing the reason for a choice before you hear someone else's number or opinion. Awareness is a tool, not a personality makeover."
      }
    ],
    quiz: [
      { q: "What is a cognitive bias?", a: 2, o: ["A random guess with no pattern", "Proof that someone is unintelligent", "A systematic tilt that mental shortcuts can produce", "A medical diagnosis you either have or do not"] },
      { q: "Confirmation bias is the tendency to:", a: 0, o: ["Favor information that supports what you already believe", "Always change your mind when a friend disagrees", "Remember only numbers, never stories", "Ignore every source that agrees with you"] },
      { q: "You keep paying for a bad project because you have already spent so much. That is closest to:", a: 1, o: ["The availability heuristic", "The sunk cost fallacy", "Anchoring on a sale price", "Survivorship bias"] },
      { q: "Why can news about plane crashes make flying feel more dangerous than it is, relative to driving?", a: 3, o: ["Planes are statistically the riskiest everyday transport in the U.S.", "Car crashes are rarely serious", "Anchoring always favors cars", "Memorable events are easier to recall than quieter, more common risks"] }
    ]
  },
  {
    id: "decisions",
    title: "Decision-making",
    blurb: "Compare choices, understand risk, and use a process you can trust.",
    color: "lavender",
    facts: [
      {
        t: "Judge the process, not just the outcome",
        b: "A careful choice can still go badly, and a careless one can get lucky. If you only praise or blame results, you learn the wrong lesson. Over time, a clear process — defining the goal, listing options, and weighing trade-offs — beats relying on gut luck."
      },
      {
        t: "Every yes is a no to something else",
        b: "Opportunity cost is the value of the next-best option you give up. Spending Saturday on one thing means you cannot spend that same Saturday on another. Good decisions name the trade-off instead of pretending a choice is free."
      },
      {
        t: "Reversible vs. hard-to-reverse",
        b: "Some decisions are easy to undo (a club, a weekend plan). Others are costly to reverse (a major loan, a public commitment). You can often decide the easy-to-undo ones quickly and spend more care on the ones that are hard to unwind. This is a practical rule, not a license to be reckless."
      },
      {
        t: "Try a premortem",
        b: "The psychologist Gary Klein popularized the premortem: imagine it is later, the plan has failed, and write down why. That little story helps people voice risks they would otherwise leave unspoken. It is cheaper than finding the same problems after you have already started."
      },
      {
        t: "Consider likelihood and size",
        b: "A rare disaster can still matter if the damage would be huge. A likely small upside might not. Expected value is the habit of considering both how probable an outcome is and how large it is, instead of reacting only to the scariest or most exciting picture."
      },
      {
        t: "Start with the base rate",
        b: "Before you update on a vivid story, ask how common this kind of thing usually is. If most similar projects run late, your plan should not assume it will be the exception without a reason. New evidence matters; it should not erase the background rate."
      },
      {
        t: "Compare options to a goal, not only to each other",
        b: "Two flawed choices can make each other look fine. It is better to ask: does this actually meet what I need? A 'deal' is not a good decision if it is the wrong thing. Write the standard first, then score the options against it."
      }
    ],
    quiz: [
      { q: "What is opportunity cost?", a: 1, o: ["A fee the bank charges for a transfer", "The value of the next-best option you give up", "The amount you have already spent", "A guaranteed profit"] },
      { q: "A premortem asks you to:", a: 2, o: ["Wait until after a failure to review it", "Ignore risks so you stay confident", "Imagine the plan has already failed and list why", "Choose the option with the best story"] },
      { q: "Why is it useful to separate reversible choices from hard-to-reverse ones?", a: 0, o: ["You can often decide easy-to-undo ones faster and take more care with costly ones", "Irreversible choices do not need thought", "All choices are equally easy to undo", "Reversible choices never matter"] },
      { q: "What does 'start with the base rate' mean?", a: 3, o: ["Always copy the most confident person", "Use only your personal story", "Ignore data from the past", "Begin with how common this kind of case usually is, then update"] }
    ]
  },
  {
    id: "money",
    title: "Financial education",
    blurb: "How money works, how to manage it, and how to make better financial choices.",
    color: "sage",
    facts: [
      {
        t: "Compound interest works both ways",
        b: "Compound interest is interest on the original amount and on interest already added. It can grow savings — and increase debt you do not pay off. A rough shortcut is the Rule of 72: dividing 72 by an annual percentage rate estimates how many years it takes for a sum to double. It is an approximation, not a promise."
      },
      {
        t: "Inflation quietly changes what money can buy",
        b: "Inflation is a general rise in prices. If prices go up and your money does not, you can buy less with the same number of dollars. That is why a paycheck or a pile of cash under a mattress can lose purchasing power over time, even if the number on the bill stays the same."
      },
      {
        t: "A simple budget is a map, not a punishment",
        b: "A budget tracks income and spending so you can see where money actually goes. A common approach is to cover needs first, then savings, then wants. You do not need a perfect app. You need a method you will actually look at."
      },
      {
        t: "Pay attention to credit card interest",
        b: "If you pay the full statement balance by the due date, you typically avoid interest on ordinary purchases. If you carry a balance, interest is charged on what you still owe, and the cost can grow quickly. The minimum payment keeps the account current; it is not the cheap way to clear the debt."
      },
      {
        t: "An emergency fund is a shock absorber",
        b: "An emergency fund is money set aside for unexpected necessary costs, like a repair or a gap in income. Many consumer guides suggest aiming, over time, for a few months of essential expenses in a safe, easy-to-reach account. The exact number depends on your situation; the point is not to be forced into high-interest debt at the worst moment."
      },
      {
        t: "Diversification is not putting everything in one basket",
        b: "Diversification means spreading money across different types of investments so that one failure hurts less. It does not eliminate risk, and it does not guarantee a gain. It is a way to avoid depending on a single company, tip, or stroke of luck."
      },
      {
        t: "High, guaranteed returns are a warning sign",
        b: "In the United States, payment history and how much you already owe are typically the biggest factors in a common credit-score model. More useful than chasing a number is paying on time and keeping credit-card balances low relative to their limits. And if someone promises a high return with little or no risk, treat that as a red flag, not an opportunity."
      }
    ],
    quiz: [
      { q: "What is compound interest?", a: 2, o: ["A one-time bonus a bank pays for opening an account", "A government tax on all savings", "Interest earned on both the original amount and interest already added", "A fee for using a credit card abroad"] },
      { q: "The Rule of 72 is used to roughly estimate:", a: 0, o: ["How many years it takes for money to double at a given annual rate", "Your exact credit score", "The inflation rate next year", "How much tax you will owe"] },
      { q: "On a typical credit card, what usually avoids interest on ordinary purchases?", a: 1, o: ["Paying only the minimum each month", "Paying the full statement balance by the due date", "Using the card as often as possible", "Carrying a balance so the bank likes you"] },
      { q: "Why does inflation matter even if the number printed on a dollar bill does not change?", a: 3, o: ["Inflation always raises your wages by the same amount", "Cash under a mattress is guaranteed to grow", "Prices cannot rise in the United States", "If prices rise, the same money buys less"] }
    ]
  },
  {
    id: "procrastination",
    title: "The science of procrastination",
    blurb: "Why we put things off, and what actually helps you start.",
    color: "blue",
    facts: [
      {
        t: "It is often about feelings, not just time",
        b: "Researchers such as Tim Pychyl and Fuschia Sirois describe procrastination as putting off a task despite expecting to be worse off for the delay. It is often a way to escape uncomfortable feelings — anxiety, boredom, frustration, or fear of doing badly — rather than a simple lack of a calendar. Calling it only 'laziness' usually misses the cause."
      },
      {
        t: "Now feels bigger than later",
        b: "Present bias (related to hyperbolic discounting) means rewards and relief right now get more weight than costs that arrive later. That is why scrolling can win against a paper due next week, and why the same paper suddenly feels urgent the night before. The task did not change as much as the delay did."
      },
      {
        t: "Motivation often rises as the deadline gets close",
        b: "Piers Steel's temporal motivation theory is a useful summary: motivation tends to go up when you expect to succeed and value the outcome, and to go down when you are impulsive or the reward is far away. That is a description of a pattern, not an excuse to wait. You can change the 'when' by making a start now."
      },
      {
        t: "If-then plans help",
        b: "Implementation intentions, studied by Peter Gollwitzer, are specific plans of the form 'If situation X happens, then I will do Y' — for example, 'If I sit down after dinner, then I will open the assignment and write the first sentence.' They work better than vague wishes to 'be more disciplined.'"
      },
      {
        t: "Shrink the first step",
        b: "A task that feels huge is easier to avoid. A two-minute start — open the file, write one sentence, put the tools on the table — lowers the emotional barrier. You can stop after the small step. People often continue once the worst part, starting, is over."
      },
      {
        t: "Perfectionism can feed delay",
        b: "If the only acceptable result is a perfect one, starting feels dangerous. A first draft that exists can be improved; a perfect draft that you never begin cannot. Giving yourself permission to do a rough version is a practical anti-procrastination tool, not a lowering of standards for the final work."
      },
      {
        t: "Watch out for oversimplified 'brain' stories",
        watch: "Popular posts sometimes say procrastination is simply your 'amygdala fighting your prefrontal cortex.' Brain areas are involved in emotion and planning, but that cartoon is not a complete scientific account. The more reliable, useful findings are about emotion avoidance, present bias, and tactics like if-then plans and smaller starts.",
        b: "You do not need a lab model of your brain to get unstuck. Name the feeling you are avoiding, make the next step tiny, and decide when and where you will start."
      }
    ],
    quiz: [
      { q: "Research on procrastination most often describes it as:", a: 1, o: ["Proof that someone does not care about the goal", "Delaying a task despite expecting to be worse off, often to avoid uncomfortable feelings", "A rare medical condition with one cause", "The same thing as a carefully planned break"] },
      { q: "Present bias helps explain why:", a: 2, o: ["Deadlines never affect anyone", "People always prefer long-term rewards", "Relief right now can outweigh a later cost", "Calendars do not work for anyone"] },
      { q: "An implementation intention is:", a: 0, o: ["A specific if-then plan for when and how you will act", "A promise to feel more motivated someday", "A punishment after you miss a deadline", "A personality test"] },
      { q: "Which statement is the more careful one?", a: 3, o: ["Procrastination is only laziness", "A simple amygdala-vs-prefrontal cartoon fully explains it", "You should wait for motivation before starting", "A tiny first step and an if-then plan are better supported than a one-line brain cartoon"] }
    ]
  },
  {
    id: "neuroplasticity",
    title: "Neuroplasticity",
    blurb: "The brain changes through learning, practice, and experience — within real limits.",
    color: "lavender",
    facts: [
      {
        t: "The brain can change with experience",
        b: "Neuroplasticity is the brain's ability to change its structure and function in response to experience. Connections between neurons can strengthen or weaken, and in some cases new connections form. This is how practice can make a skill smoother, and why unused patterns can fade."
      },
      {
        t: "Practice builds skill; hype oversells it",
        b: "Repeating a skill, getting feedback, and sleeping on it all help the change take hold. Sleep helps consolidate many kinds of memory and motor skill. What practice cannot do is 'rewire your whole brain overnight' or guarantee any result you want. Plasticity is real and limited."
      },
      {
        t: "Adults can still learn",
        b: "Some skills are easier to pick up at certain ages, and that is real. It is also real that adult brains remain plastic: you can still learn a language, an instrument, or a technical subject later than childhood. 'It is too late' is usually the overstatement, not the evidence."
      },
      {
        t: "Myth: you only use 10% of your brain",
        watch: "This popular claim is false. Imaging and clinical evidence show that much of the brain is active over the course of a day, and that damage to small areas can have large effects. The 10% story is a myth, not a hidden unlock code.",
        b: "Using a skill still matters — not because 90% of your brain is idle, but because practice changes the networks that support that skill."
      },
      {
        t: "Myth: you must be taught in your 'learning style'",
        watch: "The popular idea that each person has a visual, auditory, or kinesthetic learning style and must be taught that way is not supported by the evidence (a well-known review is Pashler and colleagues, 2008). People have preferences, but matching teaching to a preferred 'style' has not been shown to improve learning.",
        b: "It is still wise to use words, diagrams, and practice together when a topic needs them. That is about the material, not a fixed identity as a 'visual learner.'"
      },
      {
        t: "After injury, change is possible and not magic",
        b: "The brain can sometimes reorganize after injury, and rehabilitation can help. Outcomes vary, and there are limits. Stories of total, instant recovery make better headlines than typical cases. Hope and hard work both belong next to realistic medicine, not Instagram guarantees."
      },
      {
        t: "Feedback and sleep are part of the mechanism",
        b: "Practice with feedback tells the brain which patterns to keep. Sleep is when a lot of that consolidation happens. Pulling an all-nighter to 'lock in' a skill is usually working against the process you are trying to use."
      }
    ],
    quiz: [
      { q: "Neuroplasticity means:", a: 1, o: ["The brain is finished changing after age 10", "The brain can change its structure and function with experience", "You only use 10% of your brain", "Any skill can be mastered overnight"] },
      { q: "The claim that people use only 10% of their brain is:", a: 0, o: ["A myth; much of the brain is active, and small injuries can have large effects", "A proven fact from brain scans", "True for children but not adults", "The reason learning styles work"] },
      { q: "What does the evidence say about teaching to a visual/auditory/kinesthetic 'learning style'?", a: 3, o: ["It is the best-proven method in education", "Each person is born with only one style", "You should never use diagrams if you prefer words", "Preferences exist, but matching teaching to a preferred style has not been shown to improve learning"] },
      { q: "Which of these is a well-supported way to help a new skill stick?", a: 2, o: ["Skipping sleep so you can practice longer", "Avoiding all feedback so you stay confident", "Practice with feedback, then get enough sleep", "Waiting until you feel naturally talented"] }
    ]
  },
  {
    id: "epigenetics",
    title: "Epigenetics",
    blurb: "Lifestyle and environment can influence how genes are expressed — not rewrite your DNA sequence.",
    color: "sage",
    facts: [
      {
        t: "What epigenetics actually means",
        b: "Your DNA sequence is the text of the genome. Epigenetics refers to chemical marks and packaging — such as DNA methylation and histone modifications — that can turn gene activity up or down without changing that underlying sequence. A standard way to say it: the genes are the keys of a piano; epigenetic marks help decide which notes get played."
      },
      {
        t: "Lifestyle can influence gene activity",
        b: "Environment and behavior can affect gene expression. Smoking, diet, physical activity, some chemicals, and prolonged stress are among the factors researchers study. This is one reason identical twins, who start with nearly the same DNA sequence, can still differ in health and in which genes are active as they age."
      },
      {
        t: "Correction: this is not 'changing your genes'",
        watch: "The Instagram-style wording 'lifestyle can affect how our genes work' is easy to misread. Everyday habits do not rewrite your DNA sequence the way a mutation or gene-editing tool would. They can influence gene expression — which genes are more or less active. That is still important. It is not the same claim.",
        b: "If a post says 'you can change your genes by thinking positively' or 'eat this to rewrite your DNA,' it is overselling a real field."
      },
      {
        t: "Correction: 'you will rewrite your grandchildren's genes' is overstated",
        watch: "Some popular posts claim that your habits will reliably pass epigenetic changes to your grandchildren. Transgenerational epigenetic inheritance is better established in some animals. In humans, the evidence is limited and debated, and many epigenetic marks are reset between generations. It is not a simple 'you are what your grandparents ate' rule.",
        b: "Your choices still matter for your own health. That is a strong enough reason. You do not need an overstated inheritance story."
      },
      {
        t: "Why the field is still a big deal",
        b: "Epigenetic mechanisms are central to how cells with the same DNA become different tissues (a liver cell is not a neuron). They also matter in development, some diseases, and cancer research. The science is genuine. The problem is the gap between lab findings and wellness slogans."
      },
      {
        t: "This is not personal medical advice",
        b: "A lesson like this can explain a concept. It cannot tell you how to treat a condition, interpret a genetic test, or choose a supplement. For health decisions, a clinician and good evidence beat a carousel slide."
      }
    ],
    quiz: [
      { q: "Epigenetics is best described as:", a: 2, o: ["Permanently rewriting your DNA sequence with a good mood", "A proven way to pass any habit to your grandchildren", "Chemical marks that can change gene activity without changing the DNA sequence", "Proof that genes do not matter at all"] },
      { q: "Which statement is more accurate?", a: 0, o: ["Lifestyle and environment can influence gene expression; they do not typically rewrite the DNA sequence", "Eating one food will recode your genome in a week", "Identical twins never differ in gene activity", "Epigenetics means genes are a myth"] },
      { q: "Why is 'your habits will rewrite your grandchildren's genes' a shaky claim?", a: 1, o: ["Because epigenetics is not a real field", "Because human transgenerational epigenetic inheritance is limited and debated, and many marks are reset", "Because grandchildren do not have genes", "Because only exercise, not diet, could ever matter"] },
      { q: "Identical twins can still differ in health over time partly because:", a: 3, o: ["They have completely different DNA sequences", "Genes never interact with the environment", "Epigenetics has been debunked", "Gene expression can diverge even when the DNA sequence is nearly the same"] }
    ]
  },
  {
    id: "geopolitics",
    title: "Geopolitics",
    blurb: "How countries, power, money, resources, and events affect one another.",
    color: "blue",
    facts: [
      {
        t: "More than a map of armies",
        b: "Geopolitics is the study of how geography, resources, economics, and power shape relations among countries. Military force is one tool. Trade, alliances, technology, and public opinion are others. A useful habit is to ask: what does this place have, what does it need, and what could block the path between the two?"
      },
      {
        t: "Geography still matters",
        b: "Chokepoints are narrow passages that a lot of trade or energy has to move through. The Suez Canal, the Panama Canal, the Strait of Malacca, and the Strait of Hormuz are famous examples. A blockage or a conflict near one of them can raise prices and delays far from the site, because ships and oil cannot easily 'just go around' at the same cost."
      },
      {
        t: "Hard power and soft power",
        b: "Hard power is the ability to coerce — military force, sanctions, threats. Soft power, a term popularized by Joseph Nye, is the ability to attract or persuade through culture, values, and diplomacy. Most countries use a mix. Looking only at armies, or only at slogans, misses half of the picture."
      },
      {
        t: "Supply chains tie distant places together",
        b: "A laptop, a car, or a hospital drug may depend on minerals, factories, software, and shipping routes in several countries. A shock in one link — a factory shutdown, a tariff, a drought, a blocked canal — can show up as a shortage or a price spike somewhere else. Interdependence is a source of both prosperity and vulnerability."
      },
      {
        t: "Resources are a common thread",
        b: "Energy, water, food, and minerals show up again and again in cooperation and in conflict. That does not mean every event is 'only about oil.' It does mean that when you study a crisis, it is worth asking who supplies what, who needs what, and who controls the route."
      },
      {
        t: "News usually has more than one cause",
        b: "A headline may center on one leader or one incident. Underneath, you will often find longer-running interests, institutions, and constraints. It is fair to study people. It is incomplete to stop there. Try to name at least two forces at work, not just one villain or hero."
      },
      {
        t: "Maps can mislead",
        b: "The common Mercator map stretches land near the poles. Greenland looks comparable to Africa on many classroom walls; Africa's area is about 14 times larger. Projection is a design choice, not a photograph of the planet. When size or 'who is at the center' matters, check a more equal-area map."
      }
    ],
    quiz: [
      { q: "A chokepoint in geopolitics is:", a: 1, o: ["Any large desert", "A narrow passage that a lot of trade or energy must pass through", "A country's capital city", "A type of currency"] },
      { q: "Soft power is best described as:", a: 2, o: ["Only the use of military force", "A country's number of factories", "The ability to attract or persuade, for example through culture and diplomacy", "Printing as much money as possible"] },
      { q: "Why can a blocked canal raise prices in a country far away?", a: 0, o: ["Because supply chains and shipping routes connect distant markets", "Because every country uses the same currency", "Because maps cause inflation", "Because canals set income tax rates"] },
      { q: "On a typical Mercator world map, Greenland looks huge compared with Africa. What is the more accurate size relationship?", a: 3, o: ["They are about the same area", "Greenland is several times larger than Africa", "Neither landmass has a measurable area", "Africa's area is about 14 times larger than Greenland's"] }
    ]
  },
  {
    id: "thinking",
    title: "Thinking clearly",
    blurb: "Extra habits that travel with all of the topics above.",
    color: "lavender",
    extra: true,
    facts: [
      {
        t: "Correlation is not causation",
        b: "Two things can rise and fall together without one causing the other. Ice cream sales and drowning incidents both go up in summer; heat is a better explanation than ice cream causing drowning. Before you accept a cause, ask whether a third factor, reverse causation, or coincidence could explain the link."
      },
      {
        t: "Anecdotes are not a sample",
        b: "A vivid personal story can be true and still be a poor guide to what usually happens. One person who slept four hours and aced a test does not overturn broader evidence about sleep and performance. Ask how many cases, how they were chosen, and what we would have seen if the advice had failed."
      },
      {
        t: "Extraordinary claims need stronger evidence",
        b: "A modest claim ('this review method helped in a study of students') needs less proof than a sweeping one ('this trick will unlock your brain'). The more a claim would overturn, the more you should want clear, repeated evidence — not a single impressive slide."
      },
      {
        t: "Regression to the mean",
        b: "Extreme results often move closer to average the next time, just by chance. A team that had an unusually perfect month may look worse after a new ritual; a student who had an unusually bad test may improve after a lucky bracelet. The ritual might be doing nothing. Compare to a baseline, not only to the extreme moment."
      },
      {
        t: "Check the original source",
        b: "A carousel, a headline, or a friend can compress a finding until it is no longer true. When a claim matters, look for the school, the paper, the government report, or the dataset it came from. If no source shows up, treat the claim as unverified, not as a fact you just have not confirmed yet."
      },
      {
        t: "The Ad Astra list is a prompt, not a syllabus",
        watch: "The @explain post presents eight topics as things Elon Musk's school taught. Ad Astra (started in 2014 at SpaceX, with teacher Joshua Dahn) was real. Reporting supports project-based learning, ethics, geopolitics simulations, and a student currency. A fixed official syllabus of metacognition, epigenetics, neuroplasticity, and 'the science of procrastination' is not documented. The topics are still worth learning. The marketing frame is not the same as the historical record.",
        b: "Use the list as a set of useful subjects. Do not repeat the slide as proof of what the school officially taught."
      }
    ],
    quiz: [
      { q: "Why is 'correlation is not causation' useful?", a: 1, o: ["Because two things never rise at the same time", "Because a shared pattern does not, by itself, prove that one thing caused the other", "Because data never matter", "Because every correlation is fake"] },
      { q: "Regression to the mean means:", a: 2, o: ["Every skill gets worse with practice", "The average never changes", "Extreme results often move closer to average next time, even without a special cause", "Maps stretch countries near the poles"] },
      { q: "What is the careful takeaway about the Instagram Ad Astra list?", a: 0, o: ["The school was real, but the eight-topic syllabus is the post's framing, not a well-documented official curriculum", "The school never existed", "Every topic on the slides is a proven Ad Astra course", "Useful topics should be ignored if a post oversimplified them"] },
      { q: "When a bold claim has no source you can check, the careful move is to:", a: 3, o: ["Share it because it sounds smart", "Assume Instagram verified it", "Treat it as true until proven false", "Treat it as unverified until you can find a real source"] }
    ]
  }
];

const ABOUT = {
  post: "The site is based on a Nov 7, 2026 Instagram carousel from @explain (instagram.com/p/DfdGsSdn7iM/). The cover said Elon Musk created a private school to teach his children things other schools do not. The other slides introduced eight topics: financial education, metacognition, epigenetics, cognitive bias, the science of procrastination, neuroplasticity, decision-making, and geopolitics.",
  school: "Ad Astra was a real, small private school Musk started in 2014, later associated with teacher Joshua Dahn, at SpaceX in Hawthorne, California. It emphasized problem-solving, mixed ages, science, math, engineering, and ethics. Documented pieces include geopolitics and ethics simulations, coding, student businesses, and an in-house currency called the Astra.",
  caution: "The post's eight topics are a reasonable 'how to think' list, but they are not a documented official Ad Astra syllabus. Geopolitics, money, and decision-making have reported counterparts at the school. Formal courses in epigenetics, neuroplasticity, and 'the science of procrastination' are not supported by the public record. This site teaches the topics carefully and flags claims that go too far."
};

function allFacts() {
  const out = [];
  LESSONS.forEach(l => l.facts.forEach((f, i) => out.push({ lesson: l.id, title: l.title, i, ...f })));
  return out;
}
function allQuestions() {
  const out = [];
  LESSONS.forEach(l => l.quiz.forEach((q, i) => out.push({ lesson: l.id, title: l.title, i, ...q })));
  return out;
}
function shuffle(a) {
  const x = a.slice();
  for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; }
  return x;
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function advanceClickOk(el) {
  if (!el) return true;
  const tag = (el.tagName || "").toLowerCase();
  const disabled = !!(el.disabled || (typeof el.getAttribute === "function" && el.getAttribute("disabled") != null));
  if (tag === "button" || tag === "input" || tag === "textarea" || tag === "select" || tag === "label") return disabled;
  if (tag === "a") return false;
  return true;
}

const Facts = { LESSONS, ABOUT, allFacts, allQuestions, shuffle, esc, advanceClickOk };
if (typeof module !== "undefined") module.exports = Facts;
else window.Facts = Facts;

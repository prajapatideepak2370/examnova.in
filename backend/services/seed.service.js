import env from '../config/env.js';
import Admin from '../models/Admin.js';
import Category from '../models/Category.js';
import Document from '../models/Document.js';
import Question from '../models/Question.js';
import { buildSimplePdf } from '../utils/samplePdf.js';
import { saveBuffer, removeFile } from './storage.service.js';

export const CATEGORY_SEED = [
  {
    name: 'General Knowledge',
    slug: 'general-knowledge',
    icon: 'gk',
    description: 'History, geography, polity, economy and static GK notes for every government exam.',
    order: 1,
  },
  {
    name: 'Mathematics',
    slug: 'mathematics',
    icon: 'math',
    description: 'Quantitative aptitude notes, shortcuts and practice sets for SSC, Bank and Railway exams.',
    order: 2,
  },
  {
    name: 'Current Affairs',
    slug: 'current-affairs',
    icon: 'current-affairs',
    description: 'Daily, weekly and monthly current affairs digests with exam-oriented MCQs.',
    order: 3,
  },
  {
    name: 'Reasoning',
    slug: 'reasoning',
    icon: 'reasoning',
    description: 'Verbal and non-verbal reasoning techniques with solved examples.',
    order: 4,
  },
  {
    name: 'General Science',
    slug: 'general-science',
    icon: 'science',
    description: 'Physics, chemistry and biology fundamentals asked in competitive examinations.',
    order: 5,
  },
  {
    name: 'English',
    slug: 'english',
    icon: 'english',
    description: 'Grammar, vocabulary, comprehension and error-spotting practice material.',
    order: 6,
  },
  {
    name: 'Hindi',
    slug: 'hindi',
    icon: 'hindi',
    description: 'Hindi vyakaran, gadyansh and official-language preparation material.',
    order: 7,
  },
  {
    name: 'Government Exam Preparation',
    slug: 'government-exam-preparation',
    icon: 'preparation',
    description: 'Exam-wise syllabus, study plans and strategy guides for all major recruitment exams.',
    order: 8,
  },
  {
    name: 'Previous Year Question Papers',
    slug: 'previous-year-question-papers',
    icon: 'papers',
    description: 'Solved previous year question papers with detailed answer keys.',
    order: 9,
  },
  {
    name: 'Mock Tests',
    slug: 'mock-tests',
    icon: 'mock-tests',
    description: 'Full-length and sectional mock tests with solutions and time management tips.',
    order: 10,
  },
];

const DOCUMENT_SEED = [
  {
    title: 'Indian Polity Complete Notes',
    categorySlug: 'general-knowledge',
    subject: 'Indian Polity',
    examination: 'UPSC CSE',
    description:
      'Comprehensive notes on the Constitution of India covering the Preamble, fundamental rights, directive principles, union and state executive, judiciary and constitutional amendments.',
    tags: ['polity', 'constitution', 'upsc', 'static gk'],
    viewCount: 1284,
    content: [
      '1. The Constitution of India was adopted by the Constituent Assembly on 26 November 1949 and came into force on 26 January 1950.',
      '2. The Preamble declares India to be a Sovereign, Socialist, Secular, Democratic Republic and secures Justice, Liberty, Equality and Fraternity for all citizens.',
      '3. Fundamental Rights are contained in Part III (Articles 12 to 35) and are enforceable through writs issued under Article 32.',
      '4. The Directive Principles of State Policy in Part IV are non-justiciable guidelines for governance and aim at a welfare state.',
      '5. The Fundamental Duties were inserted by the 42nd Amendment Act, 1976 on the recommendation of the Swaran Singh Committee.',
      '6. Article 368 lays down the procedure for amendment of the Constitution, with some provisions requiring ratification by half of the State Legislatures.',
      '7. The Union Executive comprises the President, the Vice-President, the Council of Ministers and the Attorney General of India.',
      '8. The President is elected indirectly by an electoral college and holds office for a term of five years.',
      '9. The Supreme Court is the apex court and its decisions are binding on all courts within the territory of India.',
      '10. The Comptroller and Auditor General, the Election Commission and the Union Public Service Commission are constitutional bodies.',
      '11. Emergency provisions are contained in Articles 352 (national), 356 (President\'s rule) and 360 (financial emergency).',
      '12. The 73rd and 74th Amendment Acts, 1992 gave constitutional status to Panchayati Raj institutions and urban local bodies.',
    ],
  },
  {
    title: 'Quantitative Aptitude: Percentage and Profit-Loss',
    categorySlug: 'mathematics',
    subject: 'Arithmetic',
    examination: 'SSC CGL',
    description:
      'Concept building, formula sheet, shortcut tricks and solved examples on percentage, profit, loss and discount for SSC and Bank examinations.',
    tags: ['percentage', 'profit and loss', 'arithmetic', 'ssc cgl'],
    viewCount: 972,
    content: [
      '1. Percentage means "per hundred". To convert a fraction into a percentage, multiply it by 100 and add the % symbol.',
      '2. If a value increases by x%, the new value = original value x (100 + x)/100.',
      '3. Successive percentage changes are not additive: a 10% increase followed by a 20% increase gives a net change of 32%.',
      '4. Cost Price (CP) is the price at which an article is purchased; Selling Price (SP) is the price at which it is sold.',
      '5. Profit = SP - CP and Profit % = (Profit / CP) x 100 (always calculated on Cost Price).',
      '6. Loss % = (Loss / CP) x 100. Gain percent can never be calculated on the Selling Price.',
      '7. When a shopkeeper sells two articles at the same price, one at a gain of x% and the other at a loss of x%, he always suffers a loss of x^2/100 percent.',
      '8. Discount is always calculated on the Marked Price (MP), while profit or loss is calculated on the Cost Price.',
      '9. SP = MP x (100 - Discount%)/100.',
      '10. If the CP of m articles equals the SP of n articles, then gain% = ((m - n)/n) x 100.',
      '11. Worked example: An article bought for Rs. 800 is sold for Rs. 920. Profit = Rs. 120, so Profit% = 120/800 x 100 = 15%.',
      '12. Worked example: The marked price is Rs. 1,500 with a 20% discount. SP = 1500 x 0.80 = Rs. 1,200.',
      'Practice: attempt at least 40 questions per topic and maintain an error log of every question attempted incorrectly.',
    ],
  },
  {
    title: 'Monthly Current Affairs Digest',
    categorySlug: 'current-affairs',
    subject: 'Current Affairs',
    examination: 'IBPS PO',
    description:
      'Month-wise compilation of important national and international events, schemes, appointments, awards and sports updates asked in banking and SSC exams.',
    tags: ['current affairs', 'monthly digest', 'banking', 'schemes'],
    viewCount: 1541,
    content: [
      '1. Government Schemes: keep track of newly launched central schemes, their nodal ministries, beneficiaries and budget allocation.',
      '2. Economy: repo rate and monetary policy decisions of the Reserve Bank of India are asked in almost every banking examination.',
      '3. Indexes and Reports: NITI Aayog SDG Index, Global Hunger Index, Ease of Doing Business and similar reports form recurring questions.',
      '4. Appointments: current holders of constitutional posts, chief ministers, governors and heads of financial institutions.',
      '5. Awards and Honours: Bharat Ratna, Padma Awards, Nobel Prizes, Gyanpeeth and sports awards with their recipients.',
      '6. International: important summits (G20, BRICS, SCO, QUAD), bilateral agreements and India\'s position on global issues.',
      '7. Defence: new inductions, exercises and defence agreements signed during the month.',
      '8. Sports: national and international championships, medal winners and tournament hosts.',
      '9. Science and Technology: ISRO and DRDO missions, new vaccines and emerging technologies.',
      '10. States in news: new state schemes, capitals and flagship infrastructure projects.',
      'Revision tip: revise the previous two months before every mock test and note down repeated themes.',
    ],
  },
  {
    title: 'Reasoning Ability Practice Set with Solutions',
    categorySlug: 'reasoning',
    subject: 'Logical Reasoning',
    examination: 'RRB NTPC',
    description:
      'Fully solved practice set covering series completion, coding-decoding, blood relations, direction sense, syllogism and seating arrangement.',
    tags: ['reasoning', 'series', 'syllogism', 'practice set'],
    viewCount: 638,
    content: [
      '1. Number series: look for differences, ratios or squares and cubes of natural numbers before assuming a complex pattern.',
      '2. Letter series: convert letters to their alphabet positions and check for arithmetic shifts.',
      '3. Coding-decoding: identify whether the code uses position shifting, reversing or a keyword substitution.',
      '4. Blood relations: draw a family tree and always use a single notation for each gender while solving.',
      '5. Direction sense: sketch the path and remember that a right turn from the south faces west.',
      '6. Syllogism: use Venn diagrams and apply the standard "all, some, no" rules without assuming outside knowledge.',
      '7. Seating arrangement: start with the most definite statement and treat each negative clue as a filter.',
      '8. Analogy: determine the exact relationship (part-whole, cause-effect, worker-tool) before choosing the option.',
      '9. Odd-one-out: evaluate each option against all others rather than stopping at the first mismatch.',
      '10. Ranking and order: total = (rank from top + rank from bottom) - 1.',
      '11. Clock and calendar problems: the minute hand gains 5.5 degrees per minute over the hour hand.',
      '12. Puzzle solving: allocate a fixed time per puzzle in the exam and move on if it exceeds the limit.',
    ],
  },
  {
    title: 'General Science Capsule for SSC Exams',
    categorySlug: 'general-science',
    subject: 'General Science',
    examination: 'SSC CHSL',
    description:
      'High-yield physics, chemistry and biology facts with one-line explanations, revised for objective-type competitive examinations.',
    tags: ['science', 'physics', 'chemistry', 'biology'],
    viewCount: 486,
    content: [
      '1. The SI unit of force is the newton and that of power is the watt.',
      '2. Light travels fastest in vacuum at approximately 3 x 10^8 metres per second.',
      '3. The chemical formula of common salt is NaCl; its chemical name is sodium chloride.',
      '4. pH value below 7 indicates an acidic solution; above 7 indicates a basic solution.',
      '5. Deficiency of vitamin A causes night blindness and deficiency of iron causes anaemia.',
      '6. The normal pH of human blood is maintained between 7.35 and 7.45.',
      '7. The powerhouse of the cell is the mitochondrion and the site of protein synthesis is the ribosome.',
      '8. Newton\'s first law of motion is also called the law of inertia.',
      '9. The hardest naturally occurring substance is diamond, an allotrope of carbon.',
      '10. Insulin, which regulates blood sugar, is secreted by the beta cells of the pancreas.',
      '11. Sound cannot travel through vacuum because it requires a material medium.',
      '12. LPG used for domestic cooking is a mixture of propane and butane.',
    ],
  },
  {
    title: 'English Grammar and Error Spotting Guide',
    categorySlug: 'english',
    subject: 'English Language',
    examination: 'IBPS PO',
    description:
      'Rules of subject-verb agreement, tenses, articles, prepositions and common error patterns with 100 corrected sentences.',
    tags: ['english', 'grammar', 'error spotting', 'banking'],
    viewCount: 721,
    content: [
      '1. Subject-verb agreement: a singular subject takes a singular verb, and phrases between them do not change the number.',
      '2. Collective nouns take a singular verb when the group acts as a single unit.',
      '3. In conditional sentences, use "if + simple present" with "will + base verb" (first conditional).',
      '4. Prepositions: "since" is used with a point of time and "for" with a duration.',
      '5. Articles: "an" precedes a vowel sound, not merely a vowel letter, as in "an hour" and "a university".',
      '6. "One of the" is always followed by a plural noun and a singular verb.',
      '7. Comparative adjectives take "than", while superlatives take "of" or "in".',
      '8. Non-gradable adjectives such as perfect, unique and complete are not used with "more" or "most".',
      '9. Correlative conjunctions (not only ... but also, either ... or) must keep parallel structure.',
      '10. In reported speech, the tense of the reporting verb decides the tense of the reported clause.',
      '11. Commonly confused pairs: affect/effect, principal/principle, advice/advise, stationary/stationery.',
      '12. Reading comprehension: read the questions first so that the passage can be scanned purposefully.',
    ],
  },
  {
    title: 'Hindi Vyakaran aur Samanya Gyan',
    categorySlug: 'hindi',
    subject: 'Hindi Language',
    examination: 'State PSC',
    description:
      'Hindi grammar, sandhi, samas, muhavare and official-language notes prepared for state public service examinations.',
    tags: ['hindi', 'vyakaran', 'muhavare', 'state psc'],
    viewCount: 342,
    content: [
      '1. Sandhi ke mukhya prakar: swar sandhi, vyanjan sandhi aur visarga sandhi.',
      '2. Samas ke bhed: tatpurush, karmadharaya, dvigu, dvandva, bahuvrihi aur avyayibhav.',
      '3. Upsarg shabd ke aarambh mein lagta hai, pratyay shabd ke ant mein.',
      '4. Paryayvachi shabd aur vilom shabd objective prashnon mein sabse adhik pooche jaate hain.',
      '5. Muhavare aur lokoktiyan vaakya mein prayog ke saath yaad karein.',
      '6. Shabd shuddhi par dhyan dein kyunki ashuddh shabd nirdharit prashnon mein baar-baar aate hain.',
      '7. Vakya shuddhi ke liye ling, vachan, kaal aur karak ka mel hona zaroori hai.',
      '8. Ras, chhand aur alankar Hindi sahitya ke mahatvapurna ansh hain.',
      '9. Apathit gadyansh mein uttar poore prashn ko padhkar likhna chahiye.',
      '10. Abhyas ke liye pratyek din ek gadyansh aur ek shabd shuddhi set hal karein.',
    ],
  },
  {
    title: 'SSC CGL Syllabus and 90-Day Study Plan',
    categorySlug: 'government-exam-preparation',
    subject: 'Exam Strategy',
    examination: 'SSC CGL',
    description:
      'Tier-wise syllabus, weightage analysis, preparation strategy and a day-wise 90-day timetable for the SSC CGL examination.',
    tags: ['ssc cgl', 'study plan', 'strategy', 'syllabus'],
    viewCount: 1108,
    content: [
      '1. Tier I is a computer-based objective test with sections on General Intelligence, General Awareness, Quantitative Aptitude and English Comprehension.',
      '2. Tier II consists of separate modules with session-wise time limits; accuracy matters more than brute-force attempts.',
      '3. Allocate roughly 40% of daily study time to Quantitative Aptitude and Reasoning as they carry the highest marks per minute.',
      '4. Devote one hour every day to current affairs and revise the monthly capsule before each mock test.',
      '5. Take one full-length mock test every alternate day and analyse every mistake within 24 hours.',
      '6. Maintain separate notebooks for formulas, vocabulary and recurring current affairs themes.',
      '7. Week 1 to 4: build concepts. Week 5 to 8: sectional practice. Week 9 to 12: full-length mocks and revision.',
      '8. Do not start a new topic in the last two weeks; consolidate revision and improve speed instead.',
      '9. Track attempts, accuracy and time per section in a simple spreadsheet to identify weak areas objectively.',
      '10. Sleep for at least seven hours; exam performance drops sharply with accumulated fatigue.',
    ],
  },
  {
    title: 'SSC CGL Previous Year Question Paper (Solved)',
    categorySlug: 'previous-year-question-papers',
    subject: 'Mixed',
    examination: 'SSC CGL',
    description:
      'Original previous year question paper with the official answer key and topic-wise explanation of every question.',
    tags: ['previous year', 'solved paper', 'ssc cgl', 'answer key'],
    viewCount: 1893,
    content: [
      'Q1. Which Article of the Constitution provides for the establishment of the Supreme Court? (Answer: Article 124)',
      'Q2. If the simple interest on Rs. 5,000 for 3 years is Rs. 900, the annual rate of interest is: (Answer: 6% per annum)',
      'Q3. Choose the correctly spelt word: (Answer: Occurrence)',
      'Q4. Select the related word: Doctor : Hospital :: Teacher : ? (Answer: School)',
      'Q5. The chemical name of baking soda is: (Answer: Sodium bicarbonate)',
      'Q6. Who was the first Governor-General of independent India? (Answer: Lord Mountbatten)',
      'Q7. A train 240 m long crosses a pole in 12 seconds. Its speed is: (Answer: 72 km/h)',
      'Q8. Find the odd one out: meter, liter, kilogram, second. (Answer: liter - a unit of volume, the others are SI base units)',
      'Q9. The average of the first ten natural numbers is: (Answer: 5.5)',
      'Q10. Idiom: "to bell the cat" means: (Answer: to undertake a risky task)',
      'Q11. Which state has the longest coastline in India? (Answer: Gujarat)',
      'Q12. The value of 15% of 60% of 500 is: (Answer: 45)',
    ],
  },
  {
    title: 'Bank PO Full-Length Mock Test 01',
    categorySlug: 'mock-tests',
    subject: 'Mixed',
    examination: 'IBPS PO',
    description:
      'Full-length preliminary mock test with 100 questions across English, Quantitative Aptitude and Reasoning, followed by detailed solutions.',
    tags: ['mock test', 'bank po', 'prelims', 'solutions'],
    viewCount: 845,
    content: [
      'Instructions: The test contains 100 questions divided into three sections with a composite time limit of one hour.',
      'Section 1 - English Language (30 questions, 30 minutes recommended).',
      'Section 2 - Quantitative Aptitude (35 questions, 20 minutes recommended).',
      'Section 3 - Reasoning Ability (35 questions, 20 minutes recommended).',
      'Q1. A sum doubles in 8 years at simple interest. In how many years will it become four times? (Answer: 24 years)',
      'Q2. Choose the word most nearly opposite in meaning to "candid". (Answer: evasive)',
      'Q3. Five friends sit in a row; if A is third from the left and B is second from the right, who sits in the middle? (Answer: A)',
      'Q4. The ratio of two numbers is 3:4 and their LCM is 84. The larger number is: (Answer: 28)',
      'Q5. Statement: All pens are books. Some books are tables. Conclusion: Some pens are tables. (Answer: does not follow)',
      'Q6. A shopkeeper marks his goods 40% above cost and allows a 25% discount. His profit percentage is: (Answer: 5%)',
      'Q7. Fill in the blank: The committee ___ divided in its opinion. (Answer: was)',
      'Q8. Find the next term: 7, 14, 28, 56, ? (Answer: 112)',
      'Score interpretation: 60+ correct is a safe qualifying range in most preliminary examinations.',
    ],
  },
  {
    title: 'Indian Geography and Economy Revision Capsule',
    categorySlug: 'general-knowledge',
    subject: 'Indian Geography',
    examination: 'UPSC CSE',
    description:
      'Rivers, soils, climate, minerals, agriculture and the core concepts of the Indian economy presented as a rapid revision capsule.',
    tags: ['geography', 'economy', 'revision', 'upsc'],
    viewCount: 566,
    content: [
      '1. The Himalayas are divided into the Trans-Himalaya, Greater Himalaya, Lesser Himalaya and Shivalik ranges from north to south.',
      '2. The Ganga, Brahmaputra and Indus are the three major Himalayan river systems of India.',
      '3. Peninsular rivers such as the Godavari and Krishna are rain-fed and have reached maturity, so they flow in shallow valleys.',
      '4. Black cotton soil, also called regur, is formed from the weathering of basaltic lava and retains moisture well.',
      '5. The southwest monsoon arrives over Kerala around the first week of June and retreats from the northwest by December.',
      '6. India accounts for a significant share of global spice and pulse production.',
      '7. Gross Domestic Product measures the market value of all final goods and services produced within a country in a year.',
      '8. Fiscal deficit is the excess of total expenditure over total receipts excluding borrowings.',
      '9. The Reserve Bank of India conducts monetary policy and targets inflation within a flexible band.',
      '10. Direct taxes include income tax and corporate tax; indirect taxes are levied on goods and services.',
      '11. Five-Year Plans were replaced by the NITI Aayog, which focuses on cooperative and competitive federalism.',
      '12. Financial inclusion schemes aim to bring unbanked households into the formal banking system.',
    ],
  },
];

const QUESTION_SEED = [
  {
    subject: 'General Knowledge',
    topic: 'Indian History',
    examination: 'SSC CGL',
    difficulty: 'easy',
    questionText: 'Who presided over the first session of the Indian National Congress in 1885?',
    options: ['Dadabhai Naoroji', 'W. C. Bonnerjee', 'A. O. Hume', 'Surendranath Banerjee'],
    correctAnswer: 1,
    explanation:
      'The first session of the Indian National Congress was held at Bombay in December 1885 with Womesh Chandra Bonnerjee as its president.',
  },
  {
    subject: 'General Knowledge',
    topic: 'Indian Polity',
    examination: 'UPSC CSE',
    difficulty: 'medium',
    questionText: 'Which Article of the Constitution of India deals with the Right to Constitutional Remedies?',
    options: ['Article 19', 'Article 21', 'Article 32', 'Article 44'],
    correctAnswer: 2,
    explanation:
      'Article 32 empowers a citizen to move the Supreme Court directly for the enforcement of Fundamental Rights. It is called the heart and soul of the Constitution.',
  },
  {
    subject: 'General Knowledge',
    topic: 'Indian Geography',
    examination: 'RRB NTPC',
    difficulty: 'easy',
    questionText: 'Which Indian state has the longest coastline?',
    options: ['Tamil Nadu', 'Andhra Pradesh', 'Gujarat', 'Maharashtra'],
    correctAnswer: 2,
    explanation: 'Gujarat has the longest coastline among Indian states, followed by Andhra Pradesh and Tamil Nadu.',
  },
  {
    subject: 'General Knowledge',
    topic: 'Static GK',
    examination: 'IBPS PO',
    difficulty: 'medium',
    questionText: 'The headquarters of the Reserve Bank of India is located in:',
    options: ['New Delhi', 'Mumbai', 'Kolkata', 'Chennai'],
    correctAnswer: 1,
    explanation: 'The Reserve Bank of India was established in 1935 in Kolkata but its headquarters was shifted to Mumbai in 1937.',
  },
  {
    subject: 'General Science',
    topic: 'Physics',
    examination: 'SSC CHSL',
    difficulty: 'easy',
    questionText: 'The SI unit of power is:',
    options: ['Joule', 'Newton', 'Watt', 'Pascal'],
    correctAnswer: 2,
    explanation: 'Power is the rate of doing work and its SI unit is the watt, where one watt equals one joule per second.',
  },
  {
    subject: 'General Science',
    topic: 'Chemistry',
    examination: 'SSC CGL',
    difficulty: 'medium',
    questionText: 'What is the pH value of a neutral solution at 25 degrees Celsius?',
    options: ['0', '7', '10', '14'],
    correctAnswer: 1,
    explanation: 'A neutral solution has equal hydrogen and hydroxide ion concentrations, giving a pH of 7 at 25 degrees Celsius.',
  },
  {
    subject: 'Mathematics',
    topic: 'Profit and Loss',
    examination: 'SSC CGL',
    difficulty: 'medium',
    questionText: 'An article bought for Rs. 800 is sold for Rs. 920. What is the profit percentage?',
    options: ['12%', '15%', '18%', '20%'],
    correctAnswer: 1,
    explanation: 'Profit = 920 - 800 = Rs. 120. Profit% = (120 / 800) x 100 = 15%.',
  },
  {
    subject: 'Mathematics',
    topic: 'Simple Interest',
    examination: 'IBPS PO',
    difficulty: 'easy',
    questionText: 'Find the simple interest on Rs. 5,000 at 8% per annum for 3 years.',
    options: ['Rs. 1,000', 'Rs. 1,200', 'Rs. 1,400', 'Rs. 1,500'],
    correctAnswer: 1,
    explanation: 'SI = (P x R x T) / 100 = (5000 x 8 x 3) / 100 = Rs. 1,200.',
  },
  {
    subject: 'Mathematics',
    topic: 'Average',
    examination: 'RRB NTPC',
    difficulty: 'easy',
    questionText: 'What is the average of the first ten natural numbers?',
    options: ['5', '5.5', '6', '6.5'],
    correctAnswer: 1,
    explanation: 'Sum of the first ten natural numbers is 55, so the average is 55 / 10 = 5.5.',
  },
  {
    subject: 'Mathematics',
    topic: 'Time and Distance',
    examination: 'SSC CGL',
    difficulty: 'hard',
    questionText: 'A train 240 m long crosses a pole in 12 seconds. What is its speed?',
    options: ['18 m/s', '20 m/s', '22 m/s', '24 m/s'],
    correctAnswer: 1,
    explanation: 'Speed = 240 / 12 = 20 m/s, which equals 20 x 18/5 = 72 km/h.',
  },
  {
    subject: 'Reasoning',
    topic: 'Series',
    examination: 'IBPS PO',
    difficulty: 'easy',
    questionText: 'Complete the series: 7, 14, 28, 56, ?',
    options: ['84', '98', '112', '126'],
    correctAnswer: 2,
    explanation: 'Each term is double the previous term, so 56 x 2 = 112.',
  },
  {
    subject: 'Reasoning',
    topic: 'Direction Sense',
    examination: 'RRB NTPC',
    difficulty: 'medium',
    questionText: 'A man walks 5 km north, turns right and walks 3 km, then turns right again and walks 5 km. How far is he from his starting point?',
    options: ['3 km', '5 km', '8 km', '13 km'],
    correctAnswer: 0,
    explanation: 'He ends up 3 km east of his starting point, so the distance from the start is 3 km.',
  },
  {
    subject: 'Reasoning',
    topic: 'Blood Relations',
    examination: 'SSC CHSL',
    difficulty: 'medium',
    questionText: 'Pointing to a photograph, a man said, "She is the daughter of my grandfather\'s only son." How is the girl related to him?',
    options: ['Cousin', 'Sister', 'Mother', 'Aunt'],
    correctAnswer: 1,
    explanation: 'My grandfather\'s only son is my father, so the girl is my father\'s daughter - my sister.',
  },
  {
    subject: 'English',
    topic: 'Grammar',
    examination: 'IBPS PO',
    difficulty: 'medium',
    questionText: 'Choose the correct sentence.',
    options: [
      'One of my friend is a doctor.',
      'One of my friends is a doctor.',
      'One of my friends are a doctor.',
      'One of my friend are a doctor.',
    ],
    correctAnswer: 1,
    explanation: '"One of" is followed by a plural noun and a singular verb, so "One of my friends is a doctor" is correct.',
  },
  {
    subject: 'English',
    topic: 'Vocabulary',
    examination: 'SSC CGL',
    difficulty: 'easy',
    questionText: 'Choose the word most nearly opposite in meaning to "candid".',
    options: ['Frank', 'Evasive', 'Honest', 'Blunt'],
    correctAnswer: 1,
    explanation: 'Candid means straightforward and honest, so its antonym is evasive.',
  },
  {
    subject: 'English',
    topic: 'Idioms',
    examination: 'SSC CGL',
    difficulty: 'medium',
    questionText: 'The idiom "to bell the cat" means:',
    options: [
      'To praise someone falsely',
      'To undertake a risky task',
      'To avoid responsibility',
      'To make a lot of noise',
    ],
    correctAnswer: 1,
    explanation: 'The idiom refers to facing danger and taking the initiative to do a difficult or risky task.',
  },
  {
    subject: 'Hindi',
    topic: 'Vyakaran',
    examination: 'State PSC',
    difficulty: 'medium',
    questionText: '"Nirmal" shabd mein kaun sa upsarg hai?',
    options: ['Nir', 'Nirm', 'Mal', 'Ni'],
    correctAnswer: 0,
    explanation: '"Nir" ek upsarg hai jiska arth "rahit" hota hai; isliye nirmal ka arth "mal rahit" ya saaf hai.',
  },
  {
    subject: 'Hindi',
    topic: 'Muhavare',
    examination: 'State PSC',
    difficulty: 'easy',
    questionText: '"Aankh ka tara" muhavare ka arth kya hai?',
    options: ['Bahut pyara', 'Andha hona', 'Krodhit hona', 'Nirash hona'],
    correctAnswer: 0,
    explanation: '"Aankh ka tara" ka arth hai atyant priya vyakti ya vastu.',
  },
  {
    subject: 'Current Affairs',
    topic: 'Economy',
    examination: 'IBPS PO',
    difficulty: 'medium',
    questionText: 'Which institution conducts the monetary policy of India?',
    options: ['Ministry of Finance', 'NITI Aayog', 'Reserve Bank of India', 'SEBI'],
    correctAnswer: 2,
    explanation:
      'The Reserve Bank of India conducts monetary policy under the flexible inflation targeting framework set by the government.',
  },
  {
    subject: 'General Knowledge',
    topic: 'Awards and Honours',
    examination: 'SSC CGL',
    difficulty: 'easy',
    questionText: 'India\'s highest civilian award is the:',
    options: ['Padma Vibhushan', 'Bharat Ratna', 'Param Vir Chakra', 'Padma Bhushan'],
    correctAnswer: 1,
    explanation: 'The Bharat Ratna is the highest civilian award of the Republic of India.',
  },
];

const CATEGORY_BY_SLUG = new Map(CATEGORY_SEED.map((c) => [c.slug, c]));

function chunkLines(lines, perPage = 14) {
  const pages = [];
  for (let i = 0; i < lines.length; i += perPage) {
    pages.push(lines.slice(i, i + perPage));
  }
  return pages;
}

function coverPageFor(doc) {
  return [
    'GOVERNMENT EXAM STUDY PORTAL',
    '',
    `Subject: ${doc.subject}`,
    `Target Examination: ${doc.examination}`,
    `Category: ${CATEGORY_BY_SLUG.get(doc.categorySlug)?.name || ''}`,
    `Tags: ${doc.tags.join(', ')}`,
    '',
    'About this material:',
    doc.description,
    '',
    'How to use: read the notes section by section, mark the formulas and',
    'take a short practice test after every revision to check retention.',
  ];
}

function pdfPagesFor(doc) {
  return [coverPageFor(doc), ...chunkLines(doc.content)];
}

export async function seedDatabase({ reset = false } = {}) {
  const summary = { admin: 0, categories: 0, documents: 0, questions: 0, removedDocuments: 0, removedQuestions: 0 };

  if (reset) {
    const existingDocs = await Document.find().select('filePath previewUrl');
    await Promise.all(existingDocs.map((doc) => removeFile(doc.filePath)));
    await Promise.all(existingDocs.map((doc) => removeFile(doc.previewUrl)));
    const docResult = await Document.deleteMany({});
    const questionResult = await Question.deleteMany({});
    summary.removedDocuments = docResult.deletedCount;
    summary.removedQuestions = questionResult.deletedCount;
  }

  // ---- Admin ----
  const email = env.admin.email.toLowerCase();
  let admin = await Admin.findOne({ email }).select('+passwordHash');
  if (!admin) {
    admin = await Admin.create({
      name: env.admin.name,
      email,
      passwordHash: await Admin.hashPassword(env.admin.password),
      role: 'superadmin',
    });
  }
  summary.admin = 1;

  // ---- Categories ----
  for (const category of CATEGORY_SEED) {
    // eslint-disable-next-line no-await-in-loop
    await Category.updateOne({ slug: category.slug }, { $set: category }, { upsert: true });
  }
  summary.categories = CATEGORY_SEED.length;

  const categories = await Category.find();
  const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c._id]));

  // ---- Documents ----
  for (const seed of DOCUMENT_SEED) {
    // eslint-disable-next-line no-await-in-loop
    const existing = await Document.findOne({ title: seed.title });
    if (existing) continue;

    const pdfBuffer = buildSimplePdf({ title: seed.title, pages: pdfPagesFor(seed) });
    const filename = `${seed.categorySlug}-${Date.now()}-${Math.round(Math.random() * 1e4)}.pdf`;
    // eslint-disable-next-line no-await-in-loop
    const saved = await saveBuffer(pdfBuffer, filename);

    // eslint-disable-next-line no-await-in-loop
    await Document.create({
      title: seed.title,
      slug: seed.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-'),
      description: seed.description,
      category: categoryIdBySlug.get(seed.categorySlug),
      subject: seed.subject,
      examination: seed.examination,
      fileUrl: saved.url,
      filePath: saved.path,
      originalName: `${seed.title}.pdf`,
      fileType: 'pdf',
      mimeType: 'application/pdf',
      fileSize: saved.size,
      previewUrl: saved.url,
      pageCount: pdfPagesFor(seed).length,
      tags: seed.tags,
      status: 'published',
      allowDownload: true,
      uploadedBy: admin._id,
      viewCount: seed.viewCount,
      publishedAt: new Date(),
    });

    summary.documents += 1;
  }

  // ---- Questions ----
  const existingQuestionCount = await Question.countDocuments();
  if (existingQuestionCount === 0) {
    await Question.insertMany(
      QUESTION_SEED.map((question) => ({ ...question, createdBy: admin._id }))
    );
    summary.questions = QUESTION_SEED.length;
  } else {
    summary.questions = existingQuestionCount;
  }

  return summary;
}

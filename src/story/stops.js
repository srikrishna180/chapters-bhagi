import {
  sceneRain, sceneDay, sceneMove, sceneJar, sceneLoop, sceneFest,
  sceneCounter, sceneFlip, sceneCake, sceneBye, sceneSea,
} from './scenes.js';

export const stops = [
  {
    title: 'A grey morning', h: 180, scene: sceneRain,
    alt: 'Bhagi walking out of UK arrivals in the rain with one suitcase',
    text: [
      'The plane touched down on a grey morning, as UK mornings tend to.',
      "Bhagi came through arrivals with one suitcase, a place on a master's course, and a quiet promise to herself that nobody else would pay her way.",
    ],
  },
  {
    title: 'Jet lag could wait', h: 180, scene: sceneDay,
    alt: 'Two calendar pages: Day 1 landed, Day 2 at work',
    text: [
      'The next day she was at work. Jet lag could wait.',
      'The first few months were easy. She stayed with friends, with laughter in the kitchen and someone always putting the kettle on.',
    ],
  },
  {
    title: 'Miles away', h: 186, scene: sceneMove,
    alt: "Bhagi moving from her friends' place to a new town miles away",
    text: [
      "Then one evening she announced she was moving out, miles away, to a town where she didn't know a soul.",
      'Her friends stared at her. She just grinned.',
    ],
  },
  {
    title: 'One pound at a time', h: 186, scene: sceneJar,
    alt: 'A jar filling with coins as she works shifts to pay her tuition',
    text: [
      'She took a job at an off-licence store and built her life from scratch.',
      'Morning shifts ran into afternoon lectures, assignments got written late at night, and her tuition fees were paid one hard-earned pound at a time.',
      "She still found room for fun, because Bhagi doesn't believe in a life that's only hard work.",
    ],
  },
  {
    title: 'The world went still', h: 180, scene: sceneLoop,
    alt: 'A laptop with online lectures and a daily loop of work, study, cook and sleep',
    text: [
      'Then Covid arrived, and the whole country went still almost overnight.',
      'So she packed the suitcase again and moved 20 miles from her university. Lectures shrank to little boxes on a laptop screen.',
      "Her world became work, study, cook, sleep, and then the same again, all on her own. She didn't moan about it once.",
    ],
  },
  {
    title: 'Festival nights', h: 186, scene: sceneFest,
    alt: 'Friends arriving by car to take her to a festival celebration',
    text: [
      "Whenever a festival came round there'd be a car outside and her friends at the door: “Get your things, you're coming with us.”",
      'Then came the music, the food and the laughter that went on far too long.',
      "By the next morning she'd be back behind the counter as if she'd never been away.",
    ],
  },
  {
    title: "How's your day?", h: 200, scene: sceneCounter,
    alt: 'A conversation at the shop counter',
    text: [
      'That counter was where the magic happened.',
      "She'd look up and say, “Hi! How's your day?” You'd mumble “fine”, and she'd simply wait, smiling, until you'd told her about your boss, your cat and that ridiculous bus driver.",
      'People came in for milk and left feeling better about life.',
    ],
  },
  {
    title: 'Flip-flops in winter', h: 190, scene: sceneFlip,
    alt: 'Feet in flip-flops on a frosty pavement',
    text: [
      'There were the flip-flops too, in the middle of a British winter with frost on the pavements.',
      "One elderly lady took it upon herself to rescue Bhagi's toes: “Young lady, please put on some socks, it's far too cold out there!”",
      "“Thank you!” Bhagi would beam, and the next day she'd be in flip-flops again.",
    ],
  },
  {
    title: 'The birthday surprise', h: 200, scene: sceneCake,
    alt: 'A birthday cake with candles, then a crowd of people gathering',
    text: [
      'Her birthdays have always had a ritual. Back home her friends turn up at midnight with a cake, come exams or chaos, and her family follows in the evening with another.',
      'In the UK the midnight cake carried on just the same.',
      'Then the next morning she walked into the store and stopped in the doorway. Everyone was there: regulars, neighbours, faces she saw every day, all waiting to wish her a happy birthday.',
      "She hadn't told a single person. They had found out anyway.",
    ],
  },
  {
    title: 'The goodbye', h: 204, scene: sceneBye,
    alt: 'People gathering around Bhagi with small goodbye gifts',
    text: [
      'When the time came to leave for a full-time job, the news travelled fast.',
      "Over those last days people kept appearing with little gifts: her favourite chocolate, the snack she'd once mentioned, a tiny detail someone had been quietly holding onto for months.",
      'Nobody wanted to say goodbye, and every one of them had a reason.',
      "That's what happens when you ask people how their day was and really listen to the answer. They never forget you.",
    ],
  },
  {
    title: 'By the sea', h: 340, scene: sceneSea,
    alt: 'Her bedroom window opening onto the real view of a ferry and a red lighthouse, with photos of her book and her reading corner',
    text: [
      'She got her degree, naturally, and landed a job in a little town by the sea.',
      'One job was never going to be enough for her, so in the evenings she taught English to a bright young Chinese student.',
      "Her bedroom looked straight out over the beach. Some mornings she'd push the window open, curl up with a book, and let the waves hum along in the background.",
      'Anyone standing there would fall in love with the view and drift off into daydreams.',
    ],
  },
];

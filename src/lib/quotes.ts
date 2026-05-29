// A small, curated set of quotes for the bottom margin of each day page —
// in the spirit of the Hobonichi techo's daily lines. Selection is
// deterministic per date, so a given day always shows the same quote
// (it feels printed, not shuffled).

export interface Quote {
  text: string
  author?: string
}

export const QUOTES: Quote[] = [
  { text: 'The smallest deed is better than the greatest intention.', author: 'John Burroughs' },
  { text: 'How we spend our days is, of course, how we spend our lives.', author: 'Annie Dillard' },
  { text: 'Do every act of your life as if it were the last.', author: 'Marcus Aurelius' },
  { text: 'Well done is better than well said.', author: 'Benjamin Franklin' },
  { text: 'It always seems impossible until it’s done.', author: 'Nelson Mandela' },
  { text: 'Fall seven times, stand up eight.', author: 'Japanese proverb' },
  { text: 'The journey of a thousand miles begins with a single step.', author: 'Lao Tzu' },
  { text: 'A year from now you may wish you had started today.', author: 'Karen Lamb' },
  { text: 'Little by little, one travels far.', author: 'J.R.R. Tolkien' },
  { text: 'Begin at once to live, and count each separate day as a separate life.', author: 'Seneca' },
  { text: 'What you do today can improve all your tomorrows.', author: 'Ralph Marston' },
  { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
  { text: 'Tension is who you think you should be. Relaxation is who you are.', author: 'Chinese proverb' },
  { text: 'The best time to plant a tree was twenty years ago. The second best time is now.', author: 'Proverb' },
  { text: 'To live is the rarest thing in the world. Most people exist, that is all.', author: 'Oscar Wilde' },
  { text: 'Knowing is not enough; we must apply. Willing is not enough; we must do.', author: 'Goethe' },
  { text: 'Nothing is worth more than this day.', author: 'Goethe' },
  { text: 'Each day is a little life.', author: 'Arthur Schopenhauer' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Whatever you can do, or dream you can, begin it.', author: 'Goethe' },
  { text: 'Quality is not an act, it is a habit.', author: 'Aristotle' },
  { text: 'We are what we repeatedly do.', author: 'Will Durant' },
  { text: 'Slow down and everything you are chasing will come around and catch you.', author: 'John De Paola' },
  { text: 'It is not that we have a short time to live, but that we waste a lot of it.', author: 'Seneca' },
  { text: 'A goal without a plan is just a wish.', author: 'Antoine de Saint-Exupéry' },
  { text: 'Cultivate the habit of being grateful for every good thing that comes to you.', author: 'Ralph Waldo Emerson' },
  { text: 'You miss one hundred percent of the shots you don’t take.', author: 'Wayne Gretzky' },
  { text: 'Order and simplification are the first steps toward mastery.', author: 'Thomas Mann' },
  { text: 'Make each day your masterpiece.', author: 'John Wooden' },
  { text: 'Patience is bitter, but its fruit is sweet.', author: 'Aristotle' },
  { text: 'Vision without action is a daydream. Action without vision is a nightmare.', author: 'Japanese proverb' },
  { text: 'Do what you can, with what you have, where you are.', author: 'Theodore Roosevelt' },
  { text: 'The day is what you make it; so why not make it a great one?', author: 'Steve Schulte' },
  { text: 'Even a small star shines in the darkness.', author: 'Finnish proverb' },
  { text: 'Dripping water hollows out stone, not through force but through persistence.', author: 'Ovid' },
  { text: 'Today is the first day of the rest of your life.', author: 'Abbie Hoffman' },
]

/**
 * Pick a stable quote for a date key (YYYY-MM-DD). The same key always
 * resolves to the same quote — a deterministic, printed feel.
 */
export function quoteForKey(k: string): Quote {
  let h = 0
  for (let i = 0; i < k.length; i++) {
    h = (h * 31 + k.charCodeAt(i)) >>> 0
  }
  return QUOTES[h % QUOTES.length]
}

const positiveWords = [
  "good", "great", "excellent", "amazing", "awesome", "fantastic", "love", "loved",
  "enjoy", "enjoyed", "best", "nice", "happy", "wonderful", "perfect", "brilliant",
  "exciting", "fun", "interesting", "helpful", "organized", "smooth", "informative",
  "inspiring", "superb", "outstanding", "satisfied", "glad", "recommend", "engaging",
  "worth", "valuable", "clear", "easy", "friendly", "professional"
];

const negativeWords = [
  "bad", "terrible", "awful", "worst", "hate", "hated", "boring", "disappointed",
  "poor", "sad", "waste", "useless", "annoying", "confusing", "messy", "slow",
  "rude", "unhappy", "horrible", "disaster", "failed", "failure", "weak", "long",
  "chaotic", "unorganized", "expensive", "noisy", "dirty", "crowded", "difficult",
  "unclear", "frustrating", "lack", "lacking"
];

const analyze = (text) => {
  if (!text) return { score: 0, sentiment: "NEUTRAL" };

  // Tokenize: remove punctuation, lowercase, split by whitespace
  const tokens = text.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/);
  let score = 0;

  tokens.forEach(word => {
    if (positiveWords.includes(word)) score += 1;
    if (negativeWords.includes(word)) score -= 1;
  });

  let sentiment = "NEUTRAL";
  if (score > 0) sentiment = "POSITIVE";
  if (score < 0) sentiment = "NEGATIVE";

  return { score, sentiment };
};

module.exports = { analyze };
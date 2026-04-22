
export const buildRecommendationsPrompt = (patterns: string[]): string => {


    const patternList = patterns.map((p, i) => `${i + 1}. ${p}`).join("\n");

  return `
You are a senior software engineering mentor.

This developer has the following recurring weaknesses detected from their code:

${patternList}

Generate 4 to 6 learning recommendations. Each must directly address one of the patterns above.
Do NOT suggest generic topics. Every topic must map to a specific pattern.

Bad: "Learn about security"
Good: "Input validation with Zod in Express.js routes"

Respond with ONLY this exact JSON. No markdown. No explanation.
{
  "recommendations": [
    {
      "topic": "<specific learning topic>",
      "reason": "<which pattern this addresses, quoted or paraphrased>",
      "difficulty": "beginner" | "intermediate" | "advanced",
      "resourceType": "documentation" | "video" | "practice" | "book"
    }
  ]
}
  `.trim();
};
import type { IAnalysisDocument } from "../../analysis.Type.js";

export const buildPatternDetectionPrompt = ( 
    analyses: IAnalysisDocument[]
): string => {
    const summaries = analyses
        .map((a, i) => {
            const s = a.scores;
            return `
Analysis ${i + 1} (${a.language}, ${a.sourceType}${a.fileName ? `, ${a.fileName}` : ""}):
  readability:     ${s.readability.score} — ${s.readability.reason}
  efficiency:      ${s.efficiency.score} — ${s.efficiency.reason}
  security:        ${s.security.score} — ${s.security.reason}
  maintainability: ${s.maintainability.score} — ${s.maintainability.reason}
  bestPractices:   ${s.bestPractices.score} — ${s.bestPractices.reason}
  overallScore:    ${a.overallScore}
      `.trim();
        })
        .join("\n\n");

    return `
You are a developer coach analyzing a developer's recurring coding habits.

Below are ${analyses.length} code analysis results for the same developer.
Study the scores and reasons across all analyses. Identify patterns that repeat.

${summaries}

Identify 3 to 6 recurring weaknesses or habits specific to this developer.
Each pattern must appear in at least 2 of the analyses above.
Be specific — name the actual habit, not a generic category.

Bad example: "Security issues detected"
Good example: "Consistently missing input validation before database operations"

Respond with ONLY this exact JSON. No markdown. No explanation.
{
  "patterns": [
    "<specific recurring habit 1>",
    "<specific recurring habit 2>",
    "<specific recurring habit 3>"
  ]
}
  `.trim();
};
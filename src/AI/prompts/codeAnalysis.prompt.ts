export interface IPromptInput {
  code: string;
  language: string;
  sourceType: "editor" | "github";
  fileName?: string | undefined;
}

export const buildCodeAnalysisPrompt = (input: IPromptInput): string => {
  const { code, language, sourceType, fileName } = input;

  const context =
    sourceType === "github" && fileName
      ? `File: ${fileName}`
      : "Source: code editor";

  return `You are an expert code reviewer and software quality analyst.

Context: ${context}
Language: ${language}

Analyze the following code and score it across 5 dimensions.
Each score must be between 0 and 100.
Each reason must be 1-2 specific points tied to the actual code provided.
Do not give generic reasons. Point to actual issues or strengths found in the code.

Scoring guide:
- 90-100 → Exceptional, production ready
- 70-89  → Good, minor improvements needed
- 50-69  → Average, several issues present
- 30-49  → Poor, significant problems
- 0-29   → Critical issues, needs rewrite

Dimensions to evaluate:

1. readability
   - Naming conventions, function length, clarity of logic
   - Single responsibility, DRY principle, comment quality

2. efficiency
   - Time complexity, unnecessary loops, redundant computation
   - Memory usage, async handling, database query efficiency

3. security
   - Input validation, injection risks, sensitive data exposure
   - Authentication checks, error message leakage, dependency risks

4. maintainability
   - Code structure, modularity, separation of concerns
   - Ease of extension, coupling, cohesion

5. bestPractices
   - Presence of test cases, edge case coverage
   - Testability of functions, mock-ability of dependencies
   - If no tests present, score based on how testable the code is

For each dimension:
- If score < 70: identify the specific problem found in the code
- If score >= 70: confirm what is done well AND suggest one enhancement

Also provide a "suggestions" array: 3-5 short, direct, actionable improvements
specific to this code. Each suggestion max 15 words. No generic advice.

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

You MUST respond with ONLY this exact JSON structure, no other keys:
{
  "scores": {
    "readability":     { "score": <0-100>, "reason": "<specific issue or strength + enhancement>" },
    "efficiency":      { "score": <0-100>, "reason": "<specific issue or strength + enhancement>" },
    "security":        { "score": <0-100>, "reason": "<specific issue or strength + enhancement>" },
    "maintainability": { "score": <0-100>, "reason": "<specific issue or strength + enhancement>" },
    "bestPractices":   { "score": <0-100>, "reason": "<specific issue or strength + enhancement>" }
  },
  "overallScore": <0-100>,
  "suggestions": [
    "<actionable suggestion 1>",
    "<actionable suggestion 2>",
    "<actionable suggestion 3>"
  ]
}

Do NOT rename keys. Do NOT add extra fields. Do NOT wrap in markdown.`;
};
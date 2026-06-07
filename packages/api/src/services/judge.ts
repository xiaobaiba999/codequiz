const PISTON_API = process.env.JUDGE_SERVICE_URL || 'https://emkc.org/api/v2/piston';

interface JudgeResult {
  success: boolean;
  output: string;
  error: string | null;
  exitCode: number;
}

/**
 * 使用 Piston API 执行代码
 */
export async function executeCode(
  language: string,
  code: string,
  stdin: string = '',
): Promise<JudgeResult> {
  try {
    const languageMap: Record<string, string> = {
      python: 'python3',
      javascript: 'javascript',
      java: 'java',
      cpp: 'c++',
    };

    const pistonLanguage = languageMap[language] || language;

    const response = await fetch(`${PISTON_API}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: pistonLanguage,
        version: '*',
        files: [{ content: code }],
        stdin,
      }),
    });

    const result: any = await response.json();
    return {
      success: result.run?.code === 0,
      output: result.run?.stdout || '',
      error: result.run?.stderr || null,
      exitCode: result.run?.code ?? -1,
    };
  } catch (error: any) {
    console.error('[Judge Service] Error:', error.message);
    return {
      success: false,
      output: '',
      error: '判题服务暂不可用，请稍后再试',
      exitCode: -1,
    };
  }
}

/**
 * 判断编程题是否通过
 */
export async function judgeProgrammingQuestion(
  language: string,
  code: string,
  testCases: Array<{ input: string; expectedOutput: string }>,
): Promise<{ passed: boolean; results: Array<{ input: string; expected: string; actual: string; passed: boolean }> }> {
  const results = [];

  for (const testCase of testCases) {
    const result = await executeCode(language, code, testCase.input);
    const actualOutput = result.output.trim();
    const expectedOutput = testCase.expectedOutput.trim();

    results.push({
      input: testCase.input,
      expected: expectedOutput,
      actual: actualOutput,
      passed: actualOutput === expectedOutput && result.success,
    });
  }

  return {
    passed: results.every(r => r.passed),
    results,
  };
}

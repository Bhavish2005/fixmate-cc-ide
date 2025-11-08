// src/utils/api.js
// Fake API using localStorage for logs
// Each log: { id, userId, language, code, error, output, createdAt, category }

const LS_KEY = (userId) => `code_editor_error_logs_${userId}`;

// Get all logs for a user
export async function getUserLogs(userId) {
  const raw = localStorage.getItem(LS_KEY(userId));
  return raw ? JSON.parse(raw) : [];
}

// Save all logs for a user
export async function saveUserLogs(userId, logs) {
  localStorage.setItem(LS_KEY(userId), JSON.stringify(logs));
}

// Run code (simulated) and log result
export async function runCompilerAndLog({ userId, language, code }) {
  // Simulate API delay
  await new Promise((res) => setTimeout(res, 500));

  // Fake compiler checks
  const missingSemicolon =
    /console\.log\([^;]*\)$/m.test(code) || !/;\s*$/.test(code);
  const undefinedVar = /\bundefinedVar\b/.test(code);
  const importError =
    /require\(['"]nonexistent['"]\)/.test(code) ||
    /import\s+\{.*\}\s+from\s+['"]nonexistent['"]/.test(code);

  let resp;
  if (importError) {
    resp = { error: "ModuleNotFoundError: Cannot find module 'nonexistent'", output: null, category: "Runtime" };
  } else if (undefinedVar) {
    resp = { error: "ReferenceError: undefinedVar is not defined", output: null, category: "Runtime" };
  } else if (missingSemicolon && Math.random() < 0.7) {
    resp = { error: "SyntaxError: Missing semicolon", output: null, category: "Syntax" };
  } else if (/while\s*\(true\)/.test(code) && Math.random() < 0.8) {
    resp = { error: "LogicalError: Potential infinite loop detected", output: null, category: "Logical" };
  } else {
    resp = { error: null, output: `✅ ${language} executed successfully (simulated).`, category: "Runtime" };
  }

  // Create log
  const log = {
    id: `${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    userId,
    language,
    code,
    error: resp.error,
    output: resp.output,
    createdAt: new Date().toISOString(),
    category: resp.error ? resp.category : "Runtime",
  };

  // Save log
  const existingLogs = await getUserLogs(userId);
  const updatedLogs = [log, ...existingLogs];
  await saveUserLogs(userId, updatedLogs);

  return { log, compilerResponse: resp };
}

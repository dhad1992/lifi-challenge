export function getEnv(variableName: string, defaultValue?: string): string {
  if (process.env.ENVIRONMENT === "test") {
    return variableName;
  }
  if (!process.env[variableName]) {
    if (!defaultValue) {
      throw new Error(`No default value provided for ${variableName}`);
    }
    return defaultValue;
  }
  return process.env[variableName]!;
}

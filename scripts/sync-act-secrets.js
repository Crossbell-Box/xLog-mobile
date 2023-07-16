const fs = require("fs").promises;

async function getSecretContent(filePath) {
  const content = await fs.readFile(filePath, { encoding: "utf-8" });
  return content.trim();
}

async function main() {
  const base = await getSecretContent(".act.secrets.base");
  const common = await getSecretContent(".env.common");
  const development = await getSecretContent(".env.development");
  const production = await getSecretContent(".env.production");
  const test = await getSecretContent(".env.test");

  const output = `${base}
ENV_FILE_COMMON="${common}"
ENV_FILE_DEVELOPMENT="${development}"
ENV_FILE_PRODUCTION="${production}"
ENV_FILE_TEST="${test}"
  `;

  await fs.writeFile(".act.secrets", output, { encoding: "utf-8" });
}

main().catch(error => console.error(error));

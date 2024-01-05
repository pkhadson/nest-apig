import { exec, execSync } from "node:child_process";
import * as fs from "node:fs";

const init = () => {
  const rootPath = process.env.PWD!;
  console.log(`Initializing NestJS CDK project in ${rootPath}`);
  const packageJsonPath = `${rootPath}/package.json`;

  // check if package.json exists
  if (!fs.existsSync(packageJsonPath))
    throw new Error(`package.json not found in ${rootPath}`);
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

  if (!packageJson.scripts) packageJson.scripts = {};

  // add deploy script
  packageJson.scripts.cdk = "cdk";
  packageJson.scripts.deploy = "cdk deploy";
  packageJson.scripts["deploy:all"] =
    "cdk deploy --require-approval never --all";

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  const projectName = packageJson.name;

  // check which package manager is being used=

  let packageManager: "npm" | "pnpm" | "yarn" = "npm";
  if (fs.existsSync(`${rootPath}/pnpm-lock.yaml`)) packageManager = "pnpm";
  else if (fs.existsSync(`${rootPath}/yarn.lock`)) packageManager = "yarn";

  console.log(`Using ${packageManager} as package manager`);

  // add cdk dependencies
  const cdkDependencies = [
    "@nest-cdk/core",
    "aws-cdk-lib",
    "class-transformer",
    "class-validator",
    "constructs",
  ];

  const installCommand = {
    npm: "npm install",
    pnpm: "pnpm add",
    yarn: "yarn add",
  };

  const install = `${installCommand[packageManager]} ${cdkDependencies.join(
    " "
  )}`;

  console.log(`Installing dependencies: ${cdkDependencies.join()}`);

  execSync(install, { stdio: "inherit" });

  //move webpack.config.js to root
  console.log(`Moving webpack.config.js to root`);
  fs.writeFileSync(
    `${rootPath}/webpack.config.js`,
    fs.readFileSync(`${__dirname}/../../static/webpack.config.js`)
  );

  // move cdk.json to root
  console.log(`Moving cdk.json to root`);
  fs.writeFileSync(
    `${rootPath}/cdk.json`,
    fs.readFileSync(`${__dirname}/../../static/cdk.json`)
  );

  // add cdk.out to .gitignore
  console.log(`Adding cdk.out to .gitignore`);
  const gitignorePath = `${rootPath}/.gitignore`;
  fs.writeFileSync(gitignorePath, `\ncdk.out`, { flag: "a" });

  // check if is monorepo or not
  let monorepo = false;
  try {
    const nestConfig = JSON.parse(
      fs.readFileSync(`${rootPath}/nest-cli.json`, "utf-8")
    );
    if (nestConfig.monorepo) monorepo = true;
    if (!monorepo && fs.existsSync(`${rootPath}/apps`)) monorepo = true;
  } catch {
    monorepo = false;
  }

  if (monorepo) console.log(`${projectName} is a NestJS monorepo`);
  else console.log(`${projectName} is not a NestJS monorepo`);

  const mainFiles: string[] = [];

  if (monorepo) {
    const apps = fs.readdirSync(`${rootPath}/apps`);
    mainFiles.push(...apps.map((app) => `${rootPath}/apps/${app}/src/main.ts`));
  } else {
    mainFiles.push(`${rootPath}/src/main.ts`);
  }

  const replaces = [
    [
      "bootstrap();",
      `if (!process.env.LAMBDA_TASK_ROOT && !process.env.GENERATE) bootstrap();`,
    ],
  ];

  for (let i = 0; i < mainFiles.length; i++) {
    console.log(`Adding CDK bootstrap to ${mainFiles[i]}`);
    const filePath = mainFiles[i];
    let fileContent = fs.readFileSync(filePath, "utf-8");

    if (fileContent.includes("@nest-cdk/core")) {
      console.log(`CDK bootstrap already added to ${filePath}`);
      continue;
    }

    for (let j = 0; j < replaces.length; j++) {
      const [find, replace] = replaces[j];
      fileContent = fileContent.replace(find, replace);
    }

    // inner NestFactory.create( and )
    const mainModuleName = fileContent.match(
      /NestFactory\.create\((.*?)\)/
    )![1];

    console.log(mainModuleName);

    fileContent =
      `import { getHandler, Handler } from '@nest-cdk/core';\n` +
      `${fileContent}\n` +
      `export const handler: Handler = getHandler(NestFactory.create(${mainModuleName}));\n` +
      `global['handler'] = handler;\n`;

    fs.writeFileSync(filePath, fileContent);
    console.log(`CDK bootstrap added to ${filePath}`);
  }

  // creating cdk folder if not exists
  if (!fs.existsSync(`${rootPath}/cdk`)) {
    console.log(`Creating cdk folder`);
    fs.mkdirSync(`${rootPath}/cdk`);
    console.log(`cdk folder created`);
  }

  // add main.ts inside cdk folder and replace project name
  console.log(`Adding main.ts inside cdk folder`);
  const cdkMainPath = `${rootPath}/cdk/main.ts`;
  fs.writeFileSync(
    cdkMainPath,
    fs
      .readFileSync(`${__dirname}/../../static/cdk/main.ts.txt`, "utf-8")
      .replace("{{name}}", projectName)
  );

  // install the latest version of aws-cdk cli
  execSync(`npm install -g aws-cdk@latest -g`, { stdio: "inherit" });
};

export default init;

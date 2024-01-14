import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";
import shell from "shelljs";

interface IBuild {
  path: string;
}

export class Build {
  private nestCliConfig: any = {};

  constructor(public opts: IBuild) {
    this.webpackSetup();
  }

  async run() {
    let projects: { build: string; generate: string }[] = [];
    if (this.isMonorepo) projects = this.buildProjects(this.projectNames);
    else projects = this.build();

    for (let i = 0; i < projects.length; i++) {
      const { build, generate } = projects[i];
      execSync(build, { cwd: this.opts.path, stdio: "inherit" });
      execSync(generate, { cwd: this.opts.path, stdio: "inherit" });
    }
  }

  getNestConfig() {
    if (this.nestCliConfig.compilerOptions) return this.nestCliConfig;
    const filePath = path.join(this.opts.path, "nest-cli.json");
    if (fs.existsSync(filePath))
      this.nestCliConfig = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return this.nestCliConfig;
  }

  get isMonorepo() {
    const configMonorepo = this.getNestConfig().monorepo;
    if (typeof configMonorepo === "boolean") return configMonorepo;

    if (fs.existsSync(path.join(this.opts.path, "apps"))) return true;
    return false;
  }

  get projectNames() {
    const { projects } = this.getNestConfig();
    if (!projects) return [];
    const apps = Object.entries(projects).filter(
      (a: [string, any]) => a[1].type === "application"
    );

    return this.isMonorepo ? apps.map((a: any) => a[0]) : [];
  }

  build(project: string = "") {
    const command = {
      build: `nest build${project ? ` ${project}` : ""} --webpack`,
      generate: `GENERATE=true node dist/apps/${project || ".."}/main.js`,
    };
    return [command];
  }

  buildProjects(projects: string[]) {
    return projects.map((project) => this.build(project)[0]);
  }

  webpackSetup() {
    const webpackConfigPath = path.join(this.opts.path, "webpack.config.js");
    // if (!fs.existsSync(webpackConfigPath))
    fs.copyFileSync(
      path.join(__dirname, "../webpack.config.js"),
      webpackConfigPath
    );
  }
}

// new Build({
//   //   path: "/Users/pkhadson/www/leilooa/apps/back/",
//   path: "/Users/pkhadson/www/nest-cdk-examples/simple",
// });

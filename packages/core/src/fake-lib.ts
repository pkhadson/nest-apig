import * as fs from "node:fs";
import * as path from "node:path";

const nodeModulesPath = process.mainModule?.paths.find(fs.existsSync)!;

export const makeFakeLib = (name: string) => {
  if (
    fs.existsSync(path.join(nodeModulesPath, name)) &&
    !fs.existsSync(path.join(nodeModulesPath, name, ".fake"))
  )
    return;

  const index = `module.exports = () => false`;
  const packageJson = {
    name,
    version: "1.0.0",
    main: "index.js",
  };

  if (!fs.existsSync(path.join(nodeModulesPath, name)))
    fs.mkdirSync(path.join(nodeModulesPath, name));
  fs.writeFileSync(path.join(nodeModulesPath, name, "index.js"), index);
  fs.writeFileSync(
    path.join(nodeModulesPath, name, "package.json"),
    JSON.stringify(packageJson)
  );
  fs.writeFileSync(path.join(nodeModulesPath, name, ".fake"), "");
};

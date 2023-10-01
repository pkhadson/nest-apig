import * as fs from "node:fs";
import * as path from "node:path";
import {
  EventBus,
  EventField,
  Rule,
  RuleTargetInput,
} from "aws-cdk-lib/aws-events";
import titleCase from "./utils/title-case.util";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";

interface IAtlasRegisterOptions {}

const register = (nestStack: any) => {
  const atlasRulesPath = path.join(
    nestStack.distPath,
    "_generated/atlas-events.json"
  );

  if (!fs.existsSync(atlasRulesPath)) return;

  const eventBus = EventBus.fromEventBusName(
    nestStack,
    "AtlasEventBus",
    "aws.partner/mongodb.com/stitch.trigger/6516dad5d2a70e0508f7d775" ||
      process.env.ATLAS_EVENT_BUS
  );

  const rules = JSON.parse(fs.readFileSync(atlasRulesPath, "utf-8"));

  const projectName = titleCase(nestStack.projectName);

  for (let i = 0; i < rules.length; i++) {
    const { eventPattern, service, method } = rules[i];
    const rule = new Rule(nestStack, `${projectName}${service}${method}`, {
      eventBus,
      eventPattern,
    });
    rule.addTarget(
      new LambdaFunction(nestStack.fn, {
        event: RuleTargetInput.fromObject({
          detail: EventField.fromPath("$.detail"),
          service,
          method,
        }),
      })
    );
  }
};

export default register;

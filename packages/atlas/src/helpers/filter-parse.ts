import { subjectToRule } from "../utils/subject-to-rule";

export const filterParse = (a: any) => {
  const eventPattern: any = {
    source: [{ prefix: "" }] as any[], // Matches all the events in the bus
    detail: {},
  };

  const subjectFilter = a.events.map((subject: string) =>
    subjectToRule(subject)
  );

  if (a.filter)
    eventPattern.detail = {
      ...{ fullDocument: a.filter },
      ...(subjectFilter.length === 1
        ? subjectFilter[0]
        : { $or: subjectFilter }),
    };
  else
    eventPattern.detail =
      subjectFilter.length === 1 ? subjectFilter[0] : { $or: subjectFilter };

  return {
    ...a,
    eventPattern,
  };
};

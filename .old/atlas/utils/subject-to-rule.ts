const atlasEventEnum = {
  created: "insert",
  updated: "update",
  deleted: "delete",
};

export const subjectToRule = (subject: string) => {
  const [collection, action] = subject.split(".");
  const atlasOperation = atlasEventEnum[action as "updated"];

  const filter: any = {
    "ns.coll": [{ prefix: collection }],
  };

  if (action != "*") filter.operationType = [{ prefix: atlasOperation }];

  return filter;
};

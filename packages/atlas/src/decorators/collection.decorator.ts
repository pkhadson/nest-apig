export const Collection = (string: string) => {
  return (target: any) => {
    Reflect.set(target.constructor, "collection", string);
  };
};

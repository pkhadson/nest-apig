const titleCase = (s: string) =>
  s.replace(/^-*(.)|-+(.)/g, (s, c, d) =>
    c ? c.toUpperCase() : d.toUpperCase()
  );

export default titleCase;

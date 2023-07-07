const fakerFn = fnName => (...args) => {
  // eslint-disable-next-line no-console
  console.log(`[GA-${fnName}]: ${args.map(arg => JSON.stringify(arg)).join(", ")}`);
  return Promise.resolve();
};

export default () => new Proxy({}, {
  get: (target, name) => {
    if (typeof name === "string") {
      return fakerFn(name);
    }
  },
});

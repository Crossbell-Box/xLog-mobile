const { cwd } = require("process");

const getReleasePlan = require("@changesets/get-release-plan").default;

module.exports = async () => {
  const releasePlan = await getReleasePlan(cwd());
  console.log("Release plan: ", JSON.stringify(releasePlan, null, 2));
  console.log("Release type: ", releasePlan.releases[0].type);
  return releasePlan.releases[0].type;
};

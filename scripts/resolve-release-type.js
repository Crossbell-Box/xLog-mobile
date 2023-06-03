const { cwd } = require("process");

const getReleasePlan = require("@changesets/get-release-plan").default;

module.exports = async () => {
  const releasePlan = await getReleasePlan(cwd());
  console.log("Release plan: ", JSON.stringify(releasePlan, null, 2));

  const release = releasePlan.releases[0];

  if (!release) {
    return "";
  }

  console.log("Release type: ", release.type);

  return release.type;
};

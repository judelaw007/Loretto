// Pre-deploy script: builds functions before deploying
const { execSync } = require("child_process");

console.log("Building functions...");
execSync("npm run build", { stdio: "inherit", cwd: __dirname });
console.log("Functions built successfully.");

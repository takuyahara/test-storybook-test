import { execa } from "execa";

async function runCommands() {
  // Step 1: Run the first command
  const firstCommand = execa({
    reject: false,
  })`npx storybook dev --ci`;

  // Step 2: Wait until the port opens
  let url;
  firstCommand.stdout.on("data", (data) => {
    const output = data.toString();
    // Assuming the port number is in the output, e.g., "Listening on port 12345"
    const match = output.match(/Local: +(http:\/\/localhost:\d+)\//);
    if (match) {
      url = match[1];
    }
  });

  // Wait for the port to be assigned
  while (!url) {
    await new Promise((resolve) => setTimeout(resolve, 100)); // Polling interval
  }

  // Step 3: Run the second command
  const {exitCode}=await execa({
    stdio: "inherit",
    reject: false,
  })`npx test-storybook --url ${url}`;

  // Step 4: Kill the first command's process
  firstCommand.kill("SIGINT");
  if (exitCode > 0) {
    process.exit(exitCode);
  }
    process.exit(0);
}

runCommands().catch((error) => {
  console.error(error);
  process.exit(1);
});

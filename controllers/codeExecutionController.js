const fs = require("fs");
const { spawn, execSync } = require("child_process");
const path = require("path");

const pythonCodeExecution = (socket, code) => {
  // Check if Python is installed
  try {
    execSync("which python3");
  } catch (error) {
    console.error("Python3 is not installed on this system.");
    socket.emit("program-error", "Python3 is not installed.");
    return;
  }

  // Create a unique filename
  const pythonFile = path.join(__dirname, `${socket?.id}_UserInputProgram.py`);
  fs.writeFileSync(pythonFile, code, "utf8");

  // Execute Python script
  const run = spawn("python3", [pythonFile]); // Ensure 'python3' is used

  run.stdout.on("data", (data) => {
    socket.emit("program-output", data.toString());
  });

  run.stderr.on("data", (error) => {
    socket.emit("program-error", error.toString());
  });

  run.on("close", (exitCode) => {
    socket.emit("program-complete", `Program exited with code ${exitCode}`);
    fs.unlinkSync(pythonFile);
  });
};

module.exports = { pythonCodeExecution };

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const MIPsFolderPath = path.join(__dirname, "..", "..", "MIPs");

function getMIPFiles() {
  const files = fs.readdirSync(MIPsFolderPath);
  return files.filter((file) => file.match(/^(mip-(\d+|x))\.md$/i));
}

function getNextMIPNumber(mipFiles) {
  const numberedMipFiles = mipFiles.filter((file) => file.match(/^mip-\d+\.md$/i));
  const mipNumbers = numberedMipFiles.map((file) => parseInt(file.match(/^mip-(\d+)\.md$/i)[1], 10));
  return mipNumbers.length > 0 ? Math.max(...mipNumbers) + 1 : 1;
}


function renameAndUpdateMIPFile() {
  const mipFiles = getMIPFiles();

  if (mipFiles.length === 0) {
    console.log("No MIP files found.");
    return;
  }

  const nextMIPNumber = getNextMIPNumber(mipFiles);

  const oldFilePath = path.join(MIPsFolderPath, "mip-x.md");
  const newFilePath = path.join(MIPsFolderPath, `mip-${nextMIPNumber}.md`);

  if (!fs.existsSync(oldFilePath)) {
    console.log("No mip-x.md file found.");
    return;
  }

  const content = fs.readFileSync(oldFilePath, "utf-8");
  const updatedContent = content.replace(/mip-x/gi, `MIP-${nextMIPNumber}`);

  fs.writeFileSync(newFilePath, updatedContent);
  fs.unlinkSync(oldFilePath);

  execSync(`git add ${oldFilePath} ${newFilePath}`);
}

renameAndUpdateMIPFile();

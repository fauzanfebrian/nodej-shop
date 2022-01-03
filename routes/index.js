const fs = require("fs");

const ex = fs
  .readdirSync(__dirname)
  .filter((name) => name !== __filename.split("/").pop())
  .reduce((acc, value) => {
    const nameFile = value.replace(".js", "");
    acc[nameFile] = require(`./${value}`);
    return acc;
  }, {});

module.exports = ex;

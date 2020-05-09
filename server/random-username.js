const adjs = require("./adjs.json").adjs;
const nouns = require("./nouns.json").nouns;

const randomUsername = () => {
  let ranAdjs = adjs[Math.floor(adjs.length * Math.random())];
  ranAdjs = ranAdjs.charAt(0).toUpperCase() + ranAdjs.slice(1);
  let ranNoun = nouns[Math.floor(nouns.length * Math.random())];
  ranNoun = ranNoun.charAt(0).toUpperCase() + ranNoun.slice(1);
  return `${ranAdjs} ${ranNoun}`;
};

module.exports = randomUsername;

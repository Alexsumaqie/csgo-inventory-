module.exports = {
  productName: "CSGO Inventory Saphira",
  appId: "com.saphira.csgo",
  directories: {
    output: "dist"
  },
  files: [
    "dist/**",
    "electron/**",
    "main.js",
    "server.mjs",
    "index.html"
  ],
  win: {
    target: "nsis",
    icon: "public/icon.ico" // optional, add your icon here
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true
  }
};

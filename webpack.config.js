const {
  shareAll,
  withModuleFederationPlugin,
} = require("@angular-architects/module-federation/webpack");

const shared = shareAll({
  singleton: true,
  strictVersion: true,
  requiredVersion: "auto",
});
delete shared["apexcharts"];
delete shared["ng-apexcharts"];

module.exports = withModuleFederationPlugin({
  name: "subscription-panel",
  exposes: {
    "./SubscriptionModule": "./src/app/subscription/subscription-module.ts",
  },
  shared,
});

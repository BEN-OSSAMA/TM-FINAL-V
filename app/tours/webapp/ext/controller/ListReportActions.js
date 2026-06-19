sap.ui.define([
  "sap/m/MessageToast"
], function (MessageToast) {
  "use strict";

  return {
    onBackToDashboard: function () {
      MessageToast.show("Retour au dashboard...");

      setTimeout(function () {
        window.location.href = "/planner-dashboard/webapp/index.html";
      }, 300);
    },

    onBack: function () {
      MessageToast.show("Retour...");

      setTimeout(function () {
        window.history.back();
      }, 200);
    }
  };
});
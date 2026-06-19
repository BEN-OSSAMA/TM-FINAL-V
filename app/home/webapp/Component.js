sap.ui.define([
  "sap/ui/core/UIComponent",
  "home/model/models"
], function (UIComponent, models) {
  "use strict";

  return UIComponent.extend("home.Component", {
    metadata: {
      manifest: "json"
    },

    init: function () {
      UIComponent.prototype.init.apply(this, arguments);
      this.setModel(models.createDeviceModel(), "device");
    }
  });
});
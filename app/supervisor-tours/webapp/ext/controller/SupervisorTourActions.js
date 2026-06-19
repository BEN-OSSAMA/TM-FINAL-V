sap.ui.define([
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/m/Dialog",
  "sap/m/TextArea",
  "sap/m/Button",
  "sap/m/Label",
  "sap/m/VBox"
], function (
  MessageToast,
  MessageBox,
  Dialog,
  TextArea,
  Button,
  Label,
  VBox
) {
  "use strict";

  function getContextFromArguments(aArgs) {
    for (var i = 0; i < aArgs.length; i += 1) {
      var arg = aArgs[i];

      if (Array.isArray(arg) && arg.length && arg[0] && typeof arg[0].getPath === "function") {
        return arg[0];
      }

      if (arg && typeof arg.getPath === "function" && typeof arg.getModel === "function") {
        return arg;
      }

      if (arg && typeof arg.getSource === "function") {
        var source = arg.getSource();

        if (source && typeof source.getBindingContext === "function") {
          var context = source.getBindingContext();

          if (context) {
            return context;
          }
        }
      }
    }

    return null;
  }

  function getModelFromContext(oContext) {
    return oContext && typeof oContext.getModel === "function"
      ? oContext.getModel()
      : null;
  }

  function refreshModel(oModel) {
    if (oModel && typeof oModel.refresh === "function") {
      oModel.refresh();
    }
  }

  async function executeBoundAction(oContext, sActionName, oParameters) {
    var oModel = getModelFromContext(oContext);

    if (!oModel) {
      throw new Error("Modèle OData introuvable.");
    }

    var sFullActionName = "RouteManagementService." + sActionName + "(...)";
    var oAction = oModel.bindContext(sFullActionName, oContext);

    if (oParameters) {
      Object.keys(oParameters).forEach(function (sKey) {
        oAction.setParameter(sKey, oParameters[sKey]);
      });
    }

    await oAction.execute();

    refreshModel(oModel);
  }

  return {
    onBackToDashboard: function () {
      MessageToast.show("Retour au dashboard superviseur...");

      setTimeout(function () {
        window.location.href = "/supervisor-dashboard/webapp/index.html";
      }, 300);
    },

    onBack: function () {
      MessageToast.show("Retour...");

      setTimeout(function () {
        window.history.back();
      }, 200);
    },

    onValidateTour: async function () {
      var oContext = getContextFromArguments(arguments);

      if (!oContext) {
        MessageBox.warning("Veuillez sélectionner une tournée à valider.");
        return;
      }

      MessageBox.confirm("Voulez-vous valider cette tournée ?", {
        title: "Validation de la tournée",
        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
        emphasizedAction: MessageBox.Action.OK,
        onClose: async function (sAction) {
          if (sAction !== MessageBox.Action.OK) {
            return;
          }

          try {
            await executeBoundAction(oContext, "validate");
            MessageToast.show("Tournée validée avec succès.");
          } catch (error) {
            MessageBox.error(error.message || "Erreur lors de la validation de la tournée.");
          }
        }
      });
    },

    onRejectTour: function () {
      var oContext = getContextFromArguments(arguments);

      if (!oContext) {
        MessageBox.warning("Veuillez sélectionner une tournée à rejeter.");
        return;
      }

      var oReasonArea = new TextArea({
        width: "100%",
        rows: 5,
        placeholder: "Saisir le motif de rejet..."
      });

      var oDialog = new Dialog({
        title: "Rejeter la tournée",
        contentWidth: "420px",
        content: [
          new VBox({
            width: "100%",
            items: [
              new Label({
                text: "Motif de rejet obligatoire",
                required: true
              }),
              oReasonArea
            ]
          })
        ],
        beginButton: new Button({
          text: "Rejeter",
          type: "Reject",
          press: async function () {
            var sReason = oReasonArea.getValue();

            if (!sReason || !sReason.trim()) {
              MessageBox.warning("Le motif de rejet est obligatoire.");
              return;
            }

            try {
              await executeBoundAction(oContext, "reject", {
                reason: sReason.trim()
              });

              MessageToast.show("Tournée rejetée avec succès.");
              oDialog.close();
            } catch (error) {
              MessageBox.error(error.message || "Erreur lors du rejet de la tournée.");
            }
          }
        }),
        endButton: new Button({
          text: "Annuler",
          press: function () {
            oDialog.close();
          }
        }),
        afterClose: function () {
          oDialog.destroy();
        }
      });

      oDialog.open();
    }
  };
});
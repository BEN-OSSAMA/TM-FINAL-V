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

  function normalizeStatus(sStatus) {
    return String(sStatus || "").trim().toUpperCase();
  }

  function isCreatedStatus(sStatus) {
    var sNormalized = normalizeStatus(sStatus);

    return sNormalized === "CREATED" ||
      sNormalized === "DRAFT" ||
      sNormalized === "PENDING";
  }

  function addContextOnce(aContexts, oContext) {
    if (!oContext || typeof oContext.getPath !== "function" || typeof oContext.getModel !== "function") {
      return;
    }

    var sPath = oContext.getPath();

    var bExists = aContexts.some(function (item) {
      return item && typeof item.getPath === "function" && item.getPath() === sPath;
    });

    if (!bExists) {
      aContexts.push(oContext);
    }
  }

  function getContextsFromArguments(aArgs) {
    var aContexts = [];

    for (var i = 0; i < aArgs.length; i += 1) {
      var arg = aArgs[i];

      if (Array.isArray(arg)) {
        arg.forEach(function (item) {
          addContextOnce(aContexts, item);
        });
      }

      addContextOnce(aContexts, arg);

      if (arg && typeof arg.getSource === "function") {
        var source = arg.getSource();

        if (source && typeof source.getBindingContext === "function") {
          addContextOnce(aContexts, source.getBindingContext());
        }
      }
    }

    return aContexts;
  }

  async function keepOnlyCreatedRoadmaps(aContexts) {
    var aCreatedContexts = [];

    for (var i = 0; i < aContexts.length; i += 1) {
      var oContext = aContexts[i];
      var oObject = null;

      if (oContext && typeof oContext.requestObject === "function") {
        oObject = await oContext.requestObject();
      } else if (oContext && typeof oContext.getObject === "function") {
        oObject = oContext.getObject();
      }

      if (oObject && isCreatedStatus(oObject.status)) {
        addContextOnce(aCreatedContexts, oContext);
      }
    }

    return aCreatedContexts;
  }

  async function executeBoundAction(oContext, sActionName, oParameters) {
    if (!oContext || typeof oContext.getModel !== "function") {
      throw new Error("Aucune feuille de route sélectionnée.");
    }

    var oModel = oContext.getModel();

    if (!oModel || typeof oModel.bindContext !== "function") {
      throw new Error("Modèle OData introuvable.");
    }

    var sFullActionName = "RouteManagementService." + sActionName + "(...)";
    var oAction = oModel.bindContext(sFullActionName, oContext);

    Object.keys(oParameters || {}).forEach(function (sKey) {
      oAction.setParameter(sKey, oParameters[sKey]);
    });

    await oAction.execute();
  }

  async function executeForAll(aContexts, sActionName, oParameters) {
    for (var i = 0; i < aContexts.length; i += 1) {
      await executeBoundAction(aContexts[i], sActionName, oParameters);
    }
  }

  // function reloadAfterSuccess() {
  //   setTimeout(function () {
  //     window.location.reload();
  //   }, 500);
  // }
  async function refreshContext(oContext) {
  if (!oContext) {
    return;
  }

  if (typeof oContext.requestSideEffects === "function") {
    await oContext.requestSideEffects([
      { $PropertyPath: "status" },
      { $PropertyPath: "statusCriticality" },
      { $PropertyPath: "canValidate" },
      { $PropertyPath: "canReject" },
      { $PropertyPath: "rejectionReason" },
      { $PropertyPath: "integrationStatus" },
      { $PropertyPath: "modifiedAt" },
      { $PropertyPath: "updatedAt" }
    ]);
  }

  var oModel = oContext.getModel();

  if (oModel && typeof oModel.refresh === "function") {
    oModel.refresh();
  }
}

async function refreshAllContexts(aContexts) {
  for (var i = 0; i < aContexts.length; i += 1) {
    await refreshContext(aContexts[i]);
  }
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

    onValidateRoadmap: async function () {
      var aContexts = getContextsFromArguments(arguments);

      if (!aContexts.length) {
        MessageBox.warning("Veuillez sélectionner une feuille de route à valider.");
        return;
      }

      var aCreatedContexts = await keepOnlyCreatedRoadmaps(aContexts);

      if (!aCreatedContexts.length) {
        MessageBox.warning("Seules les feuilles de route avec le statut CREATED peuvent être validées.");
        return;
      }

      var sMessage = aCreatedContexts.length === 1
        ? "Voulez-vous valider cette feuille de route ?"
        : "Voulez-vous valider les feuilles de route sélectionnées avec le statut CREATED ?";

      MessageBox.confirm(sMessage, {
        title: "Validation des feuilles de route",
        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
        emphasizedAction: MessageBox.Action.OK,
        onClose: async function (sAction) {
          if (sAction !== MessageBox.Action.OK) {
            return;
          }

          try {
            await executeForAll(aCreatedContexts, "validateRoadmap");

            MessageToast.show("Validation effectuée avec succès.");
            await refreshAllContexts(aCreatedContexts);
          } catch (error) {
            MessageBox.error(error.message || "Erreur lors de la validation.");
          }
        }
      });
    },

    onRejectRoadmap: async function () {
      var aContexts = getContextsFromArguments(arguments);

      if (!aContexts.length) {
        MessageBox.warning("Veuillez sélectionner une feuille de route à rejeter.");
        return;
      }

      var aCreatedContexts = await keepOnlyCreatedRoadmaps(aContexts);

      if (!aCreatedContexts.length) {
        MessageBox.warning("Seules les feuilles de route avec le statut CREATED peuvent être rejetées.");
        return;
      }

      var oReasonArea = new TextArea({
        width: "100%",
        rows: 5,
        placeholder: "Saisir le motif de rejet..."
      });

      var oDialog = new Dialog({
        title: "Rejeter la feuille de route",
        contentWidth: "440px",
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
              await executeForAll(aCreatedContexts, "rejectRoadmap", {
                reason: sReason.trim()
              });

              MessageToast.show("Rejet effectué avec succès.");
              oDialog.close();
              await refreshAllContexts(aCreatedContexts);
            } catch (error) {
              MessageBox.error(error.message || "Erreur lors du rejet.");
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
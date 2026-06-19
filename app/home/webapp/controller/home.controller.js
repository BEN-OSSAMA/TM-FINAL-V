sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/m/ActionSheet",
  "sap/m/Button"
], function (
  Controller,
  JSONModel,
  MessageToast,
  MessageBox,
  ActionSheet,
  Button
) {
  "use strict";

  return Controller.extend("home.controller.home", {
    onInit: function () {
      this._initHomeModel();
      this._startHeroAutoSlide();
    },

    _initHomeModel: function () {
      var oUser = this._getCurrentUser();
      var sRole = this._normalizeRole(oUser && oUser.role);

      var bLoggedIn = !!oUser;
      var bPlanner = sRole === "PLANIFICATEUR" || sRole === "PLANNER";
      var bSupervisor = sRole === "SUPERVISEUR" || sRole === "SUPERVISOR";
      var bAdmin = sRole === "ADMIN";

      var sUserName = bLoggedIn
        ? (oUser.fullName || oUser.username || oUser.email || "Utilisateur")
        : "";

      var oModel = new JSONModel({
        isLoggedIn: bLoggedIn,
        currentUser: oUser,
        userDisplayName: sUserName,
        role: sRole,
        roleLabel: bLoggedIn ? "Connecté : " + sRole : "Non connecté",
        roleState: bLoggedIn ? "Success" : "Warning",

        showPlanningServices: !bLoggedIn || bPlanner || bAdmin,
        showSupervisorServices: !bLoggedIn || bSupervisor || bAdmin,
        showCommonServices: true,

        canOpenPlanning: bPlanner || bAdmin,
        canOpenSupervisor: bSupervisor || bAdmin
      });

      this.getView().setModel(oModel, "home");
    },

    _getCurrentUser: function () {
      var aKeys = [
        "currentUser",
        "sepurUser"
      ];

      for (var i = 0; i < aKeys.length; i += 1) {
        var sLocalValue = localStorage.getItem(aKeys[i]);
        var sSessionValue = sessionStorage.getItem(aKeys[i]);
        var sValue = sLocalValue || sSessionValue;

        if (sValue) {
          try {
            return JSON.parse(sValue);
          } catch (error) {
            return {
              username: sValue,
              role: ""
            };
          }
        }
      }

      return null;
    },

    _normalizeRole: function (sRole) {
      return String(sRole || "")
        .trim()
        .toUpperCase();
    },

    _isLoggedIn: function () {
      return !!this._getCurrentUser();
    },

    _isPlanner: function () {
      var oUser = this._getCurrentUser();
      var sRole = this._normalizeRole(oUser && oUser.role);

      return sRole === "PLANIFICATEUR" ||
        sRole === "PLANNER" ||
        sRole === "ADMIN";
    },

    _isSupervisor: function () {
      var oUser = this._getCurrentUser();
      var sRole = this._normalizeRole(oUser && oUser.role);

      return sRole === "SUPERVISEUR" ||
        sRole === "SUPERVISOR" ||
        sRole === "ADMIN";
    },

    _goToLogin: function (sRedirectUrl) {
      var sRedirect = encodeURIComponent(sRedirectUrl || "/home/webapp/index.html");
      window.location.href = "/login/webapp/index.html?redirect=" + sRedirect;
    },

    _openProtectedService: function (sTargetUrl, sRequiredRole) {
      if (!this._isLoggedIn()) {
        MessageToast.show("Veuillez vous connecter pour accéder à ce service.");
        this._goToLogin(sTargetUrl);
        return;
      }

      if (sRequiredRole === "PLANNER" && !this._isPlanner()) {
        MessageBox.warning("Ce service est réservé au planificateur.");
        return;
      }

      if (sRequiredRole === "SUPERVISOR" && !this._isSupervisor()) {
        MessageBox.warning("Ce service est réservé au superviseur.");
        return;
      }

      window.location.href = sTargetUrl;
    },

    _startHeroAutoSlide: function () {
      var oCarousel = this.byId("heroCarousel");

      if (!oCarousel) {
        return;
      }

      setInterval(function () {
        var aPages = oCarousel.getPages();

        if (!aPages || aPages.length <= 1) {
          return;
        }

        var sActivePage = oCarousel.getActivePage();
        var iCurrentIndex = 0;

        for (var i = 0; i < aPages.length; i += 1) {
          if (aPages[i].getId() === sActivePage) {
            iCurrentIndex = i;
            break;
          }
        }

        var iNextIndex = iCurrentIndex + 1;

        if (iNextIndex >= aPages.length) {
          iNextIndex = 0;
        }

        oCarousel.setActivePage(aPages[iNextIndex].getId());
      }, 5000);
    },

    onLogin: function () {
      this._goToLogin("/home/webapp/index.html");
    },

    onLogout: function () {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("sepurUser");
      sessionStorage.removeItem("currentUser");
      sessionStorage.removeItem("sepurUser");

      MessageToast.show("Déconnexion effectuée.");

      setTimeout(function () {
        window.location.reload();
      }, 400);
    },

    onProfileMenu: function (oEvent) {
      var oUser = this._getCurrentUser() || {};
      var sName = oUser.fullName || oUser.username || oUser.email || "Utilisateur";
      var sRole = this._normalizeRole(oUser.role) || "ROLE NON DEFINI";

      var oActionSheet = new ActionSheet({
        title: sName + " - " + sRole,
        buttons: [
          new Button({
            text: "Se déconnecter",
            icon: "sap-icon://log",
            press: this.onLogout.bind(this)
          })
        ],
        afterClose: function () {
          oActionSheet.destroy();
        }
      });

      oActionSheet.openBy(oEvent.getSource());
    },

    onOpenAppMenu: function (oEvent) {
      var aButtons = [];

      if (!this._isLoggedIn()) {
        aButtons.push(new Button({
          text: "Se connecter",
          icon: "sap-icon://employee",
          press: this.onLogin.bind(this)
        }));
      }

      if (!this._isLoggedIn() || this._isPlanner()) {
        aButtons.push(new Button({
          text: "Espace planification",
          icon: "sap-icon://calendar",
          press: this.onOpenPlanning.bind(this)
        }));

        aButtons.push(new Button({
          text: "Management des tournées",
          icon: "sap-icon://shipping-status",
          press: this.onTours.bind(this)
        }));

        aButtons.push(new Button({
          text: "Management des roadmaps",
          icon: "sap-icon://map-3",
          press: this.onRoadmaps.bind(this)
        }));
      }

      if (!this._isLoggedIn() || this._isSupervisor()) {
        aButtons.push(new Button({
          text: "Espace supervision",
          icon: "sap-icon://manager-insight",
          press: this.onOpenSupervisor.bind(this)
        }));

        aButtons.push(new Button({
          text: "Validation des tournées",
          icon: "sap-icon://validate",
          press: this.onSupervisorTours.bind(this)
        }));

        aButtons.push(new Button({
          text: "Validation des roadmaps",
          icon: "sap-icon://map-3",
          press: this.onSupervisorRoadmaps.bind(this)
        }));
      }

      aButtons.push(new Button({
        text: "Accueil",
        icon: "sap-icon://home",
        press: function () {
          window.location.href = "/home/webapp/index.html";
        }
      }));

      var oActionSheet = new ActionSheet({
        title: "Applications SEPUR",
        buttons: aButtons,
        afterClose: function () {
          oActionSheet.destroy();
        }
      });

      oActionSheet.openBy(oEvent.getSource());
    },

    onOpenPlanning: function () {
      this._openProtectedService(
        "/planner-dashboard/webapp/index.html",
        "PLANNER"
      );
    },

    onTours: function () {
      this._openProtectedService(
        "/tours/webapp/index.html",
        "PLANNER"
      );
    },

    onRoadmaps: function () {
      this._openProtectedService(
        "/roadmaps/webapp/index.html",
        "PLANNER"
      );
    },

    onOpenSupervisor: function () {
      this._openProtectedService(
        "/supervisor-dashboard/webapp/index.html",
        "SUPERVISOR"
      );
    },

    onSupervisorTours: function () {
      this._openProtectedService(
        "/supervisor-tours/webapp/index.html",
        "SUPERVISOR"
      );
    },

    onSupervisorRoadmaps: function () {
      this._openProtectedService(
        "/supervisor-roadmaps/webapp/index.html",
        "SUPERVISOR"
      );
    }
  });
});
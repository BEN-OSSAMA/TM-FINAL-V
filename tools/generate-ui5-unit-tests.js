const fs = require("fs");
const path = require("path");

const appsRoot = path.join(__dirname, "..", "app");

function toUnixPath(value) {
    return value.replace(/\\/g, "/");
}

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, {
            recursive: true
        });
    }
}

function readJson(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }

    try {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
        console.error("Erreur lecture JSON :", filePath);
        return null;
    }
}

function getAppNamespace(appWebappPath) {
    const manifestPath = path.join(appWebappPath, "manifest.json");
    const manifest = readJson(manifestPath);

    if (!manifest || !manifest["sap.app"] || !manifest["sap.app"].id) {
        return null;
    }

    return manifest["sap.app"].id;
}

function getControllerFiles(controllerDir) {
    if (!fs.existsSync(controllerDir)) {
        return [];
    }

    return fs.readdirSync(controllerDir)
        .filter(function (file) {
            return file.endsWith(".controller.js");
        });
}

function createUnitHtml(appWebappPath, appNamespace) {
    const testDir = path.join(appWebappPath, "test", "unit");
    const htmlPath = path.join(testDir, "unitTests.qunit.html");

    if (fs.existsSync(htmlPath)) {
        return;
    }

    const content = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Unit Tests - ${appNamespace}</title>

    <script
        id="sap-ui-bootstrap"
        src="https://sapui5.hana.ondemand.com/resources/sap-ui-core.js"
        data-sap-ui-theme="sap_horizon"
        data-sap-ui-libs="sap.m"
        data-sap-ui-async="true"
        data-sap-ui-compatVersion="edge"
        data-sap-ui-resourceroots='{
            "${appNamespace}": "../../",
            "${appNamespace}.test.unit": "./"
        }'>
    </script>

    <link rel="stylesheet" href="https://sapui5.hana.ondemand.com/resources/sap/ui/thirdparty/qunit-2.css">
    <script src="https://sapui5.hana.ondemand.com/resources/sap/ui/thirdparty/qunit-2.js"></script>
    <script src="https://sapui5.hana.ondemand.com/resources/sap/ui/qunit/qunit-junit.js"></script>
    <script src="https://sapui5.hana.ondemand.com/resources/sap/ui/qunit/qunit-coverage.js"></script>

    <script>
        sap.ui.getCore().attachInit(function () {
            sap.ui.require([
                "${appNamespace}/test/unit/allTests"
            ], function () {
                QUnit.start();
            });
        });

        QUnit.config.autostart = false;
    </script>
</head>

<body>
    <div id="qunit"></div>
    <div id="qunit-fixture"></div>
</body>
</html>
`;

    fs.writeFileSync(htmlPath, content, "utf8");
}

function createAllTests(appWebappPath, appNamespace, controllerFiles) {
    const testDir = path.join(appWebappPath, "test", "unit");
    const allTestsPath = path.join(testDir, "allTests.js");

    const requires = controllerFiles.map(function (file) {
        const testName = file.replace(".js", ".qunit");
        return `"${appNamespace}/test/unit/controller/${testName}"`;
    });

    const content = `sap.ui.define([
    ${requires.join(",\n    ")}
], function () {
    "use strict";
});
`;

    fs.writeFileSync(allTestsPath, content, "utf8");
}

function createControllerTest(appWebappPath, appNamespace, controllerFile) {
    const controllerName = controllerFile.replace(".js", "");
    const testDir = path.join(appWebappPath, "test", "unit", "controller");
    const testPath = path.join(testDir, controllerName + ".qunit.js");

    if (fs.existsSync(testPath)) {
        return;
    }

    const controllerModule = `${appNamespace}/controller/${controllerName}`;

    const content = `sap.ui.define([
    "${controllerModule}"
], function (ControllerUnderTest) {
    "use strict";

    QUnit.module("${controllerName}");

    QUnit.test("Le contrôleur doit être chargé correctement", function (assert) {
        assert.ok(ControllerUnderTest, "Le contrôleur ${controllerName} est chargé.");
    });

    QUnit.test("Le contrôleur doit contenir une méthode onInit si elle existe dans l'application", function (assert) {
        if (ControllerUnderTest.prototype.onInit) {
            assert.strictEqual(
                typeof ControllerUnderTest.prototype.onInit,
                "function",
                "La méthode onInit existe."
            );
        } else {
            assert.ok(true, "Aucune méthode onInit n'est définie pour ce contrôleur.");
        }
    });
});
`;

    fs.writeFileSync(testPath, content, "utf8");
}

function processApp(appName) {
    const appPath = path.join(appsRoot, appName);
    const webappPath = path.join(appPath, "webapp");

    if (!fs.existsSync(webappPath)) {
        return;
    }

    const appNamespace = getAppNamespace(webappPath);

    if (!appNamespace) {
        console.log("Application ignorée, namespace introuvable :", appName);
        return;
    }

    const controllerDir = path.join(webappPath, "controller");
    const controllerFiles = getControllerFiles(controllerDir);

    if (!controllerFiles.length) {
        console.log("Aucun contrôleur trouvé pour :", appName);
        return;
    }

    ensureDir(path.join(webappPath, "test", "unit", "controller"));

    createUnitHtml(webappPath, appNamespace);
    createAllTests(webappPath, appNamespace, controllerFiles);

    controllerFiles.forEach(function (controllerFile) {
        createControllerTest(webappPath, appNamespace, controllerFile);
    });

    console.log("Tests générés pour :", appName, "-", appNamespace);
}

function main() {
    if (!fs.existsSync(appsRoot)) {
        console.error("Dossier app introuvable.");
        process.exit(1);
    }

    const appFolders = fs.readdirSync(appsRoot).filter(function (name) {
        return fs.statSync(path.join(appsRoot, name)).isDirectory();
    });

    appFolders.forEach(processApp);

    console.log("Génération terminée.");
}

main();
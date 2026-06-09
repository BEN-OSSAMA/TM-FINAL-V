const cds = require('@sap/cds');

const TOUR_STATUS = {
  CREATED: 'CREATED',
  VALIDATED: 'VALIDATED',
  REJECTED: 'REJECTED'
};

const ROADMAP_STATUS = {
  CREATED: 'CREATED',
  VALIDATED: 'VALIDATED',
  REJECTED: 'REJECTED'
};

function reject(req, message, status = 400) {
  return req.reject(status, message);
}

/* ===================================================== */
/* STATUS HELPERS                                        */
/* ===================================================== */

function normalizeTourStatus(status) {
  if (['DRAFT', 'PENDING', 'CREATED'].includes(status)) {
    return TOUR_STATUS.CREATED;
  }

  if (['ACCEPTED', 'VALIDATED', 'COMPLETED', 'ASSIGNED'].includes(status)) {
    return TOUR_STATUS.VALIDATED;
  }

  if (['REJECTED', 'CANCELLED'].includes(status)) {
    return TOUR_STATUS.REJECTED;
  }

  return TOUR_STATUS.CREATED;
}

function normalizeRoadmapStatus(status) {
  if (['DRAFT', 'PENDING', 'CREATED'].includes(status)) {
    return ROADMAP_STATUS.CREATED;
  }

  if (['ACTIVE', 'VALIDATED', 'COMPLETED'].includes(status)) {
    return ROADMAP_STATUS.VALIDATED;
  }

  if (['REJECTED', 'CANCELLED'].includes(status)) {
    return ROADMAP_STATUS.REJECTED;
  }

  return ROADMAP_STATUS.CREATED;
}

function isCreatedStatus(status) {
  return normalizeTourStatus(status) === TOUR_STATUS.CREATED;
}

function isValidatedStatus(status) {
  return normalizeTourStatus(status) === TOUR_STATUS.VALIDATED;
}

function isRejectedStatus(status) {
  return normalizeTourStatus(status) === TOUR_STATUS.REJECTED;
}

function isCreatedRoadmapStatus(status) {
  return normalizeRoadmapStatus(status) === ROADMAP_STATUS.CREATED;
}

function isValidatedRoadmapStatus(status) {
  return normalizeRoadmapStatus(status) === ROADMAP_STATUS.VALIDATED;
}

function isRejectedRoadmapStatus(status) {
  return normalizeRoadmapStatus(status) === ROADMAP_STATUS.REJECTED;
}

const DELETABLE_TOUR_STATUSES = new Set([
  'DRAFT',
  'PENDING',
  'CREATED',
  'REJECTED',
  'CANCELLED'
]);

function validateTourMandatoryFields(req, data) {
  const clientID = data.client_ID || data.client?.ID;

  if (!clientID) {
    return reject(req, 'Le client est obligatoire.');
  }

  if (!data.tourDate) {
    return reject(req, 'La date de collecte est obligatoire.');
  }

  const materialID = data.material_ID || data.material?.ID;

  if (!materialID) {
    return reject(req, 'Le matériau est obligatoire.');
  }

  const quantity = Number(data.quantity);

  if (data.quantity === undefined || data.quantity === null || Number.isNaN(quantity) || quantity <= 0) {
    return reject(req, 'La quantité doit être supérieure à zéro.');
  }

  if (!data.unitOfMeasure || !String(data.unitOfMeasure).trim()) {
    return reject(req, "L'unité de mesure est obligatoire.");
  }

  return null;
}

/* ===================================================== */
/* CODE GENERATOR                                        */
/* ===================================================== */

async function nextCode(entityName, fieldName, prefix) {
  const entities = cds.entities('route.management');
  const target = entities[entityName];

  const rows = await SELECT.from(target)
    .columns(fieldName)
    .orderBy(`${fieldName} desc`)
    .limit(1);

  let seq = 1;

  if (rows.length && rows[0][fieldName]) {
    const match = String(rows[0][fieldName]).match(/(\d+)$/);
    if (match) {
      seq = parseInt(match[1], 10) + 1;
    }
  }

  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(seq).padStart(4, '0')}`;
}

module.exports = class RouteManagementService extends cds.ApplicationService {
  init() {
    const {
      Users,
      Tours,
      Roadmaps,
      RoadmapTours,
      RoadmapSteps,
      DecisionHistories,
      TourCollectionPoints,
      TourHumanResources,
      TourMaterialResources,
      CollectionPoints,
      Clients,
      Materials,
      HumanResources,
      MaterialResources,
      Vehicles,
      Drivers
    } = cds.entities('route.management');

    /* ===================================================== */
    /* READ ENRICHMENT — TOURS                               */
    /* ===================================================== */

    this.after('READ', 'Tours', function (rows) {
      const list = Array.isArray(rows) ? rows : [rows];

      for (const tour of list) {
        if (!tour) {
          continue;
        }

        const normalizedStatus = normalizeTourStatus(tour.status);
        tour.status = normalizedStatus;
        tour.tourNumber = tour.tourNumber || tour.tourCode;
        tour.collectionDate = tour.collectionDate || tour.tourDate;

        if (tour.humanResources && Array.isArray(tour.humanResources)) {
          tour.humanResourcesLabel = tour.humanResources
            .map((entry) => entry.humanResourceName || entry.driverLastName || entry.role)
            .filter(Boolean)
            .join(', ');
        }

        if (tour.materialResources && Array.isArray(tour.materialResources)) {
          tour.materialResourcesLabel = tour.materialResources
            .map((entry) => entry.materialResourceName || entry.vehicleRegistration || entry.usage)
            .filter(Boolean)
            .join(', ');
        }

        if (normalizedStatus === TOUR_STATUS.VALIDATED) {
          tour.statusCriticality = 3;
          tour.canValidate = false;
          tour.canReject = false;
        } else if (normalizedStatus === TOUR_STATUS.REJECTED) {
          tour.statusCriticality = 1;
          tour.canValidate = false;
          tour.canReject = false;
        } else {
          tour.statusCriticality = 2;
          tour.canValidate = true;
          tour.canReject = true;
        }
      }
    });

    /* ===================================================== */
    /* READ ENRICHMENT — ROADMAPS                            */
    /* ===================================================== */

    this.after('READ', 'Roadmaps', function (rows) {
      const list = Array.isArray(rows) ? rows : [rows];

      for (const roadmap of list) {
        if (!roadmap) {
          continue;
        }

        const normalizedStatus = normalizeRoadmapStatus(roadmap.status);
        roadmap.status = normalizedStatus;

        if (normalizedStatus === ROADMAP_STATUS.VALIDATED) {
          roadmap.statusCriticality = 3;
          roadmap.canValidate = false;
          roadmap.canReject = false;
        } else if (normalizedStatus === ROADMAP_STATUS.REJECTED) {
          roadmap.statusCriticality = 1;
          roadmap.canValidate = false;
          roadmap.canReject = false;
        } else {
          roadmap.statusCriticality = 2;
          roadmap.canValidate = true;
          roadmap.canReject = true;
        }
      }
    });

    /* ===================================================== */
    /* AUTHENTICATION                                        */
    /* ===================================================== */

    this.on('login', async (req) => {
      const email = req.data.email || req.data.username;
      const { password } = req.data;

      if (!email || !password) {
        return reject(req, 'E-mail et mot de passe requis.');
      }

      let user = await SELECT.one.from(Users).where({
        email,
        password
      });

      if (!user) {
        user = await SELECT.one.from(Users).where({
          username: email,
          password
        });
      }

      if (!user) {
        return reject(req, 'Identifiants incorrects.', 401);
      }

      if (!user.active) {
        return reject(req, 'Utilisateur inactif.', 403);
      }

      return {
        ID: user.ID,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        active: user.active
      };
    });

    /* ===================================================== */
    /* TOURS — BEFORE CREATE / UPDATE                        */
    /* ===================================================== */

    this.before('CREATE', 'Tours', async (req) => {
      const validationError = validateTourMandatoryFields(req, req.data);

      if (validationError) {
        return validationError;
      }

      if (!req.data.tourCode) {
        req.data.tourCode = await nextCode('Tours', 'tourCode', 'TOUR');
      }

      if (!req.data.status) {
        req.data.status = TOUR_STATUS.CREATED;
      }

      if (!req.data.collectionType && req.data.material_ID) {
        const material = await SELECT.one.from(Materials).where({ ID: req.data.material_ID });

        if (material) {
          req.data.collectionType = material.description;
        }
      }
    });

    this.before('DELETE', 'Tours', async (req) => {
      const id = req.data?.ID || req.params?.[0]?.ID;

      if (!id) {
        return;
      }

      const tour = await SELECT.one.from(Tours).where({ ID: id });

      if (!tour) {
        return reject(req, 'Tournée introuvable.');
      }

      if (!DELETABLE_TOUR_STATUSES.has(tour.status)) {
        return reject(
          req,
          'Seules les tournées en brouillon, créées ou rejetées peuvent être supprimées.'
        );
      }

      if (tour.roadmap_ID) {
        return reject(req, 'Cette tournée est liée à une roadmap et ne peut pas être supprimée.');
      }
    });

    this.before('UPDATE', 'Tours', async (req) => {
      const id = req.data.ID || req.params?.[0]?.ID;

      if (!id) {
        return;
      }

      const tour = await SELECT.one.from(Tours).where({ ID: id });

      if (!tour) {
        return;
      }

      const normalizedStatus = normalizeTourStatus(tour.status);

      const technicalFields = new Set([
        'ID',
        'IsActiveEntity',
        'HasActiveEntity',
        'HasDraftEntity',
        'DraftAdministrativeData',
        'DraftAdministrativeData_DraftUUID',
        'SiblingEntity',
        'statusCriticality',
        'canValidate',
        'canReject',
        'clientName',
        'driverFirstName',
        'driverLastName',
        'vehicleRegistration',
        'createdByName',
        'tourPoints',
        'decisions',
        'roadmap',
        'humanResources',
        'materialResources',
        'createdAt',
        'createdBy',
        'modifiedAt',
        'modifiedBy'
      ]);

      const keys = Object.keys(req.data).filter((key) => {
        return !key.startsWith('_') && !technicalFields.has(key);
      });

      const allowedFields = new Set([
        'tourCode',
        'tourDate',
        'zone',
        'collectionType',
        'description',
        'quantity',
        'unitOfMeasure',
        'status',
        'rejectionReason',
        'client_ID',
        'client',
        'material_ID',
        'material',
        'vehicle_ID',
        'vehicle',
        'driver_ID',
        'driver',
        'roadmap_ID',
        'roadmap',
        'createdByUser_ID',
        'createdByUser',
        'updatedAt'
      ]);

      const forbidden = keys.filter((key) => !allowedFields.has(key));

      if (forbidden.length) {
        return reject(
          req,
          `Modification interdite pour les champs suivants : ${forbidden.join(', ')}`
        );
      }

      if (normalizedStatus === TOUR_STATUS.REJECTED) {
        const businessFields = [
          'tourDate',
          'zone',
          'collectionType',
          'description',
          'quantity',
          'unitOfMeasure',
          'client_ID',
          'client',
          'material_ID',
          'material',
          'vehicle_ID',
          'vehicle',
          'driver_ID',
          'driver'
        ];

        const hasBusinessModification = keys.some((key) => businessFields.includes(key));

        if (hasBusinessModification) {
          req.data.status = TOUR_STATUS.CREATED;
          req.data.rejectionReason = null;
        }
      }
    });

    /* ===================================================== */
    /* ROADMAPS — BEFORE CREATE / UPDATE                     */
    /* ===================================================== */

    this.before('CREATE', 'Roadmaps', async (req) => {
      if (!req.data.roadmapCode) {
        req.data.roadmapCode = await nextCode('Roadmaps', 'roadmapCode', 'RM');
      }

      if (!req.data.status) {
        req.data.status = ROADMAP_STATUS.CREATED;
      }
    });

    this.before('UPDATE', 'Roadmaps', async (req) => {
      const id = req.data.ID || req.params?.[0]?.ID;

      if (!id) {
        return;
      }

      const roadmap = await SELECT.one.from(Roadmaps).where({ ID: id });

      if (!roadmap) {
        return;
      }

      const technicalFields = new Set([
        'ID',
        'IsActiveEntity',
        'HasActiveEntity',
        'HasDraftEntity',
        'DraftAdministrativeData',
        'DraftAdministrativeData_DraftUUID',
        'SiblingEntity',
        'statusCriticality',
        'canValidate',
        'canReject',
        'tourCode',
        'tourDate',
        'tourZone',
        'tourCollectionType',
        'tourClientName',
        'tourDriverFirstName',
        'tourDriverLastName',
        'tourVehicleRegistration',
        'assignedTours',
        'steps',
        'createdAt',
        'createdBy',
        'modifiedAt',
        'modifiedBy'
      ]);

      const keys = Object.keys(req.data).filter((key) => {
        return !key.startsWith('_') && !technicalFields.has(key);
      });

      const allowedFields = new Set([
        'roadmapCode',
        'startDate',
        'endDate',
        'status',
        'rejectionReason',
        'tour_ID',
        'tour',
        'updatedAt'
      ]);

      const forbidden = keys.filter((key) => !allowedFields.has(key));

      if (forbidden.length) {
        return reject(
          req,
          `Modification interdite pour les champs suivants : ${forbidden.join(', ')}`
        );
      }

      const normalizedStatus = normalizeRoadmapStatus(roadmap.status);

      if (normalizedStatus === ROADMAP_STATUS.REJECTED) {
        const businessFields = [
          'roadmapCode',
          'startDate',
          'endDate',
          'tour_ID',
          'tour'
        ];

        const hasBusinessModification = keys.some((key) => businessFields.includes(key));

        if (hasBusinessModification) {
          req.data.status = ROADMAP_STATUS.CREATED;
          req.data.rejectionReason = null;
        }
      }
    });

    /* ===================================================== */
    /* ROADMAP TOURS                                         */
    /* ===================================================== */

    this.before('CREATE', 'RoadmapTours', async (req) => {
      if (!req.data.sequence) {
        const roadmapID = req.data.roadmap_ID;

        if (roadmapID) {
          const existing = await SELECT.from(RoadmapTours)
            .columns('sequence')
            .where({ roadmap_ID: roadmapID })
            .orderBy('sequence desc')
            .limit(1);

          req.data.sequence = existing.length && existing[0].sequence
            ? existing[0].sequence + 1
            : 1;
        }
      }
    });

    this.before('UPDATE', 'RoadmapTours', async (req) => {
      const technicalFields = new Set([
        'ID',
        'IsActiveEntity',
        'HasActiveEntity',
        'HasDraftEntity',
        'DraftAdministrativeData',
        'DraftAdministrativeData_DraftUUID',
        'SiblingEntity',
        'roadmapCode',
        'tourCode',
        'tourDate',
        'tourZone',
        'tourCollectionType',
        'clientName',
        'driverFirstName',
        'driverLastName',
        'vehicleRegistration',
        'createdAt',
        'createdBy',
        'modifiedAt',
        'modifiedBy'
      ]);

      const keys = Object.keys(req.data).filter((key) => {
        return !key.startsWith('_') && !technicalFields.has(key);
      });

      const allowedFields = new Set([
        'sequence',
        'note',
        'roadmap_ID',
        'roadmap',
        'tour_ID',
        'tour'
      ]);

      const forbidden = keys.filter((key) => !allowedFields.has(key));

      if (forbidden.length) {
        return reject(
          req,
          `Modification interdite pour les champs suivants : ${forbidden.join(', ')}`
        );
      }
    });

    /* ===================================================== */
    /* TOURS — GLOBAL ACTIONS                                */
    /* ===================================================== */

    this.on('submitTour', async (req) => {
      const { tourID } = req.data;

      const tour = await SELECT.one.from(Tours).where({ ID: tourID });

      if (!tour) {
        return reject(req, 'Tournée introuvable.');
      }

      if (!isCreatedStatus(tour.status) && !isRejectedStatus(tour.status)) {
        return reject(req, 'Seules les tournées créées ou rejetées peuvent être soumises.');
      }

      await UPDATE(Tours)
        .set({
          status: TOUR_STATUS.CREATED,
          rejectionReason: null,
          updatedAt: new Date().toISOString()
        })
        .where({ ID: tourID });

      return SELECT.one.from(Tours).where({ ID: tourID });
    });

    this.on('acceptTour', async (req) => {
      const { tourID, supervisorID } = req.data;

      const tour = await SELECT.one.from(Tours).where({ ID: tourID });

      if (!tour) {
        return reject(req, 'Tournée introuvable.');
      }

      if (!isCreatedStatus(tour.status)) {
        return reject(req, 'Seules les tournées créées peuvent être validées.');
      }

      const supervisor = await SELECT.one.from(Users).where({ ID: supervisorID });

      if (!supervisor) {
        return reject(req, 'Superviseur introuvable.');
      }

      if (supervisor.role !== 'SUPERVISEUR') {
        return reject(req, 'Seul un superviseur peut valider une tournée.');
      }

      await UPDATE(Tours)
        .set({
          status: TOUR_STATUS.VALIDATED,
          rejectionReason: null,
          updatedAt: new Date().toISOString()
        })
        .where({ ID: tourID });

      await INSERT.into(DecisionHistories).entries({
        ID: cds.utils.uuid(),
        decision: TOUR_STATUS.VALIDATED,
        reason: null,
        decidedBy_ID: supervisorID,
        tour_ID: tourID
      });

      return SELECT.one.from(Tours).where({ ID: tourID });
    });

    this.on('rejectTour', async (req) => {
      const { tourID, supervisorID, reason } = req.data;

      if (!reason || !String(reason).trim()) {
        return reject(req, 'Le motif de refus est obligatoire.');
      }

      const tour = await SELECT.one.from(Tours).where({ ID: tourID });

      if (!tour) {
        return reject(req, 'Tournée introuvable.');
      }

      if (!isCreatedStatus(tour.status)) {
        return reject(req, 'Seules les tournées créées peuvent être rejetées.');
      }

      const supervisor = await SELECT.one.from(Users).where({ ID: supervisorID });

      if (!supervisor) {
        return reject(req, 'Superviseur introuvable.');
      }

      if (supervisor.role !== 'SUPERVISEUR') {
        return reject(req, 'Seul un superviseur peut rejeter une tournée.');
      }

      const trimmedReason = String(reason).trim();

      await UPDATE(Tours)
        .set({
          status: TOUR_STATUS.REJECTED,
          rejectionReason: trimmedReason,
          updatedAt: new Date().toISOString()
        })
        .where({ ID: tourID });

      await INSERT.into(DecisionHistories).entries({
        ID: cds.utils.uuid(),
        decision: TOUR_STATUS.REJECTED,
        reason: trimmedReason,
        decidedBy_ID: supervisorID,
        tour_ID: tourID
      });

      return SELECT.one.from(Tours).where({ ID: tourID });
    });

    /* ===================================================== */
    /* TOURS — BOUND ACTIONS FOR FIORI                       */
    /* ===================================================== */

    this.on('validate', 'Tours', async (req) => {
      const tourID = req.params?.[0]?.ID;

      if (!tourID) {
        return reject(req, 'Identifiant de tournée manquant.');
      }

      const tour = await SELECT.one.from(Tours).where({ ID: tourID });

      if (!tour) {
        return reject(req, 'Tournée introuvable.');
      }

      if (!isCreatedStatus(tour.status)) {
        return reject(req, 'Seules les tournées créées peuvent être validées.');
      }

      await UPDATE(Tours)
        .set({
          status: TOUR_STATUS.VALIDATED,
          rejectionReason: null,
          updatedAt: new Date().toISOString()
        })
        .where({ ID: tourID });

      await INSERT.into(DecisionHistories).entries({
        ID: cds.utils.uuid(),
        decision: TOUR_STATUS.VALIDATED,
        reason: null,
        tour_ID: tourID
      });

      return SELECT.one.from(Tours).where({ ID: tourID });
    });

    this.on('reject', 'Tours', async (req) => {
      const tourID = req.params?.[0]?.ID;
      const reason = req.data.reason;

      if (!tourID) {
        return reject(req, 'Identifiant de tournée manquant.');
      }

      if (!reason || !String(reason).trim()) {
        return reject(req, 'Le motif de refus est obligatoire.');
      }

      const tour = await SELECT.one.from(Tours).where({ ID: tourID });

      if (!tour) {
        return reject(req, 'Tournée introuvable.');
      }

      if (!isCreatedStatus(tour.status)) {
        return reject(req, 'Seules les tournées créées peuvent être rejetées.');
      }

      const trimmedReason = String(reason).trim();

      await UPDATE(Tours)
        .set({
          status: TOUR_STATUS.REJECTED,
          rejectionReason: trimmedReason,
          updatedAt: new Date().toISOString()
        })
        .where({ ID: tourID });

      await INSERT.into(DecisionHistories).entries({
        ID: cds.utils.uuid(),
        decision: TOUR_STATUS.REJECTED,
        reason: trimmedReason,
        tour_ID: tourID
      });

      return SELECT.one.from(Tours).where({ ID: tourID });
    });

    /* ===================================================== */
    /* ROADMAPS — BOUND ACTIONS FOR FIORI                    */
    /* ===================================================== */

    this.on('validateRoadmap', 'Roadmaps', async (req) => {
      const roadmapID = req.params?.[0]?.ID;

      if (!roadmapID) {
        return reject(req, 'Identifiant de roadmap manquant.');
      }

      const roadmap = await SELECT.one.from(Roadmaps).where({ ID: roadmapID });

      if (!roadmap) {
        return reject(req, 'Roadmap introuvable.');
      }

      if (!isCreatedRoadmapStatus(roadmap.status)) {
        return reject(req, 'Seules les roadmaps créées peuvent être validées.');
      }

      await UPDATE(Roadmaps)
        .set({
          status: ROADMAP_STATUS.VALIDATED,
          rejectionReason: null,
          updatedAt: new Date().toISOString()
        })
        .where({ ID: roadmapID });

      return SELECT.one.from(Roadmaps).where({ ID: roadmapID });
    });

    this.on('rejectRoadmap', 'Roadmaps', async (req) => {
      const roadmapID = req.params?.[0]?.ID;
      const reason = req.data.reason;

      if (!roadmapID) {
        return reject(req, 'Identifiant de roadmap manquant.');
      }

      if (!reason || !String(reason).trim()) {
        return reject(req, 'Le motif de refus est obligatoire.');
      }

      const roadmap = await SELECT.one.from(Roadmaps).where({ ID: roadmapID });

      if (!roadmap) {
        return reject(req, 'Roadmap introuvable.');
      }

      if (!isCreatedRoadmapStatus(roadmap.status)) {
        return reject(req, 'Seules les roadmaps créées peuvent être rejetées.');
      }

      const trimmedReason = String(reason).trim();

      await UPDATE(Roadmaps)
        .set({
          status: ROADMAP_STATUS.REJECTED,
          rejectionReason: trimmedReason,
          updatedAt: new Date().toISOString()
        })
        .where({ ID: roadmapID });

      return SELECT.one.from(Roadmaps).where({ ID: roadmapID });
    });

    /* ===================================================== */
    /* ROADMAP TOURS — UPDATE RESOURCES ACTION               */
    /* ===================================================== */

    this.on('updateResources', 'RoadmapTours', async (req) => {
      const roadmapTourID = req.params?.[0]?.ID;
      const { clientID, driverID, vehicleID } = req.data;

      if (!roadmapTourID) {
        return reject(req, 'Identifiant de ligne roadmap/tournée manquant.');
      }

      const roadmapTour = await SELECT.one.from(RoadmapTours).where({ ID: roadmapTourID });

      if (!roadmapTour) {
        return reject(req, 'Ligne roadmap/tournée introuvable.');
      }

      if (!roadmapTour.tour_ID) {
        return reject(req, 'Aucune tournée associée à cette ligne.');
      }

      const updateData = {
        updatedAt: new Date().toISOString()
      };

      if (clientID) {
        const client = await SELECT.one.from(Clients).where({ ID: clientID });
        if (!client) {
          return reject(req, 'Client introuvable.');
        }
        updateData.client_ID = clientID;
      }

      if (driverID) {
        const driver = await SELECT.one.from(Drivers).where({ ID: driverID });
        if (!driver) {
          return reject(req, 'Ressource humaine introuvable.');
        }
        updateData.driver_ID = driverID;
      }

      if (vehicleID) {
        const vehicle = await SELECT.one.from(Vehicles).where({ ID: vehicleID });
        if (!vehicle) {
          return reject(req, 'Ressource matérielle introuvable.');
        }
        updateData.vehicle_ID = vehicleID;
      }

      await UPDATE(Tours)
        .set(updateData)
        .where({ ID: roadmapTour.tour_ID });

      return SELECT.one.from(RoadmapTours).where({ ID: roadmapTourID });
    });

    /* ===================================================== */
    /* CREATE ROADMAP FROM TOUR                              */
    /* ===================================================== */

    this.on('createRoadmapFromTour', async (req) => {
      const { tourID } = req.data;

      const tour = await SELECT.one.from(Tours).where({ ID: tourID });

      if (!tour) {
        return reject(req, 'Tournée introuvable.');
      }

      if (!isValidatedStatus(tour.status)) {
        return reject(req, 'La roadmap ne peut être créée que depuis une tournée validée.');
      }

      const existing = await SELECT.one.from(Roadmaps).where({ tour_ID: tourID });

      if (existing) {
        return reject(req, 'Une roadmap existe déjà pour cette tournée.');
      }

      return cds.tx(req, async () => {
        const roadmapCode = await nextCode('Roadmaps', 'roadmapCode', 'RM');
        const roadmapID = cds.utils.uuid();
        const startDate = tour.tourDate || new Date().toISOString().slice(0, 10);

        await INSERT.into(Roadmaps).entries({
          ID: roadmapID,
          roadmapCode,
          status: ROADMAP_STATUS.CREATED,
          startDate,
          endDate: startDate,
          rejectionReason: null,
          tour_ID: tourID
        });

        await INSERT.into(RoadmapTours).entries({
          ID: cds.utils.uuid(),
          sequence: 1,
          note: 'Tournée principale',
          roadmap_ID: roadmapID,
          tour_ID: tourID
        });

        let points = await SELECT.from(TourCollectionPoints)
          .where({ tour_ID: tourID })
          .orderBy('sequence');

        if (!points.length && tour.client_ID) {
          points = await SELECT.from(CollectionPoints)
            .where({ client_ID: tour.client_ID })
            .orderBy('label');
        }

        let seq = 1;

        for (const point of points) {
          const collectionPointID = point.collectionPoint_ID || point.ID;

          await INSERT.into(RoadmapSteps).entries({
            ID: cds.utils.uuid(),
            sequence: point.sequence || seq,
            plannedArrivalTime: `08:${String(seq).padStart(2, '0')}:00`,
            status: 'PLANNED',
            roadmap_ID: roadmapID,
            collectionPoint_ID: collectionPointID
          });

          seq += 1;
        }

        return SELECT.one.from(Roadmaps).where({ ID: roadmapID });
      });
    });

    /* ===================================================== */
    /* STATISTICS                                            */
    /* ===================================================== */

    this.on('getPlannerStats', async (req) => {
      const { userID } = req.data || {};
      const where = userID ? { createdByUser_ID: userID } : {};

      const tours = await SELECT.from(Tours).columns('status').where(where);
      const roadmaps = await SELECT.from(Roadmaps).columns('status');

      return {
        totalTours: tours.length,
        draftTours: tours.filter((tour) => isCreatedStatus(tour.status)).length,
        pendingTours: tours.filter((tour) => isCreatedStatus(tour.status)).length,
        acceptedTours: tours.filter((tour) => isValidatedStatus(tour.status)).length,
        rejectedTours: tours.filter((tour) => isRejectedStatus(tour.status)).length,
        totalRoadmaps: roadmaps.length
      };
    });

    this.on('getSupervisorStats', async () => {
      const tours = await SELECT.from(Tours).columns('status');
      const roadmaps = await SELECT.from(Roadmaps).columns('status');

      return {
        totalTours: tours.length,
        pendingValidation: tours.filter((tour) => isCreatedStatus(tour.status)).length,
        acceptedTours: tours.filter((tour) => isValidatedStatus(tour.status)).length,
        rejectedTours: tours.filter((tour) => isRejectedStatus(tour.status)).length,
        activeRoadmaps: roadmaps.filter((roadmap) => isValidatedRoadmapStatus(roadmap.status)).length,
        totalRoadmaps: roadmaps.length
      };
    });

    this.on('getPendingTours', async () => {
      const tours = await SELECT.from(Tours);
      return tours.filter((tour) => isCreatedStatus(tour.status));
    });

    /* ===================================================== */
    /* TOUR DETAILS                                          */
    /* ===================================================== */

    this.on('getTourDetails', async (req) => {
      const { tourID } = req.data;

      const tour = await SELECT.one.from(Tours).where({ ID: tourID });

      if (!tour) {
        return reject(req, 'Tournée introuvable.');
      }

      const [client, vehicle, driver, roadmap, decisions, tourPoints] = await Promise.all([
        tour.client_ID ? SELECT.one.from(Clients).where({ ID: tour.client_ID }) : null,
        tour.vehicle_ID ? SELECT.one.from(Vehicles).where({ ID: tour.vehicle_ID }) : null,
        tour.driver_ID ? SELECT.one.from(Drivers).where({ ID: tour.driver_ID }) : null,
        SELECT.one.from(Roadmaps).where({ tour_ID: tourID }),
        SELECT.from(DecisionHistories).where({ tour_ID: tourID }),
        SELECT.from(TourCollectionPoints).where({ tour_ID: tourID })
      ]);

      const driverName = driver
        ? `${driver.firstName || ''} ${driver.lastName || ''}`.trim()
        : '';

      return {
        tourID: tour.ID,
        tourCode: tour.tourCode,
        tourDate: tour.tourDate,
        zone: tour.zone,
        collectionType: tour.collectionType,
        description: tour.description,
        status: normalizeTourStatus(tour.status),
        rejectionReason: tour.rejectionReason,
        clientName: client?.name || '',
        vehicleRegistration: vehicle?.registrationNumber || '',
        driverName,
        roadmapCode: roadmap?.roadmapCode || '',
        roadmapStatus: roadmap ? normalizeRoadmapStatus(roadmap.status) : '',
        decisionsCount: decisions.length,
        tourPointsCount: tourPoints.length
      };
    });

    return super.init();
  }
};
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

// function normalizeRoadmapStatus(status) {
//   if (['DRAFT', 'PENDING', 'CREATED'].includes(status)) {
//     return ROADMAP_STATUS.CREATED;
//   }

//   if (['ACTIVE', 'VALIDATED', 'COMPLETED'].includes(status)) {
//     return ROADMAP_STATUS.VALIDATED;
//   }

//   if (['REJECTED', 'CANCELLED'].includes(status)) {
//     return ROADMAP_STATUS.REJECTED;
//   }

//   return ROADMAP_STATUS.CREATED;
// }

function normalizeRoadmapStatus(status) {
  const normalized = String(status || '')
    .trim()
    .toUpperCase();

  if (['DRAFT', 'PENDING', 'CREATED'].includes(normalized)) {
    return ROADMAP_STATUS.CREATED;
  }

  if (['ACTIVE', 'VALIDATED', 'COMPLETED'].includes(normalized)) {
    return ROADMAP_STATUS.VALIDATED;
  }

  if (['REJECTED', 'CANCELLED'].includes(normalized)) {
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

/* ===================================================== */
/* FIELD COMPATIBILITY HELPERS                           */
/* ===================================================== */

function syncTourPayload(data) {
  if (!data) {
    return;
  }

  if (data.tourNumber && !data.tourCode) {
    data.tourCode = data.tourNumber;
  }

  if (data.tourCode && !data.tourNumber) {
    data.tourNumber = data.tourCode;
  }

  if (data.collectionDate && !data.tourDate) {
    data.tourDate = data.collectionDate;
  }

  if (data.tourDate && !data.collectionDate) {
    data.collectionDate = data.tourDate;
  }

  if (data.remarks && !data.description) {
    data.description = data.remarks;
  }

  if (data.description && !data.remarks) {
    data.remarks = data.description;
  }
}

function syncRoadmapPayload(data) {
  if (!data) {
    return;
  }

  if (data.roadmapNumber && !data.roadmapCode) {
    data.roadmapCode = data.roadmapNumber;
  }

  if (data.roadmapCode && !data.roadmapNumber) {
    data.roadmapNumber = data.roadmapCode;
  }

  if (data.startDate && (!data.month || !data.year)) {
    const d = new Date(data.startDate);
    if (!Number.isNaN(d.getTime())) {
      data.month = data.month || d.getMonth() + 1;
      data.year = data.year || d.getFullYear();
    }
  }

  if (data.month && data.year && !data.startDate) {
    const month = String(data.month).padStart(2, '0');
    data.startDate = `${data.year}-${month}-01`;
  }
}

function enrichTourAliases(tour) {
  if (!tour) {
    return;
  }

  tour.tourNumber = tour.tourNumber || tour.tourCode;
  tour.tourCode = tour.tourCode || tour.tourNumber;

  tour.collectionDate = tour.collectionDate || tour.tourDate;
  tour.tourDate = tour.tourDate || tour.collectionDate;

  tour.remarks = tour.remarks || tour.description;
  tour.description = tour.description || tour.remarks;
}

function enrichRoadmapAliases(roadmap) {
  if (!roadmap) {
    return;
  }

  roadmap.roadmapNumber = roadmap.roadmapNumber || roadmap.roadmapCode;
  roadmap.roadmapCode = roadmap.roadmapCode || roadmap.roadmapNumber;

  if (roadmap.startDate && (!roadmap.month || !roadmap.year)) {
    const d = new Date(roadmap.startDate);
    if (!Number.isNaN(d.getTime())) {
      roadmap.month = roadmap.month || d.getMonth() + 1;
      roadmap.year = roadmap.year || d.getFullYear();
    }
  }
}

function pad2(value) {
  return String(value).padStart(2, '0');
}

function monthRange(year, month) {
  const y = Number(year);
  const m = Number(month);

  const startDate = `${y}-${pad2(m)}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const endDate = `${y}-${pad2(m)}-${pad2(lastDay)}`;

  return {
    startDate,
    endDate
  };
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
      CollectionPoints,
      Clients,
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

         enrichTourAliases(tour);


        const normalizedStatus = normalizeTourStatus(tour.status);
        tour.status = normalizedStatus;

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
            enrichRoadmapAliases(roadmap);

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
  syncTourPayload(req.data);

  const generatedCode = await nextCode('Tours', 'tourCode', 'TOUR');

  req.data.tourCode = generatedCode;
  req.data.tourNumber = generatedCode;

  if (!req.data.status) {
    req.data.status = TOUR_STATUS.CREATED;
  }

  if (req.data.material_ID) {
    const material = await SELECT.one.from(cds.entities('route.management').Materials)
      .where({ ID: req.data.material_ID });

    if (material) {
      req.data.collectionType = material.description || req.data.collectionType;

      if (!req.data.unitOfMeasure) {
        req.data.unitOfMeasure = material.unitOfMeasure || 'KG';
      }
    }
  }

  if (req.data.quantity !== undefined && req.data.quantity !== null) {
    const quantity = Number(req.data.quantity);

    if (Number.isNaN(quantity) || quantity <= 0) {
      return reject(req, 'La quantité doit être supérieure à zéro.');
    }
  }
});
    

      this.before('UPDATE', 'Tours', async (req) => {
  syncTourPayload(req.data);

  if (req.data.quantity !== undefined && req.data.quantity !== null) {
    const quantity = Number(req.data.quantity);

    if (Number.isNaN(quantity) || quantity <= 0) {
      return reject(req, 'La quantité doit être supérieure à zéro.');
    }
  }

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
    'tourNumber',
    'tourDate',
    'collectionDate',
    'zone',
    'collectionType',
    'description',
    'remarks',
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

    'assignedHumanResource_ID',
    'assignedHumanResource',
    'assignedMaterialResource_ID',
    'assignedMaterialResource',

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
      'tourCode',
      'tourNumber',
      'tourDate',
      'collectionDate',
      'zone',
      'collectionType',
      'description',
      'remarks',
      'quantity',
      'unitOfMeasure',

      'client_ID',
      'client',

      'material_ID',
      'material',

      'vehicle_ID',
      'vehicle',
      'driver_ID',
      'driver',

      'assignedHumanResource_ID',
      'assignedHumanResource',
      'assignedMaterialResource_ID',
      'assignedMaterialResource'
    ];

    const hasBusinessModification = keys.some((key) => {
      return businessFields.includes(key);
    });

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
  syncRoadmapPayload(req.data);

  const code = await nextCode('Roadmaps', 'roadmapNumber', 'RM');

  req.data.roadmapNumber = code;
  req.data.roadmapCode = code;

  req.data.status = ROADMAP_STATUS.CREATED;
  req.data.integrationStatus = 'PENDING';

  req.data.sapSalesOrder = null;
  req.data.integrationDate = null;
  req.data.integrationMessage = null;
  req.data.rejectionReason = null;

  if (req.data.startDate) {
    const d = new Date(req.data.startDate);

    if (!Number.isNaN(d.getTime())) {
      req.data.month = d.getMonth() + 1;
      req.data.year = d.getFullYear();

      const range = monthRange(req.data.year, req.data.month);
      req.data.startDate = range.startDate;
      req.data.endDate = range.endDate;
    }
  }

  if (!req.data.month || !req.data.year) {
    return reject(req, 'Veuillez sélectionner une date de période pour la feuille de route.');
  }
});

    this.before('UPDATE', 'Roadmaps', async (req) => {
      syncRoadmapPayload(req.data);
      if (req.data.startDate) {
  const d = new Date(req.data.startDate);

  if (!Number.isNaN(d.getTime())) {
    req.data.month = d.getMonth() + 1;
    req.data.year = d.getFullYear();

    const range = monthRange(req.data.year, req.data.month);
    req.data.startDate = range.startDate;
    req.data.endDate = range.endDate;
  }
}
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
  'roadmapNumber',
  'startDate',
  'endDate',
  'status',
  'rejectionReason',

  'client_ID',
  'client',
  'month',
  'year',
  'integrationStatus',
  'sapSalesOrder',
  'integrationDate',
  'integrationMessage',

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
        this.on('autoAssignTours', 'Roadmaps', async (req) => {
      const roadmapID = req.params?.[0]?.ID;

      if (!roadmapID) {
        return reject(req, 'Identifiant de feuille de route manquant.');
      }

      const roadmap = await SELECT.one.from(Roadmaps).where({ ID: roadmapID });

      if (!roadmap) {
        return reject(req, 'Feuille de route introuvable.');
      }

      if (!roadmap.client_ID) {
        return reject(req, 'Veuillez sélectionner un client avant d’affecter les tournées.');
      }

      if (!roadmap.month || !roadmap.year) {
        return reject(req, 'Veuillez saisir le mois et l’année avant d’affecter les tournées.');
      }

      const range = monthRange(roadmap.year, roadmap.month);

      await UPDATE(Roadmaps)
        .set({
          startDate: range.startDate,
          endDate: range.endDate,
          updatedAt: new Date().toISOString()
        })
        .where({ ID: roadmapID });

      const existingAssignments = await SELECT.from(RoadmapTours)
        .columns('tour_ID', 'roadmap_ID');

      const assignedToOtherRoadmap = new Set(
        existingAssignments
          .filter((assignment) => assignment.roadmap_ID !== roadmapID)
          .map((assignment) => assignment.tour_ID)
      );

      const allTours = await SELECT.from(Tours);

      const matchingTours = allTours.filter((tour) => {
        const date = tour.tourDate || tour.collectionDate;

        if (!date) {
          return false;
        }

        const d = new Date(date);

        if (Number.isNaN(d.getTime())) {
          return false;
        }

        const sameClient = tour.client_ID === roadmap.client_ID;
        const sameMonth = d.getMonth() + 1 === Number(roadmap.month);
        const sameYear = d.getFullYear() === Number(roadmap.year);
        const validStatus = normalizeTourStatus(tour.status) === TOUR_STATUS.VALIDATED;
        const notAssignedElsewhere = !assignedToOtherRoadmap.has(tour.ID);

        return sameClient && sameMonth && sameYear && validStatus && notAssignedElsewhere;
      });

      await DELETE.from(RoadmapTours).where({ roadmap_ID: roadmapID });

      let sequence = 1;

      for (const tour of matchingTours) {
        await INSERT.into(RoadmapTours).entries({
          ID: cds.utils.uuid(),
          sequence,
          note: `Tournée affectée automatiquement`,
          roadmap_ID: roadmapID,
          tour_ID: tour.ID
        });

        sequence += 1;
      }

      return SELECT.one.from(Roadmaps).where({ ID: roadmapID });
    });

    this.on('generateRoadmapSheetHtml', 'Roadmaps', async (req) => {
      const roadmapID = req.params?.[0]?.ID;

      if (!roadmapID) {
        return reject(req, 'Identifiant de feuille de route manquant.');
      }

      const roadmap = await SELECT.one.from(Roadmaps).where({ ID: roadmapID });

      if (!roadmap) {
        return reject(req, 'Feuille de route introuvable.');
      }

      const client = roadmap.client_ID
        ? await SELECT.one.from(Clients).where({ ID: roadmap.client_ID })
        : null;

      const assignments = await SELECT.from(RoadmapTours)
        .where({ roadmap_ID: roadmapID })
        .orderBy('sequence');

      if (!assignments.length) {
        return reject(req, 'Aucune tournée affectée à cette feuille de route.');
      }

      const tourIDs = assignments.map((assignment) => assignment.tour_ID);
      const tours = await SELECT.from(Tours).where({ ID: { in: tourIDs } });

      const toursByID = new Map(tours.map((tour) => [tour.ID, tour]));

      const groups = new Map();

      for (const assignment of assignments) {
        const tour = toursByID.get(assignment.tour_ID);

        if (!tour) {
          continue;
        }

        const material = tour.collectionType || 'Non renseigné';
        const unit = tour.unitOfMeasure || 'KG';
        const key = `${material}__${unit}`;

        if (!groups.has(key)) {
          groups.set(key, {
            material,
            unit,
            totalQuantity: 0,
            tourCodes: []
          });
        }

        const group = groups.get(key);

        group.totalQuantity += Number(tour.quantity || 0);
        group.tourCodes.push(tour.tourCode || tour.tourNumber || tour.ID);
      }

      const groupRows = Array.from(groups.values()).map((group) => {
        return `
          <tr>
            <td>${escapeHtml(group.material)}</td>
            <td>${escapeHtml(group.tourCodes.join(' / '))}</td>
            <td class="right">${group.totalQuantity.toFixed(3)}</td>
            <td>${escapeHtml(group.unit)}</td>
          </tr>
        `;
      }).join('');

      const detailRows = assignments.map((assignment) => {
        const tour = toursByID.get(assignment.tour_ID);

        if (!tour) {
          return '';
        }

        return `
          <tr>
            <td>${assignment.sequence || ''}</td>
            <td>${escapeHtml(tour.tourCode || tour.tourNumber)}</td>
            <td>${escapeHtml(tour.tourDate || tour.collectionDate)}</td>
            <td>${escapeHtml(tour.zone)}</td>
            <td>${escapeHtml(tour.collectionType)}</td>
            <td class="right">${Number(tour.quantity || 0).toFixed(3)}</td>
            <td>${escapeHtml(tour.unitOfMeasure || 'KG')}</td>
          </tr>
        `;
      }).join('');

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Feuille de route ${escapeHtml(roadmap.roadmapCode || roadmap.roadmapNumber)}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 32px;
              color: #1d2d3e;
            }

            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #0a6ed1;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }

            h1 {
              margin: 0;
              color: #0a6ed1;
              font-size: 24px;
            }

            h2 {
              margin-top: 28px;
              color: #1d2d3e;
              font-size: 18px;
            }

            .meta {
              line-height: 1.8;
              font-size: 14px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 12px;
              font-size: 13px;
            }

            th {
              background: #eaf4ff;
              color: #1d2d3e;
              text-align: left;
            }

            th, td {
              border: 1px solid #d0d7de;
              padding: 8px;
            }

            .right {
              text-align: right;
            }

            .actions {
              margin-bottom: 20px;
            }

            .print {
              background: #0a6ed1;
              color: white;
              border: none;
              padding: 8px 14px;
              border-radius: 8px;
              font-weight: bold;
              cursor: pointer;
            }

            @media print {
              .actions {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="actions">
            <button class="print" onclick="window.print()">Télécharger / Imprimer en PDF</button>
          </div>

          <div class="header">
            <div>
              <h1>Feuille de route</h1>
              <div class="meta">
                <strong>N° :</strong> ${escapeHtml(roadmap.roadmapCode || roadmap.roadmapNumber)}<br>
                <strong>Client :</strong> ${escapeHtml(client?.name || '')}<br>
                <strong>Période :</strong> ${escapeHtml(roadmap.month)}/${escapeHtml(roadmap.year)}
              </div>
            </div>
            <div class="meta">
              <strong>Statut :</strong> ${escapeHtml(roadmap.status)}<br>
              <strong>Générée le :</strong> ${new Date().toLocaleDateString('fr-FR')}
            </div>
          </div>

          <h2>Résumé par matériau / type de déchet</h2>
          <table>
            <thead>
              <tr>
                <th>Matériau / Type de déchet</th>
                <th>Tournées regroupées</th>
                <th>Quantité totale</th>
                <th>Unité</th>
              </tr>
            </thead>
            <tbody>
              ${groupRows}
            </tbody>
          </table>

          <h2>Détail des tournées affectées</h2>
          <table>
            <thead>
              <tr>
                <th>Séquence</th>
                <th>N° tournée</th>
                <th>Date de collecte</th>
                <th>Zone</th>
                <th>Matériau / Type de déchet</th>
                <th>Quantité</th>
                <th>Unité</th>
              </tr>
            </thead>
            <tbody>
              ${detailRows}
            </tbody>
          </table>
        </body>
        </html>
      `;
    });


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

        /* ===================================================== */
    /* VALUE HELP — TOUR STATUS                              */
    /* ===================================================== */

    this.on('READ', 'TourStatusVH', () => {
      return [
        {
          code: 'CREATED',
          label: 'Créée'
        },
        {
          code: 'VALIDATED',
          label: 'Validée'
        },
        {
          code: 'REJECTED',
          label: 'Rejetée'
        }
      ];
    });

        /* ===================================================== */
    /* VALUE HELP — ROADMAP STATUS                           */
    /* ===================================================== */

    this.on('READ', 'RoadmapStatusVH', () => {
      return [
        {
          code: 'CREATED',
          label: 'Créée'
        },
        {
          code: 'VALIDATED',
          label: 'Validée'
        },
        {
          code: 'REJECTED',
          label: 'Rejetée'
        }
      ];
    });

    /* ===================================================== */
    /* VALUE HELP — INTEGRATION STATUS                       */
    /* ===================================================== */

    this.on('READ', 'IntegrationStatusVH', () => {
      return [
        {
          code: 'PENDING',
          label: 'En attente'
        },
        {
          code: 'INTEGRATED',
          label: 'Intégrée'
        }
      ];
    });

    return super.init();
  }
};
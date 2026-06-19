namespace route.management;

using {
    cuid,
    managed
} from '@sap/cds/common';

/* ===================================================== */
/* USERS                                                 */
/* ===================================================== */

entity Users : cuid {
    email    : String(120);
    username : String(100);
    password : String(100);
    fullName : String(200);
    role     : String(30);     // PLANIFICATEUR | SUPERVISEUR
    active   : Boolean default true;
}

/* ===================================================== */
/* ENUMS                                                 */
/* ===================================================== */

type CategoryType : String enum {
    HUMAN;
    MATERIAL;
}

type AvailabilityStatus : String enum {
    AVAILABLE;
    RESERVED;
    UNAVAILABLE;
}

type TourStatus : String enum {
    CREATED;
    VALIDATED;
    ASSIGNED;
    COMPLETED;
    CANCELLED;
    REJECTED;
}

type RoadmapStatus : String enum {
    CREATED;
    VALIDATED;
    COMPLETED;
    CANCELLED;
    REJECTED;
}

type IntegrationStatus : String enum {
    PENDING;
    INTEGRATED;
    FAILED;
}

/* ===================================================== */
/* MASTER DATA                                           */
/* ===================================================== */

entity Clients : cuid, managed {
    @title: 'Code client'
    customerCode : String(20);

    /*
       Ancien champ gardé pour compatibilité avec ton projet actuel.
       Tu peux le supprimer plus tard après migration complète.
    */
    code : String(30);

    @title: 'Nom du client'
    name : String(150);

    @title: 'Adresse'
    address : String(255);

    @title: 'Ville'
    city : String(100);

    @title: 'Téléphone'
    phone : String(30);

    @title: 'E-mail'
    email : String(100);

    collectionPoints : Composition of many CollectionPoints
        on collectionPoints.client = $self;
}

entity Materials : cuid, managed {
    @title: 'Code matériau'
    materialCode : String(40);

    @title: 'Description'
    description : String(255);

    @title: 'Unité'
    unitOfMeasure : String(10);
}

entity Categories : cuid, managed {
    @title: 'Nom de la catégorie'
    name : String(100);

    @title: 'Type'
    type : CategoryType;

    @title: 'Description'
    description : String(255);
}

entity Vehicles : cuid {
    registrationNumber : String(30);
    type               : String(50);
    capacity           : Integer;
    status             : String(30);
    available          : Boolean default true;
}

entity Drivers : cuid {
    firstName : String(100);
    lastName  : String(100);
    phone     : String(30);
    available : Boolean default true;
}

entity CollectionPoints : cuid {
    label     : String(150);
    address   : String(255);
    city      : String(100);
    latitude  : Decimal(9, 6);
    longitude : Decimal(9, 6);

    client : Association to Clients;
}

/* ===================================================== */
/* RESOURCES                                             */
/* ===================================================== */

entity HumanResources : cuid, managed {
    @title: 'Matricule'
    employeeCode : String(30);

    @title: 'Nom complet'
    fullName : String(150);

    @title: 'Catégorie'
    category : Association to Categories;

    @title: 'Disponibilité'
    status : AvailabilityStatus;
}

entity MaterialResources : cuid, managed {
    @title: 'Code équipement'
    equipmentCode : String(30);

    @title: 'Équipement'
    name : String(150);

    @title: 'Catégorie'
    category : Association to Categories;

    @title: 'Disponibilité'
    status : AvailabilityStatus;
}

/* ===================================================== */
/* TOURS                                                 */
/* ===================================================== */

entity Tours : cuid, managed {
    /* Nouveaux champs selon le schéma de ton ami */

    @title: 'N° tournée'
    tourNumber : String(30);

    @title: 'Date de collecte'
    collectionDate : Date;

    @title: 'Client'
    client : Association to Clients;

    @title: 'Matériau'
    material : Association to Materials;

    @title: 'Quantité'
    quantity : Decimal(15, 3);

    @title: 'Unité'
    unitOfMeasure : String(10);

    @title: 'Ressource humaine'
    assignedHumanResource : Association to HumanResources;

    @title: 'Ressource matérielle'
    assignedMaterialResource : Association to MaterialResources;

    @title: 'Statut'
    status : TourStatus default 'CREATED';

    @title: 'Remarques'
    remarks : String(500);

    /* Anciens champs gardés pour ne pas casser ton projet actuel */

    tourCode        : String(30);
    tourDate        : Date;
    zone            : String(100);
    collectionType  : String(50);
    description     : LargeString;
    rejectionReason : LargeString;

    updatedAt       : Timestamp @cds.on.insert: $now @cds.on.update: $now;

    createdByUser : Association to Users;
    vehicle       : Association to Vehicles;
    driver        : Association to Drivers;

    humanResources : Composition of many TourHumanResources
        on humanResources.tour = $self;

    materialResources : Composition of many TourMaterialResources
        on materialResources.tour = $self;

    tourPoints : Composition of many TourCollectionPoints
        on tourPoints.tour = $self;

    decisions : Composition of many DecisionHistories
        on decisions.tour = $self;

    roadmap : Association to Roadmaps;
}

entity TourHumanResources : cuid, managed {
    sequence  : Integer;
    role      : String(50);
    note      : String(255);
    updatedAt : Timestamp @cds.on.insert: $now @cds.on.update: $now;

    tour   : Association to Tours;
    driver : Association to Drivers;
}

entity TourMaterialResources : cuid, managed {
    sequence  : Integer;
    usage     : String(50);
    note      : String(255);
    updatedAt : Timestamp @cds.on.insert: $now @cds.on.update: $now;

    tour    : Association to Tours;
    vehicle : Association to Vehicles;
}

entity TourCollectionPoints : cuid {
    sequence : Integer;

    tour            : Association to Tours;
    collectionPoint : Association to CollectionPoints;
}

/* ===================================================== */
/* ROADMAPS                                              */
/* ===================================================== */

entity Roadmaps : cuid, managed {
    /* Nouveaux champs selon le schéma de ton ami */

    @title: 'N° feuille de route'
    roadmapNumber : String(30);

    @title: 'Client'
    client : Association to Clients;

    @title: 'Mois'
    month : Integer;

    @title: 'Année'
    year : Integer;

    @title: 'Statut'
    status : RoadmapStatus default 'CREATED';

    @title: 'Statut d’intégration'
    integrationStatus : IntegrationStatus default 'PENDING';

    @title: 'Commande SAP'
    sapSalesOrder : String(20);

    @title: 'Date d’intégration'
    integrationDate : Timestamp;

    @title: 'Message d’intégration'
    integrationMessage : String(500);

    /* Anciens champs gardés pour compatibilité */

    roadmapCode     : String(30);
    startDate       : Date;
    endDate         : Date;
    rejectionReason : LargeString;

    updatedAt       : Timestamp @cds.on.insert: $now @cds.on.update: $now;

    tour : Association to Tours;

    assignedTours : Composition of many RoadmapTours
        on assignedTours.roadmap = $self;

    steps : Composition of many RoadmapSteps
        on steps.roadmap = $self;
}

entity RoadmapTours : cuid, managed {
    sequence : Integer;
    note     : String(255);

    roadmap : Association to Roadmaps;
    tour    : Association to Tours;
}

entity RoadmapSteps : cuid, managed {
    sequence           : Integer;
    plannedArrivalTime : Time;
    realArrivalTime    : Time;
    status             : String(30) default 'PLANNED';

    roadmap         : Association to Roadmaps;
    collectionPoint : Association to CollectionPoints;
}

entity RoadMapTourAssignments : managed {
    key roadMap : Association to Roadmaps;
    key tour    : Association to Tours;
}

/* ===================================================== */
/* DECISION HISTORY                                      */
/* ===================================================== */

entity DecisionHistories : cuid, managed {
    decision     : String(20); // ACCEPTED | REJECTED | VALIDATED
    reason       : LargeString;
    decisionDate : Timestamp @cds.on.insert: $now;

    decidedBy : Association to Users;
    tour      : Association to Tours;
}

/* ===================================================== */
/* ANALYTICS                                             */
/* ===================================================== */

entity TourStatusAnalytics as select from Tours {
    key status as status,
        count(1) as total : Integer,
        case
            when status = 'VALIDATED' then 3
            when status = 'ASSIGNED' then 3
            when status = 'COMPLETED' then 3
            when status = 'REJECTED' then 1
            when status = 'CANCELLED' then 1
            else 2
        end as criticality : Integer
}
group by status;

entity RoadmapStatusAnalytics as select from Roadmaps {
    key status as status,
        count(1) as total : Integer,
        case
            when status = 'VALIDATED' then 3
            when status = 'COMPLETED' then 3
            when status = 'REJECTED' then 1
            when status = 'CANCELLED' then 1
            else 2
        end as criticality : Integer
}
group by status;
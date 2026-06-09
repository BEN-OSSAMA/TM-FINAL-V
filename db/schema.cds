namespace route.management;

using { cuid, managed } from '@sap/cds/common';

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
/* MASTER DATA                                           */
/* ===================================================== */

entity Clients : cuid {
    code    : String(30);
    name    : String(150);
    address : String(255);
    city    : String(100);
    phone   : String(30);
    email   : String(100);

    collectionPoints : Composition of many CollectionPoints
        on collectionPoints.client = $self;
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

entity Materials : cuid {
    materialCode  : String(30);
    description   : String(200);
    unitOfMeasure : String(10);
}

entity HumanResources : cuid {
    employeeCode : String(30);
    fullName     : String(200);
    status       : String(20) default 'AVAILABLE';
}

entity MaterialResources : cuid {
    equipmentCode : String(30);
    name          : String(200);
    status        : String(20) default 'AVAILABLE';
}

/* ===================================================== */
/* TOURS                                                 */
/* ===================================================== */

entity Tours : cuid, managed {
    tourCode        : String(30);
    tourDate        : Date;
    zone            : String(100);
    collectionType  : String(50);
    description     : LargeString;

    quantity        : Decimal(15, 3);
    unitOfMeasure   : String(10);

    status          : String(20) default 'CREATED';
    rejectionReason : LargeString;

    updatedAt       : Timestamp @cds.on.insert: $now @cds.on.update: $now;

    createdByUser : Association to Users;
    client        : Association to Clients;
    material      : Association to Materials;
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

    tour          : Association to Tours;
    driver        : Association to Drivers;
    humanResource : Association to HumanResources;
}

entity TourMaterialResources : cuid, managed {
    sequence  : Integer;
    usage     : String(50);
    note      : String(255);
    updatedAt : Timestamp @cds.on.insert: $now @cds.on.update: $now;

    tour             : Association to Tours;
    vehicle          : Association to Vehicles;
    materialResource : Association to MaterialResources;
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
    roadmapCode     : String(30);
    status          : String(20) default 'CREATED';
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

/* ===================================================== */
/* DECISION HISTORY                                      */
/* ===================================================== */

entity DecisionHistories : cuid, managed {
    decision     : String(20);
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
            when status = 'ACCEPTED' then 3
            when status = 'COMPLETED' then 3
            when status = 'REJECTED' then 1
            when status = 'CANCELLED' then 1
            else 2
        end as criticality : Integer
}
group by status;

entity AvailableHumanResources as select from HumanResources {
    key ID,
        employeeCode,
        fullName,
        status
} where status = 'AVAILABLE';

entity AvailableMaterialResources as select from MaterialResources {
    key ID,
        equipmentCode,
        name,
        status
} where status = 'AVAILABLE';

entity RoadmapStatusAnalytics as select from Roadmaps {
    key status as status,
        count(1) as total : Integer,
        case
            when status = 'VALIDATED' then 3
            when status = 'ACTIVE' then 3
            when status = 'COMPLETED' then 3
            when status = 'REJECTED' then 1
            when status = 'CANCELLED' then 1
            else 2
        end as criticality : Integer
}
group by status;
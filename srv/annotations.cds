using RouteManagementService as service from './route-management-service';

/* ===================================================== */
/* TOURS                                                 */
/* ===================================================== */

// annotate service.Tours with @(
//     UI.HeaderInfo: {
//         TypeName: 'Tournée',
//         TypeNamePlural: 'Tournées de collecte',
//         Title: {
//             $Type: 'UI.DataField',
//             Value: tourCode
//         },
//         Description: {
//             $Type: 'UI.DataField',
//             Value: status
//         }
//     },

//     Capabilities.InsertRestrictions.Insertable: true,
//     Capabilities.DeleteRestrictions.Deletable: true,
//     Capabilities.UpdateRestrictions.Updatable: true,

//     UI.SelectionFields: [
//         status,
//         tourCode,
//         tourDate,
//         clientName,
//         collectionType,
//         driverLastName,
//         vehicleRegistration
//     ],

//     UI.LineItem: [
//         {
//             $Type: 'UI.DataField',
//             Label: 'N° tournée',
//             Value: tourCode
//         },
//         {
//             $Type: 'UI.DataField',
//             Label: 'Date de collecte',
//             Value: tourDate
//         },
//         {
//             $Type: 'UI.DataField',
//             Label: 'Client',
//             Value: clientName
//         },
//         {
//             $Type: 'UI.DataField',
//             Label: 'Matériau',
//             Value: collectionType
//         },
//         {
//             $Type: 'UI.DataField',
//             Label: 'Ressource humaine',
//             Value: driverLastName
//         },
//         {
//             $Type: 'UI.DataField',
//             Label: 'Ressource matérielle',
//             Value: vehicleRegistration
//         },
//         {
//             $Type: 'UI.DataField',
//             Label: 'Statut',
//             Value: status,
//             Criticality: statusCriticality
//         },
//         {
//             $Type: 'UI.DataFieldForAction',
//             Label: 'Valider',
//             Action: 'RouteManagementService.validate',
//             Inline: true
//         },
//         {
//             $Type: 'UI.DataFieldForAction',
//             Label: 'Rejeter',
//             Action: 'RouteManagementService.reject',
//             Inline: true
//         }
//     ],

//     UI.Facets: [
//         {
//             $Type: 'UI.ReferenceFacet',
//             Label: 'Informations générales',
//             Target: '@UI.FieldGroup#General'
//         },
//         {
//             $Type: 'UI.ReferenceFacet',
//             Label: 'Client et matériau',
//             Target: '@UI.FieldGroup#ClientMaterial'
//         },
//         {
//             $Type: 'UI.ReferenceFacet',
//             Label: 'Affectation des ressources',
//             Target: '@UI.FieldGroup#Resources'
//         },
//         {
//             $Type: 'UI.ReferenceFacet',
//             Label: 'Suivi de la tournée',
//             Target: '@UI.FieldGroup#Tracking'
//         }
//     ],

//     UI.FieldGroup #General: {
//         Data: [
//             {
//                 $Type: 'UI.DataField',
//                 Label: 'N° tournée',
//                 Value: tourCode
//             },
//             {
//                 $Type: 'UI.DataField',
//                 Label: 'Date de collecte',
//                 Value: tourDate
//             },
//             {
//                 $Type: 'UI.DataField',
//                 Label: 'Zone',
//                 Value: zone
//             },
//             {
//                 $Type: 'UI.DataField',
//                 Label: 'Statut',
//                 Value: status,
//                 Criticality: statusCriticality
//             }
//         ]
//     },

//     UI.FieldGroup #ClientMaterial: {
//         Data: [
//             {
//                 $Type: 'UI.DataField',
//                 Label: 'Client',
//                 Value: client
//             },
//             {
//                 $Type: 'UI.DataField',
//                 Label: 'Nom client',
//                 Value: clientName
//             },
//             {
//                 $Type: 'UI.DataField',
//                 Label: 'Matériau',
//                 Value: collectionType
//             },
//             {
//                 $Type: 'UI.DataField',
//                 Label: 'Description',
//                 Value: description
//             }
//         ]
//     },

//     UI.FieldGroup #Resources: {
//         Data: [
//             {
//                 $Type: 'UI.DataField',
//                 Label: 'Ressource humaine',
//                 Value: driver
//             },
//             {
//                 $Type: 'UI.DataField',
//                 Label: 'Nom chauffeur',
//                 Value: driverLastName
//             },
//             {
//                 $Type: 'UI.DataField',
//                 Label: 'Ressource matérielle',
//                 Value: vehicle
//             },
//             {
//                 $Type: 'UI.DataField',
//                 Label: 'Véhicule',
//                 Value: vehicleRegistration
//             }
//         ]
//     },

//     UI.FieldGroup #Tracking: {
//         Data: [
//             {
//                 $Type: 'UI.DataField',
//                 Label: 'Motif de refus',
//                 Value: rejectionReason
//             },
//             {
//                 $Type: 'UI.DataField',
//                 Label: 'Créé le',
//                 Value: createdAt
//             },
//             {
//                 $Type: 'UI.DataField',
//                 Label: 'Mis à jour le',
//                 Value: updatedAt
//             }
//         ]
//     }
// );

// annotate service.Tours with {
//     status              @Common.Label: 'Statut de modification';
//     tourCode            @Common.Label: 'N° tournée';
//     tourDate            @Common.Label: 'Date de collecte';

//     client              @Common.Label: 'Client';
//     clientName          @(
//         Common.Label: 'Nom client',
//         Core.Computed: true
//     );

//     collectionType      @Common.Label: 'Matériau';

//     driver              @Common.Label: 'Ressource humaine';
//     driverFirstName     @(
//         Common.Label: 'Prénom chauffeur',
//         Core.Computed: true
//     );
//     driverLastName      @(
//         Common.Label: 'Nom chauffeur',
//         Core.Computed: true
//     );

//     vehicle             @Common.Label: 'Ressource matérielle';
//     vehicleRegistration @(
//         Common.Label: 'Véhicule',
//         Core.Computed: true
//     );

//     zone                @Common.Label: 'Zone';
//     description         @Common.Label: 'Description';
//     rejectionReason     @Common.Label: 'Motif de refus';

//     statusCriticality   @(
//         Common.Label: 'Criticité du statut',
//         Core.Computed: true
//     );
//     canValidate         @Core.Computed: true;
//     canReject           @Core.Computed: true;

//     createdAt           @Core.Computed: true;
//     updatedAt           @Core.Computed: true;
// };


/* ===================================================== */
/* ROADMAPS                                              */
/* ===================================================== */

annotate service.Roadmaps with @(
    UI.HeaderInfo: {
        TypeName: 'Roadmap',
        TypeNamePlural: 'Roadmaps',
        Title: {
            $Type: 'UI.DataField',
            Value: roadmapCode
        },
        Description: {
            $Type: 'UI.DataField',
            Value: status
        }
    },

    Capabilities.InsertRestrictions.Insertable: true,
    Capabilities.DeleteRestrictions.Deletable: true,
    Capabilities.UpdateRestrictions.Updatable: true,

    UI.SelectionFields: [
        status,
        roadmapCode,
        startDate,
        endDate,
        tourCode,
        tourDate,
        tourZone
    ],

    UI.LineItem: [
        {
            $Type: 'UI.DataField',
            Label: 'N° roadmap',
            Value: roadmapCode
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tournée principale',
            Value: tourCode
        },
        {
            $Type: 'UI.DataField',
            Label: 'Date tournée',
            Value: tourDate
        },
        {
            $Type: 'UI.DataField',
            Label: 'Zone',
            Value: tourZone
        },
        {
            $Type: 'UI.DataField',
            Label: 'Date début',
            Value: startDate
        },
        {
            $Type: 'UI.DataField',
            Label: 'Date fin',
            Value: endDate
        },
        {
            $Type: 'UI.DataField',
            Label: 'Statut',
            Value: status,
            Criticality: statusCriticality
        },
        {
            $Type: 'UI.DataFieldForAction',
            Label: 'Valider',
            Action: 'RouteManagementService.validateRoadmap',
            Inline: true
        },
        {
            $Type: 'UI.DataFieldForAction',
            Label: 'Rejeter',
            Action: 'RouteManagementService.rejectRoadmap',
            Inline: true
        }
    ],

    UI.Facets: [
        {
            $Type: 'UI.ReferenceFacet',
            Label: 'Informations générales',
            Target: '@UI.FieldGroup#RoadmapGeneral'
        },
        {
            $Type: 'UI.ReferenceFacet',
            Label: 'Tournée principale',
            Target: '@UI.FieldGroup#RoadmapMainTour'
        },
        {
            $Type: 'UI.ReferenceFacet',
            Label: 'Tournées affectées',
            Target: 'assignedTours/@UI.LineItem'
        },
        {
            $Type: 'UI.ReferenceFacet',
            Label: 'Suivi',
            Target: '@UI.FieldGroup#RoadmapTracking'
        }
    ],

    UI.FieldGroup #RoadmapGeneral: {
        Data: [
            {
                $Type: 'UI.DataField',
                Label: 'N° roadmap',
                Value: roadmapCode
            },
            {
                $Type: 'UI.DataField',
                Label: 'Date début',
                Value: startDate
            },
            {
                $Type: 'UI.DataField',
                Label: 'Date fin',
                Value: endDate
            },
            {
                $Type: 'UI.DataField',
                Label: 'Statut',
                Value: status,
                Criticality: statusCriticality
            }
        ]
    },

    UI.FieldGroup #RoadmapMainTour: {
        Data: [
            {
                $Type: 'UI.DataField',
                Label: 'Tournée principale',
                Value: tour
            },
            {
                $Type: 'UI.DataField',
                Label: 'N° tournée',
                Value: tourCode
            },
            {
                $Type: 'UI.DataField',
                Label: 'Date tournée',
                Value: tourDate
            },
            {
                $Type: 'UI.DataField',
                Label: 'Zone tournée',
                Value: tourZone
            },
            {
                $Type: 'UI.DataField',
                Label: 'Type de collecte',
                Value: tourCollectionType
            },
            {
                $Type: 'UI.DataField',
                Label: 'Client',
                Value: tourClientName
            },
            {
                $Type: 'UI.DataField',
                Label: 'Chauffeur',
                Value: tourDriverLastName
            },
            {
                $Type: 'UI.DataField',
                Label: 'Véhicule',
                Value: tourVehicleRegistration
            }
        ]
    },

    UI.FieldGroup #RoadmapTracking: {
        Data: [
            {
                $Type: 'UI.DataField',
                Label: 'Motif de refus',
                Value: rejectionReason
            },
            {
                $Type: 'UI.DataField',
                Label: 'Créé le',
                Value: createdAt
            },
            {
                $Type: 'UI.DataField',
                Label: 'Mis à jour le',
                Value: updatedAt
            }
        ]
    }
);

annotate service.Roadmaps with {
    roadmapCode                 @Common.Label: 'N° roadmap';
    status                      @Common.Label: 'Statut de modification';
    startDate                   @Common.Label: 'Date début';
    endDate                     @Common.Label: 'Date fin';
    rejectionReason             @Common.Label: 'Motif de refus';

    tour                        @Common.Label: 'Tournée principale';

    tourCode                    @(
        Common.Label: 'N° tournée',
        Core.Computed: true
    );
    tourDate                    @(
        Common.Label: 'Date tournée',
        Core.Computed: true
    );
    tourZone                    @(
        Common.Label: 'Zone tournée',
        Core.Computed: true
    );
    tourCollectionType          @(
        Common.Label: 'Type de collecte',
        Core.Computed: true
    );
    tourClientName              @(
        Common.Label: 'Client',
        Core.Computed: true
    );
    tourDriverFirstName         @(
        Common.Label: 'Prénom chauffeur',
        Core.Computed: true
    );
    tourDriverLastName          @(
        Common.Label: 'Chauffeur',
        Core.Computed: true
    );
    tourVehicleRegistration     @(
        Common.Label: 'Véhicule',
        Core.Computed: true
    );

    statusCriticality           @(
        Common.Label: 'Criticité du statut',
        Core.Computed: true
    );
    canValidate                 @Core.Computed: true;
    canReject                   @Core.Computed: true;

    createdAt                   @Core.Computed: true;
    updatedAt                   @Core.Computed: true;
};


/* ===================================================== */
/* ROADMAP TOURS                                         */
/* ===================================================== */

annotate service.RoadmapTours with @(
    UI.HeaderInfo: {
        TypeName: 'Tournée affectée',
        TypeNamePlural: 'Tournées affectées',
        Title: {
            $Type: 'UI.DataField',
            Value: tourCode
        },
        Description: {
            $Type: 'UI.DataField',
            Value: note
        }
    },

    Capabilities.InsertRestrictions.Insertable: true,
    Capabilities.DeleteRestrictions.Deletable: true,
    Capabilities.UpdateRestrictions.Updatable: true,

    UI.LineItem: [
        {
            $Type: 'UI.DataField',
            Label: 'Séquence',
            Value: sequence
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tournée',
            Value: tour
        },
        {
            $Type: 'UI.DataField',
            Label: 'N° tournée',
            Value: tourCode
        },
        {
            $Type: 'UI.DataField',
            Label: 'Date tournée',
            Value: tourDate
        },
        {
            $Type: 'UI.DataField',
            Label: 'Zone',
            Value: tourZone
        },
        {
            $Type: 'UI.DataField',
            Label: 'Type collecte',
            Value: tourCollectionType
        },
        {
            $Type: 'UI.DataField',
            Label: 'Client',
            Value: clientName
        },
        {
            $Type: 'UI.DataField',
            Label: 'Chauffeur',
            Value: driverLastName
        },
        {
            $Type: 'UI.DataField',
            Label: 'Véhicule',
            Value: vehicleRegistration
        },
        {
            $Type: 'UI.DataField',
            Label: 'Note',
            Value: note
        },
        {
            $Type: 'UI.DataFieldForAction',
            Label: 'Modifier ressources',
            Action: 'RouteManagementService.updateResources',
            Inline: false
        }
    ],

    UI.FieldGroup #General: {
        Data: [
            {
                $Type: 'UI.DataField',
                Label: 'Séquence',
                Value: sequence
            },
            {
                $Type: 'UI.DataField',
                Label: 'Tournée',
                Value: tour
            },
            {
                $Type: 'UI.DataField',
                Label: 'N° tournée',
                Value: tourCode
            },
            {
                $Type: 'UI.DataField',
                Label: 'Date tournée',
                Value: tourDate
            },
            {
                $Type: 'UI.DataField',
                Label: 'Zone',
                Value: tourZone
            },
            {
                $Type: 'UI.DataField',
                Label: 'Client',
                Value: clientName
            },
            {
                $Type: 'UI.DataField',
                Label: 'Chauffeur',
                Value: driverLastName
            },
            {
                $Type: 'UI.DataField',
                Label: 'Véhicule',
                Value: vehicleRegistration
            },
            {
                $Type: 'UI.DataField',
                Label: 'Note',
                Value: note
            }
        ]
    }
);

annotate service.RoadmapTours with {
    sequence             @Common.Label: 'Séquence';
    note                 @Common.Label: 'Note';
    roadmap              @Common.Label: 'Roadmap';
    tour                 @Common.Label: 'Tournée';

    roadmapCode          @(
        Common.Label: 'N° roadmap',
        Core.Computed: true
    );
    tourCode             @(
        Common.Label: 'N° tournée',
        Core.Computed: true
    );
    tourDate             @(
        Common.Label: 'Date tournée',
        Core.Computed: true
    );
    tourZone             @(
        Common.Label: 'Zone',
        Core.Computed: true
    );
    tourCollectionType   @(
        Common.Label: 'Type collecte',
        Core.Computed: true
    );
    clientName           @(
        Common.Label: 'Client',
        Core.Computed: true
    );
    driverFirstName      @(
        Common.Label: 'Prénom chauffeur',
        Core.Computed: true
    );
    driverLastName       @(
        Common.Label: 'Chauffeur',
        Core.Computed: true
    );
    vehicleRegistration  @(
        Common.Label: 'Véhicule',
        Core.Computed: true
    );

    createdAt            @Core.Computed: true;
    createdBy            @Core.Computed: true;
    modifiedAt           @Core.Computed: true;
    modifiedBy           @Core.Computed: true;
};


/* ===================================================== */
/* OVP DASHBOARD TABLE CARDS                             */
/* ===================================================== */

annotate service.Tours with @(
    UI.LineItem #DashboardTours: [
        {
            $Type: 'UI.DataField',
            Label: 'N° tournée',
            Value: tourCode
        },
        {
            $Type: 'UI.DataField',
            Label: 'Date',
            Value: tourDate
        },
        {
            $Type: 'UI.DataField',
            Label: 'Client',
            Value: clientName
        },
        {
            $Type: 'UI.DataField',
            Label: 'Statut',
            Value: status,
            Criticality: statusCriticality
        }
    ]
);

annotate service.Roadmaps with @(
    UI.LineItem #DashboardRoadmaps: [
        {
            $Type: 'UI.DataField',
            Label: 'N° roadmap',
            Value: roadmapCode
        },
        {
            $Type: 'UI.DataField',
            Label: 'Tournée principale',
            Value: tourCode
        },
        {
            $Type: 'UI.DataField',
            Label: 'Date début',
            Value: startDate
        },
        {
            $Type: 'UI.DataField',
            Label: 'Statut',
            Value: status,
            Criticality: statusCriticality
        }
    ]
);


/* ===================================================== */
/* OVP DASHBOARD CHART CARDS                             */
/* ===================================================== */

annotate service.TourStatusAnalytics with @(
    UI.SelectionVariant #TourStatusSV: {
        Text: 'Filtre statistiques tournées',
        SelectOptions: []
    },

    UI.Chart #TourStatusChart: {
        $Type: 'UI.ChartDefinitionType',
        Title: 'Répartition des tournées par statut',
        Description: 'Analyse des tournées créées, validées et rejetées',
        ChartType: #Column,
        Dimensions: [
            status
        ],
        Measures: [
            total
        ],
        DimensionAttributes: [
            {
                $Type: 'UI.ChartDimensionAttributeType',
                Dimension: status,
                Role: #Category
            }
        ],
        MeasureAttributes: [
            {
                $Type: 'UI.ChartMeasureAttributeType',
                Measure: total,
                Role: #Axis1
            }
        ]
    },

    UI.PresentationVariant #TourStatusPV: {
        Text: 'Présentation statistiques tournées',
        MaxItems: 10,
        Visualizations: [
            '@UI.Chart#TourStatusChart'
        ]
    },

    UI.DataPoint #TourStatusDP: {
        Title: 'Total tournées',
        Value: total
    },

    UI.Identification: [
        {
            $Type: 'UI.DataField',
            Label: 'Statut',
            Value: status
        },
        {
            $Type: 'UI.DataField',
            Label: 'Nombre de tournées',
            Value: total
        }
    ],

    UI.LineItem #TourStatusTable: [
        {
            $Type: 'UI.DataField',
            Label: 'Statut',
            Value: status
        },
        {
            $Type: 'UI.DataField',
            Label: 'Nombre de tournées',
            Value: total
        }
    ]
);

annotate service.TourStatusAnalytics with {
    status @Common.Label: 'Statut';
    total  @(
        Common.Label: 'Nombre de tournées',
        Aggregation.default: #SUM
    );
};

annotate service.RoadmapStatusAnalytics with @(
    UI.SelectionVariant #RoadmapStatusSV: {
        Text: 'Filtre statistiques roadmaps',
        SelectOptions: []
    },

    UI.Chart #RoadmapStatusChart: {
        $Type: 'UI.ChartDefinitionType',
        Title: 'Répartition des roadmaps par statut',
        Description: 'Analyse des roadmaps créées, validées et rejetées',
        ChartType: #Donut,
        Dimensions: [
            status
        ],
        Measures: [
            total
        ],
        DimensionAttributes: [
            {
                $Type: 'UI.ChartDimensionAttributeType',
                Dimension: status,
                Role: #Category
            }
        ],
        MeasureAttributes: [
            {
                $Type: 'UI.ChartMeasureAttributeType',
                Measure: total,
                Role: #Axis1
            }
        ]
    },

    UI.PresentationVariant #RoadmapStatusPV: {
        Text: 'Présentation statistiques roadmaps',
        MaxItems: 10,
        Visualizations: [
            '@UI.Chart#RoadmapStatusChart'
        ]
    },

    UI.DataPoint #RoadmapStatusDP: {
        Title: 'Total roadmaps',
        Value: total
    },

    UI.Identification: [
        {
            $Type: 'UI.DataField',
            Label: 'Statut',
            Value: status
        },
        {
            $Type: 'UI.DataField',
            Label: 'Nombre de roadmaps',
            Value: total
        }
    ],

    UI.LineItem #RoadmapStatusTable: [
        {
            $Type: 'UI.DataField',
            Label: 'Statut',
            Value: status
        },
        {
            $Type: 'UI.DataField',
            Label: 'Nombre de roadmaps',
            Value: total
        }
    ]
);

annotate service.RoadmapStatusAnalytics with {
    status @Common.Label: 'Statut';
    total  @(
        Common.Label: 'Nombre de roadmaps',
        Aggregation.default: #SUM
    );
};


/* ===================================================== */
/* RELATED ENTITIES                                      */
/* ===================================================== */

annotate service.RoadmapSteps with @(
    UI.LineItem: [
        {
            $Type: 'UI.DataField',
            Label: 'Séquence',
            Value: sequence
        },
        {
            $Type: 'UI.DataField',
            Label: 'Arrivée prévue',
            Value: plannedArrivalTime
        },
        {
            $Type: 'UI.DataField',
            Label: 'Arrivée réelle',
            Value: realArrivalTime
        },
        {
            $Type: 'UI.DataField',
            Label: 'Statut',
            Value: status
        }
    ]
);

annotate service.DecisionHistories with @(
    UI.LineItem: [
        {
            $Type: 'UI.DataField',
            Label: 'Décision',
            Value: decision
        },
        {
            $Type: 'UI.DataField',
            Label: 'Motif',
            Value: reason
        },
        {
            $Type: 'UI.DataField',
            Label: 'Date',
            Value: decisionDate
        }
    ]
);

annotate service.Clients with @(
    UI.LineItem: [
        {
            $Type: 'UI.DataField',
            Label: 'Code',
            Value: code
        },
        {
            $Type: 'UI.DataField',
            Label: 'Nom',
            Value: name
        },
        {
            $Type: 'UI.DataField',
            Label: 'Ville',
            Value: city
        },
        {
            $Type: 'UI.DataField',
            Label: 'Téléphone',
            Value: phone
        }
    ]
);

annotate service.Vehicles with @(
    UI.LineItem: [
        {
            $Type: 'UI.DataField',
            Label: 'Immatriculation',
            Value: registrationNumber
        },
        {
            $Type: 'UI.DataField',
            Label: 'Type',
            Value: type
        },
        {
            $Type: 'UI.DataField',
            Label: 'Capacité',
            Value: capacity
        },
        {
            $Type: 'UI.DataField',
            Label: 'Disponible',
            Value: available
        }
    ]
);

annotate service.Drivers with @(
    UI.LineItem: [
        {
            $Type: 'UI.DataField',
            Label: 'Prénom',
            Value: firstName
        },
        {
            $Type: 'UI.DataField',
            Label: 'Nom',
            Value: lastName
        },
        {
            $Type: 'UI.DataField',
            Label: 'Téléphone',
            Value: phone
        },
        {
            $Type: 'UI.DataField',
            Label: 'Disponible',
            Value: available
        }
    ]
);

annotate service.CollectionPoints with @(
    UI.LineItem: [
        {
            $Type: 'UI.DataField',
            Label: 'Libellé',
            Value: label
        },
        {
            $Type: 'UI.DataField',
            Label: 'Adresse',
            Value: address
        },
        {
            $Type: 'UI.DataField',
            Label: 'Ville',
            Value: city
        }
    ]
);

/* ===================================================== */
/* CAPABILITIES - PLANIFICATEUR TOURS                    */
/* ===================================================== */

// annotate RouteManagementService.Tours with @Capabilities.InsertRestrictions : {
//     Insertable : true
// };

// annotate RouteManagementService.Tours with @Capabilities.UpdateRestrictions : {
//     Updatable : true
// };

// annotate RouteManagementService.Tours with @Capabilities.DeleteRestrictions : {
//     Deletable : true
// };
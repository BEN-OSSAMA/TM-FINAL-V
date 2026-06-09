using SepurService as service from '../../srv/route-management-service';


/* ===================================================== */
/* VALUE HELPS - TOURS */
/* ===================================================== */

annotate service.Tours with {

    client @Common.ValueList : {
        CollectionPath : 'Clients',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : client_ID,
                ValueListProperty : 'ID'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'customerCode'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'name'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'city'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'phone'
            }
        ]
    };

    material @Common.ValueList : {
        CollectionPath : 'Materials',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : material_ID,
                ValueListProperty : 'ID'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'materialCode'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'description'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'unitOfMeasure'
            }
        ]
    };

    assignedHumanResource @Common.ValueList : {
        CollectionPath : 'AvailableHumanResources',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : assignedHumanResource_ID,
                ValueListProperty : 'ID'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'employeeCode'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'fullName'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'status'
            }
        ]
    };

    assignedMaterialResource @Common.ValueList : {
        CollectionPath : 'AvailableMaterialResources',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : assignedMaterialResource_ID,
                ValueListProperty : 'ID'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'equipmentCode'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'name'
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'status'
            }
        ]
    };
};


/* ===================================================== */
/* TOURS - MAIN PLANNING APPLICATION */
/* ===================================================== */

annotate service.Tours with @(

    UI.HeaderInfo : {
        TypeName       : 'Tournée',
        TypeNamePlural : 'Tournées de collecte',
        Title          : {
            Value : tourNumber
        },
        Description    : {
            Value : status
        }
    },

    UI.SelectionFields : [
        tourNumber,
        collectionDate,
        client_ID,
        material_ID,
        status,
        assignedHumanResource_ID,
        assignedMaterialResource_ID
    ],

    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'N° tournée',
            Value : tourNumber,
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Label : 'Date de collecte',
            Value : collectionDate,
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Label : 'Client',
            Value : client.name,
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Label : 'Matériau',
            Value : material.description,
            ![@UI.Importance] : #High
        },
        {
            $Type : 'UI.DataField',
            Label : 'Quantité',
            Value : quantity
        },
        {
            $Type : 'UI.DataField',
            Label : 'Unité',
            Value : unitOfMeasure
        },
        {
            $Type : 'UI.DataField',
            Label : 'Ressource humaine',
            Value : assignedHumanResource.fullName
        },
        {
            $Type : 'UI.DataField',
            Label : 'Ressource matérielle',
            Value : assignedMaterialResource.name
        },
        {
            $Type : 'UI.DataField',
            Label : 'Statut',
            Value : status,
            Criticality : statusCriticality,
            CriticalityRepresentation : #WithIcon,
            ![@UI.Importance] : #High
        }
    ],

    UI.Identification : [
        {
            $Type : 'UI.DataField',
            Label : 'N° tournée',
            Value : tourNumber
        },
        {
            $Type : 'UI.DataField',
            Label : 'Date de collecte',
            Value : collectionDate
        },
        {
            $Type : 'UI.DataField',
            Label : 'Client',
            Value : client_ID
        },
        {
            $Type : 'UI.DataField',
            Label : 'Matériau',
            Value : material_ID
        },
        {
            $Type : 'UI.DataField',
            Label : 'Quantité',
            Value : quantity
        },
        {
            $Type : 'UI.DataField',
            Label : 'Unité de mesure',
            Value : unitOfMeasure
        },
        {
            $Type : 'UI.DataField',
            Label : 'Ressource humaine',
            Value : assignedHumanResource_ID
        },
        {
            $Type : 'UI.DataField',
            Label : 'Ressource matérielle',
            Value : assignedMaterialResource_ID
        },
        {
            $Type : 'UI.DataField',
            Label : 'Statut',
            Value : status,
            Criticality : statusCriticality,
            CriticalityRepresentation : #WithIcon
        },
        {
            $Type : 'UI.DataField',
            Label : 'Remarques',
            Value : remarks
        }
    ],

    UI.Facets : [
        {
            $Type  : 'UI.ReferenceFacet',
            Label  : 'Création de la tournée',
            Target : '@UI.FieldGroup#CreateTour'
        },
        {
            $Type  : 'UI.ReferenceFacet',
            Label  : 'Affectation des ressources',
            Target : '@UI.FieldGroup#Resources'
        },
        {
            $Type  : 'UI.ReferenceFacet',
            Label  : 'Suivi de la tournée',
            Target : '@UI.FieldGroup#Tracking'
        }
    ],

    UI.FieldGroup #CreateTour : {
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'Date de collecte',
                Value : collectionDate
            },
            {
                $Type : 'UI.DataField',
                Label : 'Client',
                Value : client_ID
            },
            {
                $Type : 'UI.DataField',
                Label : 'Matériau',
                Value : material_ID
            },
            {
                $Type : 'UI.DataField',
                Label : 'Quantité',
                Value : quantity
            },
            {
                $Type : 'UI.DataField',
                Label : 'Unité de mesure',
                Value : unitOfMeasure
            },
            {
                $Type : 'UI.DataField',
                Label : 'Remarques',
                Value : remarks
            }
        ]
    },

    UI.FieldGroup #Resources : {
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'Ressource humaine disponible',
                Value : assignedHumanResource_ID
            },
            {
                $Type : 'UI.DataField',
                Label : 'Ressource matérielle disponible',
                Value : assignedMaterialResource_ID
            }
        ]
    },

    UI.FieldGroup #Tracking : {
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'N° tournée',
                Value : tourNumber
            },
            {
                $Type : 'UI.DataField',
                Label : 'Statut',
                Value : status,
                Criticality : statusCriticality,
                CriticalityRepresentation : #WithIcon
            }
        ]
    }
);


/* ===================================================== */
/* CLIENTS */
/* ===================================================== */

annotate service.Clients with @(

    UI.HeaderInfo : {
        TypeName       : 'Client',
        TypeNamePlural : 'Clients',
        Title          : {
            Value : name
        },
        Description    : {
            Value : customerCode
        }
    },

    UI.SelectionFields : [
        customerCode,
        name,
        city
    ],

    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Code client',
            Value : customerCode
        },
        {
            $Type : 'UI.DataField',
            Label : 'Nom du client',
            Value : name
        },
        {
            $Type : 'UI.DataField',
            Label : 'Ville',
            Value : city
        },
        {
            $Type : 'UI.DataField',
            Label : 'Téléphone',
            Value : phone
        }
    ]
);


/* ===================================================== */
/* MATERIALS */
/* ===================================================== */

annotate service.Materials with @(

    UI.HeaderInfo : {
        TypeName       : 'Matériau',
        TypeNamePlural : 'Matériaux',
        Title          : {
            Value : description
        },
        Description    : {
            Value : materialCode
        }
    },

    UI.SelectionFields : [
        materialCode,
        description,
        unitOfMeasure
    ],

    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Code matériau',
            Value : materialCode
        },
        {
            $Type : 'UI.DataField',
            Label : 'Description',
            Value : description
        },
        {
            $Type : 'UI.DataField',
            Label : 'Unité',
            Value : unitOfMeasure
        }
    ]
);


/* ===================================================== */
/* HUMAN RESOURCES */
/* ===================================================== */

annotate service.HumanResources with @(

    UI.HeaderInfo : {
        TypeName       : 'Ressource humaine',
        TypeNamePlural : 'Ressources humaines',
        Title          : {
            Value : fullName
        },
        Description    : {
            Value : employeeCode
        }
    },

    UI.SelectionFields : [
        employeeCode,
        fullName,
        status
    ],

    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Matricule',
            Value : employeeCode
        },
        {
            $Type : 'UI.DataField',
            Label : 'Nom complet',
            Value : fullName
        },
        {
            $Type : 'UI.DataField',
            Label : 'Disponibilité',
            Value : status
        }
    ]
);


/* ===================================================== */
/* AVAILABLE HUMAN RESOURCES - VALUE HELP */
/* ===================================================== */

annotate service.AvailableHumanResources with @(

    UI.HeaderInfo : {
        TypeName       : 'Ressource humaine disponible',
        TypeNamePlural : 'Ressources humaines disponibles',
        Title          : {
            Value : fullName
        },
        Description    : {
            Value : employeeCode
        }
    },

    UI.SelectionFields : [
        employeeCode,
        fullName,
        status
    ],

    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Matricule',
            Value : employeeCode
        },
        {
            $Type : 'UI.DataField',
            Label : 'Nom complet',
            Value : fullName
        },
        {
            $Type : 'UI.DataField',
            Label : 'Disponibilité',
            Value : status
        }
    ]
);


/* ===================================================== */
/* MATERIAL RESOURCES */
/* ===================================================== */

annotate service.MaterialResources with @(

    UI.HeaderInfo : {
        TypeName       : 'Ressource matérielle',
        TypeNamePlural : 'Ressources matérielles',
        Title          : {
            Value : name
        },
        Description    : {
            Value : equipmentCode
        }
    },

    UI.SelectionFields : [
        equipmentCode,
        name,
        status
    ],

    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Code équipement',
            Value : equipmentCode
        },
        {
            $Type : 'UI.DataField',
            Label : 'Équipement',
            Value : name
        },
        {
            $Type : 'UI.DataField',
            Label : 'Disponibilité',
            Value : status
        }
    ]
);


/* ===================================================== */
/* AVAILABLE MATERIAL RESOURCES - VALUE HELP */
/* ===================================================== */

annotate service.AvailableMaterialResources with @(

    UI.HeaderInfo : {
        TypeName       : 'Ressource matérielle disponible',
        TypeNamePlural : 'Ressources matérielles disponibles',
        Title          : {
            Value : name
        },
        Description    : {
            Value : equipmentCode
        }
    },

    UI.SelectionFields : [
        equipmentCode,
        name,
        status
    ],

    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Code équipement',
            Value : equipmentCode
        },
        {
            $Type : 'UI.DataField',
            Label : 'Équipement',
            Value : name
        },
        {
            $Type : 'UI.DataField',
            Label : 'Disponibilité',
            Value : status
        }
    ]
);


/* ===================================================== */
/* ANALYTICS */
/* ===================================================== */

annotate service.TourStatusAnalytics with @(

    UI.HeaderInfo : {
        TypeName       : 'Statistique',
        TypeNamePlural : 'Statistiques des tournées',
        Title          : {
            Value : status
        }
    },

    UI.SelectionFields : [
        status
    ],

    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Statut',
            Value : status
        },
        {
            $Type : 'UI.DataField',
            Label : 'Nombre de tournées',
            Value : toursCount
        },
        {
            $Type : 'UI.DataField',
            Label : 'Quantité totale',
            Value : totalQuantity
        }
    ],

    UI.Chart #ToursByStatus : {
        Title : 'Répartition des tournées par statut',
        ChartType : #Column,
        Dimensions : [
            status
        ],
        Measures : [
            toursCount
        ]
    },

    UI.PresentationVariant #ToursByStatusPV : {
        Text : 'Tournées par statut',
        Visualizations : [
            '@UI.Chart#ToursByStatus'
        ]
    }
);
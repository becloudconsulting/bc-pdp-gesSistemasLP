sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/Filter',
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/export/Spreadsheet",
    "sap/m/MessageToast",
    "sap/ui/export/library"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Filter, MessageBox, JSONModel, Spreadsheet, MessageToast, exportLibrary) {
        "use strict";
        var EdmType = exportLibrary.EdmType;

    return Controller.extend("com.becloud.pdp.gessistemas.controller.NewSystem", {
        onInit: function () {
            this.CreatemodelParam();
            this.indexStep = 0;

        },
        CreatemodelParam: function () {
            this.getView().setModel(new JSONModel([
                { editable: true, ID_PROP: 1, NOMBRE_CAMPO: 'USUARIO', DESCRIP_CAMPO: 'Campo referente al nombre', FECHA_CREACION: '21/09/2024', PLAZO_INDIVIDUAL: 'No aplica' , Atributo: 'name_user'},
                { editable: true, ID_PROP: 2, NOMBRE_CAMPO: 'CORREO ELECTRÓNICO', DESCRIP_CAMPO: 'Campo referente al correo', FECHA_CREACION: '05/09/2024', PLAZO_INDIVIDUAL: 'No aplica' , Atributo: 'last_name'},
                { editable: true, ID_PROP: 3, NOMBRE_CAMPO: 'DATOS SEGURO COMPLEMENTARIO', DESCRIP_CAMPO: 'N/A', FECHA_CREACION: '23/09/2024', PLAZO_INDIVIDUAL: 'No aplica' , Atributo: 'email'},
                { editable: true, ID_PROP: 4, NOMBRE_CAMPO: 'FECHA', DESCRIP_CAMPO: 'Fecha nacimiento', FECHA_CREACION: '29/09/2024', PLAZO_INDIVIDUAL: 'No aplica',Atributo: 'date' },
            ]), "oModelParam");
        },

        onCreateParam: function(){

               // Comprobamos si el fragmento ya está creado antes de abrirlo
               if (!this.oViewCreate) {
                this.oViewCreate = sap.ui.xmlfragment("com.becloud.pdp.gessistemas.view.fragments.paramEntr", this);
                this.getView().addDependent(this.oViewCreate); // Aseguramos que el fragmento sea dependiente de la vista
            }

            // Abrimos el fragmento
            this.oViewCreate.open(); // Usamos `open` para asegurarnos de que se vea correctamente

            // Opcional: podemos escuchar el evento de cerrar
            this.oViewCreate.attachAfterClose(function () {
                this.oViewCreate.destroy();
                this.oViewCreate = null; // Limpiamos la referencia para evitar fugas de memoria
            }.bind(this));
		},

        onNewFieldonCrear: function() {
            let model = this.getView().getModel('oModelParam');
            let data = model.getData();
            data.push({ editable: true, ID_PROP: '', NOMBRE_CAMPO: '', ESTADO: '', FECHA_CREACION: '', CRITICIDAD: '' });
            model.setData(data);
            model.refresh();
        },

        onGoConexiones: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteListUserData");
        },

        onNextStep: function () {
            var oWizard = this.getView().byId("CredencialesWizard");
            oWizard.nextStep();
 
            // Generar el formulario dinámico en el Paso 3
            this.optionalStepActivation();
        },

        onSiguiente2: function () {
            var oWizard = this.byId("CreateProductWizard"); // Obtener el control del Wizard
            var oNextButton = this.byId("nextButton"); // Obtener el botón "Siguiente"

            // Incrementar la propiedad indexStep
            this.indexStep++;

            // Avanzar al siguiente paso
            oWizard.nextStep();

            // Imprimir el valor de indexStep para ver en qué paso estamos
            console.log("Índice del paso actual: " + this.indexStep);

            // Verificar si es el último paso (cuando indexStep sea 3)
            if (this.indexStep >= 1) {
                // Cambiar el texto del botón a "Guardar"
                oNextButton.setText("Crear sistema");

                // Asociar la función para guardar (puedes asociar el onPress de este botón a un método de guardar)
                oNextButton.attachPress(this.onGuardar, this);
            } else {
                // Si no es el último paso, mantenemos el texto como "Siguiente"
                oNextButton.setText("Siguiente");
            }
        },
        onGuardar: function () {
            var that = this; // Referencia al controlador
        
            sap.m.MessageBox.warning("¿Desea agregar una API al sistema?", {
                title: "Confirmación",
                actions: [
                    "Si, agregar API",
                    "Sólo crear sistema"
                ],
                emphasizedAction: "Si, agregar API",
                styleClass: "sapUiSizeCompact", // Para mejorar en escritorio
                contentWidth: "25rem", // Ajusta el ancho del MessageBox
                onClose: function (sAction) {
                    if (sAction === "Si, agregar API") {
                        that.getOwnerComponent().getRouter().navTo("RouteListUserData");
                    } else if (sAction === "Sólo crear sistema") {
                        that.getOwnerComponent().getRouter().navTo("RouteMain"); // Cambia "RouteMain" por la ruta que necesites
                    }
                }
            });
        }
        ,

        onDialogQuestion: function(){

            // Comprobamos si el fragmento ya está creado antes de abrirlo
            if (!this.oViewCreate4) {
             this.oViewCreate4 = sap.ui.xmlfragment("com.becloud.pdp.gessistemas.view.fragments.QuestionGoConexiones", this);
             this.getView().addDependent(this.oViewCreate4); // Aseguramos que el fragmento sea dependiente de la vista
         }

         // Abrimos el fragmento
         this.oViewCreate4.open(); // Usamos `open` para asegurarnos de que se vea correctamente

         // Opcional: podemos escuchar el evento de cerrar
         this.oViewCreate4.attachAfterClose(function () {
             this.oViewCreate4.destroy();
             this.oViewCreate4 = null; // Limpiamos la referencia para evitar fugas de memoria
         }.bind(this));
     },

        onSaveSistema: function() {
            
        },

        onCloseDialogConfirmSistema: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteMain");
        },
        onCancelCreacionSistema: function () {
            var that = this; // Guardamos la referencia al controlador
        
            sap.m.MessageBox.warning("¿Estás seguro de que deseas cancelar la creación del sistema?", {
                title: "Confirmación",
                actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                emphasizedAction: sap.m.MessageBox.Action.OK,
                onClose: function (sAction) {
                    if (sAction === sap.m.MessageBox.Action.OK) {
                        // Si el usuario presiona OK, lo llevamos a la vista "VistaAceptar"
                        that.getOwnerComponent().getRouter().navTo("RouteMain");
                    } else if (sAction === sap.m.MessageBox.Action.CANCEL) {
                        // Si el usuario presiona CANCEL, lo llevamos a la vista "VistaCancelar"
                        this.MessageBox.onClose();
                    }
                }
            });
        },

        onSystemChange: function(oEvent) {
            var sSelectedKey = oEvent.getParameter("selectedItem").getKey();
            var oFileUploader = this.byId("fileUploader");
            
            oFileUploader.setVisible(sSelectedKey === "Externo");
        },


        
        

        
    })
 }
);
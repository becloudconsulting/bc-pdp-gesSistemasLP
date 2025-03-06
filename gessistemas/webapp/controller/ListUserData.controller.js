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

    return Controller.extend("com.becloud.pdp.gessistemas.controller.ListUserData", {
        onInit: function () {
            this.onBusyDialog("Open");
            var OmodelTableUser = new sap.ui.model.json.JSONModel({
                isSecondTableVisible: false
            });
            this.getView().setModel(OmodelTableUser);
            // LE AGREGUÉ EL GETCONEXION AQUÍ EN EL ONINIT
            this.onBusyDialog("Open");
            this.getConexion().then(function (responseConexion){
                var oModelConexion = new JSONModel(responseConexion.rsp);
                this.getView().setModel(oModelConexion, "oModelConexionFF");
                this.onBusyDialog("Close");
            }.bind(this))

            this.getCompanySystemRequest().then(function (responseCompanySystemRequest){
                this.onBusyDialog("Open");
                var oModelCompanySystemRequest = new JSONModel(responseCompanySystemRequest.rsp);
                this.getView().setModel(oModelCompanySystemRequest, "oModelCompanySystemRequest");
                this.onBusyDialog("Close");
            }.bind(this))

            this.getUsersData().then(function (responseUsersData){
                this.onBusyDialog("Open");
                var oModelUsersData = new JSONModel(responseUsersData.rsp);
                this.getView().setModel(oModelUsersData, "oModelUsersData");
                this.onBusyDialog("Close");
            }.bind(this))

            /*this.getUserData().then(function (responseUserData){
                this.onBusyDialog("Open");
                var oModelUserData = new JSONModel(responseUserData.rsp);
                this.getView().setModel(oModelUserData, "oModelUserData");
                this.onBusyDialog("Close");
            }.bind(this))*/

            //LE AGREGE LOS SIGUIENTES BLOQUES PARA EL FRAGMENT DE INGRESAR NUEVA CONEXION


            //HASTA AQUI
        },

        /* onResetFilters: function () {
            this.getView().byId("ipNameSearch").setValue();
            this.getView().byId("slEstadoSearch").setSelectedKey("0");
            this.getView().byId("slFechaSearch").setDateValue(null);

            var oTable = this.getView().byId("idListUsersTable");
            oTable.getBinding("items").filter([], sap.ui.model.FilterType.Application);
        }, */

        onCreateRequest: function () {
            this.oViewCreateRequest = sap.ui.xmlfragment("com.becloud.pdp.gessistemas.view.fragments.createRequest", this);
            this.getView().addDependent(this.oViewCreateRequest);
            
            this.oViewCreateRequest.attachAfterClose(function () {
                this.oViewCreateRequest.destroy();
            }.bind(this));
            
            this.getCompanySystemRequest().then(function (responseCompanySystemRequest) {
                if (responseCompanySystemRequest.state) {
                    this.oViewCreateRequest.open();
                } else {
                    this.oViewCreateRequest.destroy();
                    //MESSAGE
                }
            }.bind(this));
        },

        onCloseCreateRequest: function () {
            this.oViewCreateRequest.close();
        },

        onEdit: function (oEvent) {
            this.oViewEditUserData = sap.ui.xmlfragment("com.becloud.pdp.gessistemas.view.fragments.editUserData", this);
            this.getView().addDependent(this.oViewEditUserData);
        
            this.oViewEditUserData.attachAfterClose(function () {
                this.oViewEditUserData.destroy();
            }.bind(this));
        
            // Obtener el contexto del elemento seleccionado
            var oContext = oEvent.getSource().getBindingContext("oModelUsersData");
            
            if (oContext) {
                var userName = oContext.getObject().firstName + " " + oContext.getObject().lastName;
                sap.ui.getCore().byId("dlgEditUserData").setTitle("Editar Usuario: " + userName);
        
                // Vincular el elemento del fragmento con el contexto del modelo
                this.oViewEditUserData.bindElement({
                    path: oContext.sPath,
                    model: "oModelUsersData"
                });
        
                // Abrir el diálogo
                this.oViewEditUserData.open();
            }
        },
        
        onSaveEdit: function () {
            var firstName = sap.ui.getCore().byId("ipFirstNameEdit").getValue().trim();
            var lastName = sap.ui.getCore().byId("ipLastNameEdit").getValue().trim();
            var email = sap.ui.getCore().byId("ipEmailEdit").getValue().trim();
            var rut = sap.ui.getCore().byId("ipRutEdit").getValue().trim();
            var status = sap.ui.getCore().byId("slStatusEdit").getSelectedKey();
            var creationDate = sap.ui.getCore().byId("ipCreationDateEdit").getValue();
            var phone = sap.ui.getCore().byId("ipPhoneEdit").getValue().trim();
        
            if (!firstName || !lastName || !email || !rut || !status || !creationDate || !phone) {
                MessageBox.error("Por favor, complete todos los campos requeridos.");
                return;
            }
            
            var sPath = this.oViewEditUserData.getBindingContext("oModelUsersData").sPath;
        
            var oModel = this.getView().getModel("oModelUsersData");
            var updatedData = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                rut: rut,
                status: status,
                creationDate: creationDate,
                phone: phone
            };
        
            // Actualizar el modelo con los nuevos datos
            oModel.setProperty(sPath, updatedData);
            
            // Refrescar el modelo
            oModel.refresh();
        
            MessageBox.success("Los cambios se han guardado correctamente.");
            
            this.oViewEditUserData.close();
        },
        
        onCloseEdit: function () {
            this.oViewEditUserData.close();
        },
        
        onShowInformation: function (oEvent) {
            this.oViewInfoUser = sap.ui.xmlfragment("com.becloud.pdp.gessistemas.view.fragments.informacionUserData", this);
            this.getView().addDependent(this.oViewInfoUser);
        
            this.oViewInfoUser.attachAfterClose(function () {
                this.oViewInfoUser.destroy();
            }.bind(this));
        
            var oContext = oEvent.getSource().getBindingContext("oModelUsersData");
            
            if (oContext) {
                var userName = oContext.getObject().firstName + " " + oContext.getObject().lastName;
                sap.ui.getCore().byId("dlgInfoUser").setTitle("Información del Usuario: " + userName);

                this.oViewInfoUser.bindElement({
                    path: oContext.sPath,
                    model: "oModelUsersData"
                });
                
                this.oViewInfoUser.open();
            }
        },
        
        onCloseInfoUser: function () {
            this.oViewInfoUser.close();
        },       

        getUsersData: function () {
            return new Promise(
                function resolver(resolve) {
                    resolve({
                        state: true,
                        rsp: [
                            {
                                id: "1",
                                API_name: "Becloud",
                                Tipo_conexion: "REST",
                                Metodo: "GET",
                                Path: "abcd/aa/bd",
                                Host: "host.cl",
                                status: "Activo",
                                creationDate: "2023-01-01",
                                RequestData: [
                                    { id: "1", campo: "Nombre", descripcion: "Mi nombre correcto es Juanito", fechaLimite: "2025-01-30", alerta: "Tipo 1" },
                                    { id: "2", campo: "Apellido", descripcion: "Mi apellido correcto es Mendez", fechaLimite: "2025-02-15", alerta: "Tipo2" },
                                    { id: "3", campo: "Rut", descripcion: "Mi Rut correcto es 21.059.237-7", fechaLimite: "2025-03-10", alerta: "Tipo 3" }
                                ]
                            },
                            {
                                id: "2",
                                API_name: "Gasco",
                                Tipo_conexion: "ODATA",
                                Metodo: "GET",
                                Path: "abcd/aa/bd",
                                Host: "host.cl",
                                status: "Activo",
                                creationDate: "2023-01-01",
                            },
                            {
                                id: "2",
                                API_name: "Crear_usuarios",
                                Tipo_conexion: "ODATA",
                                Metodo: "POST",
                                Path: "abcd/aa/bd",
                                Host: "host.cl",
                                status: "Activo",
                                creationDate: "2023-01-01",
                            }
                        ]
                    })
                    /* this.getOwnerComponent().getModel().read("/Users-Data", {
                        urlParameters: {
                        }, 
                        success: function (oResult) {
                            resolve({
                                state: true,
                                rsp: oResult.results
                            });
                        }.bind(this),
                        error: function (oError) {
                            resolve({
                                state: false,
                                msg: oError.responseText
                            });
                        }.bind(this)
                    }) */
                }.bind(this));
        },
        getUserData: function () {
            return new Promise(
                function resolver(resolve) {
                    resolve({
                        state: true,
                        rsp: [
                            {
                                id: "1",
                                firstName: "Juan",
                                lastName: "Pérez",
                                email: "juan.perez@example.com",
                                rut: "12345678-9",
                                status: "Activo",
                                creationDate: "2023-01-01",
                                phone: "+56 9 1234 5678"
                            },
                        ]
                    })
                }.bind(this));
        },

        getCompanySystemRequest: function () {
            return new Promise(
                function resolver(resolve) {
                    resolve({
                        state: true,
                        rsp: [
                            {
                                id: "1",
                                campo: "Empresa A",
                                description: "Descripción del producto A",
                                plazoConservacion: "2024-01-01",
                                alerta: "Tipo 1",
                                creationDate: "2023-01-01",
                            },
                            {
                                id: "2",
                                campo: "Empresa B",
                                description: "Descripción del producto B",
                                plazoConservacion: "2023-01-02",
                                alerta: "Tipo 2",
                                creationDate: "2023-01-02",
                            }
                        ]
                    })
                    /* this.getOwnerComponent().getModel().read("/Company-System", {
                        urlParameters: {
                            "$expand": "Category,Supplier,Order_Details/Order"
                        }, 
                        success: function (oResult) {
                            resolve({
                                state: true,
                                rsp: oResult.results
                            });
                        }.bind(this),
                        error: function (oError) {
                            resolve({
                                state: false,
                                msg: oError.responseText
                            });
                        }.bind(this)
                    }) */
                }.bind(this));
        },
        
        updateFinished: function (oEvent) {
            var total = oEvent.getParameter("total")
            this.getView().byId("idListUsersData").setText("Registros (" + total + ")");
        },

        updateFinishedUser: function (oEvent) {
            var total = oEvent.getParameter("total")
            this.getView().byId("idListUserData").setText("Registros (" + total + ")");
        },

        liveChange: function (oEvent) {
            var _oInput = oEvent.getSource();
            _oInput.setValueState("None");
        },

        onlyNumber: function (oEvent) {
            this.liveChange(oEvent);
            var _oInput = oEvent.getSource();
            var val = _oInput.getValue();
            val = val.replace(/[^\d]/g, '');
            _oInput.setValue(val);
        },

        formatterNA: function (sValue) {
            if (!sValue) {
                return "N/A";
            } else {
                return sValue;
            }
        },

        formatterActive: function (sValue) {
            var vis = true;
            if (!sValue) {
                vis = false;
            }
            return vis;
        },

        formatterDesc: function (sValue) {
            var vis = false;
            if (!sValue) {
                vis = true;
            }
            return vis;
        },
        //USAD0
        formatterEstado: function (sValue) {
            var text = "Activo";
            if (sValue === "2") {
                text = "Inactivo";
            }
            return text;
        },
        //USADO
        formatterState: function (sValue) {
            var state = "Success";
            if (sValue === "2") {
                state = "Warning";
            }
            return state;
        },
        //USADO
        formatDate: function (sValue) {
            if (!(sValue instanceof Date)) {
                sValue = new Date(sValue);
            }
            var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
                pattern: "yyyy-MM-dd",
                strictParsing: true,
                UTC: false
            });
        
            return oDateFormat.format(sValue);
        },
        formatterDate: function (sValue) {
            var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
                pattern: "yyyy-MM-dd",
                UTC: false
            });
            sValue = oDateFormat.format(sValue);
            return sValue;
        },
        //USADO
        handleChange: function (oEvent) {
            var oText = this.byId("textResult"),
                oDP = oEvent.getSource(),
                sValue = oEvent.getParameter("value"),
                bValid = oEvent.getParameter("valid");

            this._iEvent++;
            oText.setText("Change - Event " + this._iEvent + ": DatePicker " + oDP.getId() + ":" + sValue);

            if (bValid) {
                oDP.setValueState(ValueState.None);
            } else {
                oDP.setValueState(ValueState.Error);
            }
        },
        //USADO
        onBusyDialog: function (Accion) {
            if (Accion === "Open") {
                if (!this.oBusyDialog) {
                    this.oBusyDialog = sap.ui.xmlfragment("com.becloud.pdp.gessistemas.view.fragments.busyDialog", this);
                }
                this.oBusyDialog.open();
            } else {
                this.oBusyDialog.close();
            }
        },

        onToggleTables: function () {
            var oModel = this.getView().getModel();
            var isSecondTableVisible = oModel.getProperty("/isSecondTableVisible");
        
            oModel.setProperty("/isSecondTableVisible", !isSecondTableVisible);
        },
        
        onOpenModal: function(oEvent) {
            this.getUsersData().then(function(data) {
                if (data.state && data.rsp.length > 0) {
                    var user = data.rsp[0];
                    var userId = user.id; // Captura el ID del usuario
                    console.log(userId);
                    var aData = user.RequestData;
        
                    if (!this._oDialog) {
                        this._oDialog = new sap.m.Dialog({
                            title: 'Peticiones de Cambios',
                            contentWidth: "80%",
                            contentHeight: "60%",
                            content: this._createRequestTable(aData, userId), // Pasa userId a la tabla
                            beginButton: new sap.m.Button({
                                text: 'Cerrar',
                                press: function () {
                                    this._oDialog.close();
                                }.bind(this)
                            })
                        });
                    }
                    this._oDialog.open();
                } else {
                    console.error("No se encontraron datos válidos.");
                }
            }.bind(this)).catch(function(error) {
                console.error("Error al obtener los datos:", error);
            });
        },
        
        _createRequestTable: function(aData, userId) { // Asegúrate de recibir userId
            var oTable = new sap.m.Table({
                columns: [
                    new sap.m.Column({ header: new sap.m.Label({ text: "Campo" }) }),
                    new sap.m.Column({ header: new sap.m.Label({ text: "Descripción" }) }),
                    new sap.m.Column({ header: new sap.m.Label({ text: "Fecha Límite" }) }),
                    new sap.m.Column({ header: new sap.m.Label({ text: "Alerta" }) })
                ]
            });
        
            aData.forEach(function(oRequest) {
                console.log(oRequest);
                var oRow = new sap.m.ColumnListItem({
                    type: "Active",
                    cells: [
                        new sap.m.Text({ text: oRequest.campo }),
                        new sap.m.Text({ text: oRequest.descripcion }),
                        new sap.m.Text({ text: oRequest.fechaLimite }),
                        new sap.m.Text({ text: oRequest.alerta })
                    ],
                    press: function() {
                        this.onEditRequest(userId); // Llama a la función de edición con el ID correcto
                    }.bind(this)
                });
                oTable.addItem(oRow);
            }.bind(this));
        
            return oTable;
        },
        
        onCreateConexion: function(){
            this.oViewCreateConexion = sap.ui.xmlfragment("com.becloud.pdp.gessistemas.view.fragments.createConexion", this);
            this.getView().addDependent(this.oViewCreateConexion);

            this.oViewCreateConexion.attachAfterClose(function () {
                this.oViewCreateConexion.destroy();
            }.bind(this));

            this.getConexion().then(function (responseConexion) {

                if (responseConexion.state) {
                    this.oViewCreateConexion.open();
                } else {
                    this.oViewCreateConexion.destroy();
                    //MESSAGE
                }
            }.bind(this));
        
        },

        getConexion: function () {
   
            return new Promise(
                function resolver(resolve) {
                    resolve({
                        state: true,
                        rsp: [
                            {
                                "id": "10",
                                "name_conexion": "Tech Solutions Inc.",
                                "name_metodo": "GET",
                                "name_path": "/api/v1/users",
                                "creationDate": "Fri Jan 17 2025 00:00:00 GMT-0400",
                                "name_tipo": "API",
                                "name_estado": "1",
                                "name_descrip": "Servicio para obtener información de usuarios.",
                                "name_token": "abc123xyzzzz"
                            }

                        ]                            
                    })
                }.bind(this));
        },


        onRefresh: function () {
            this.onBusyDialog("Open");

            var oModelConexion= new JSONModel([]);
            this.getView().setModel(oModelConexion, "oModelConexionFF");

            this.getConexion().then(function (response) {
                this.onBusyDialog("Close");
                if (response.state) {
                    oModelConexion.setData(response.rsp)
                    oModelConexion.refresh();
                } else {
                    MessageBox.error(response.msg, {
                        title: "Obtención de datos"
                    });
                }
            }.bind(this));
        },
        onEditRequest: function(userId) {
            console.log("ID del usuario para editar:", userId); // Verifica que se pase correctamente
            // Cerrar el modal de detalles de solicitudes
            if (this._oDialog) {
                this._oDialog.close();
            }
        
            // Llamar a la función onEdit pasando el ID del registro
            var oContext = {
                sPath: "/oModelUsersData/" + userId // Asegúrate de que este ID sea correcto
            };
        
            // Abrir el modal de edición
            this.onEdit({
                getSource: function() {
                    return {
                        getBindingContext: function() {
                            return oContext;
                        }
                    };
                }
            });
        }
        
        
        
    });
});

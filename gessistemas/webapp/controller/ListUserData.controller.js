sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/Filter',
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/export/Spreadsheet",
    "sap/m/MessageToast",
    "sap/ui/export/library",
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
                this.getConexion().then(function (responseConexion) {
                    var oModelConexion = new JSONModel(responseConexion.rsp);
                    this.getView().setModel(oModelConexion, "oModelConexionFF");
                    this.onBusyDialog("Close");
                }.bind(this))

                this.getCompanySystemRequest().then(function (responseCompanySystemRequest) {
                    this.onBusyDialog("Open");
                    var oModelCompanySystemRequest = new JSONModel(responseCompanySystemRequest.rsp);
                    this.getView().setModel(oModelCompanySystemRequest, "oModelCompanySystemRequest");
                    this.onBusyDialog("Close");
                }.bind(this))

                this.getUsersData().then(function (responseUsersData) {
                    this.onBusyDialog("Open");
                    var oModelUsersDataBase = new JSONModel(responseUsersData.rsp);
                    this.getView().setModel(oModelUsersDataBase, "oModelUsersData");
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

                this.CreatemodelParam();

                //const oModelCatalog = new JSONModel("model/data/catalog.json");

			//this.getView().setModel(oModelCatalog);
			//this._aClipboardData = [];
            
            this.createCatalogModel();
            this.createCatalogModelOutput();


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
                                    Descripcion: "API principal permite recuperar los datos del sistema HANA",
                                    Metodo: "GET",
                                    Path: "abcd/aa/bd",
                                    Host: "host.cl",
                                    status: "Activo",
                                    creationDate: "2023-01-01",
                                    updateDate: "2023-01-01",
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
                                    Descripcion: "API principal permite recuperar los datos del sistema HANA",
                                    Metodo: "GET",
                                    Path: "abcd/aa/bd",
                                    Host: "host.cl",
                                    status: "Activo",
                                    creationDate: "2023-01-01",
                                    updateDate: "2023-02-01"
                                },
                                {
                                    id: "2",
                                    API_name: "Crear_usuarios",
                                    Tipo_conexion: "ODATA",
                                    Descripcion: "API principal permite recuperar los datos del sistema HANA",
                                    Metodo: "POST",
                                    Path: "abcd/aa/bd",
                                    Host: "host.cl",
                                    status: "Activo",
                                    creationDate: "2023-01-01",
                                     updateDate: "2023-02-01"
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
                this.getView().byId("idListUsersData").setText("Registros (" + total + ") ");
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
                    pattern: "dd/MM/yyyy",
                    strictParsing: true,
                    UTC: false
                });

                return oDateFormat.format(sValue);
            },
            formatterDate: function (sValue) {
                var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
                    pattern: "dd/MM/yyyy",
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

            onOpenModal: function (oEvent) {
                this.getUsersData().then(function (data) {
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
                }.bind(this)).catch(function (error) {
                    console.error("Error al obtener los datos:", error);
                });
            },

            _createRequestTable: function (aData, userId) { // Asegúrate de recibir userId
                var oTable = new sap.m.Table({
                    columns: [
                        new sap.m.Column({ header: new sap.m.Label({ text: "Campo" }) }),
                        new sap.m.Column({ header: new sap.m.Label({ text: "Descripción" }) }),
                        new sap.m.Column({ header: new sap.m.Label({ text: "Fecha Límite" }) }),
                        new sap.m.Column({ header: new sap.m.Label({ text: "Alerta" }) })
                    ]
                });

                aData.forEach(function (oRequest) {
                    console.log(oRequest);
                    var oRow = new sap.m.ColumnListItem({
                        type: "Active",
                        cells: [
                            new sap.m.Text({ text: oRequest.campo }),
                            new sap.m.Text({ text: oRequest.descripcion }),
                            new sap.m.Text({ text: oRequest.fechaLimite }),
                            new sap.m.Text({ text: oRequest.alerta })
                        ],
                        press: function () {
                            this.onEditRequest(userId); // Llama a la función de edición con el ID correcto
                        }.bind(this)
                    });
                    oTable.addItem(oRow);
                }.bind(this));

                return oTable;
            },

            onCreateConexion: function () {
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
            onCloseCreateConexion: function() {
                this.oViewCreateConexion.close();
            },

            getConexion: function () {

                return new Promise(
                    function resolver(resolve) {
                        resolve({
                            state: true,
                            rsp: [
                                {
                                    "id": "10",
                                    "name_conexion": "Tech Solutions Usuarios.",
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

                var oModelConexion = new JSONModel([]);
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
            onEditRequest: function (userId) {
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
                    getSource: function () {
                        return {
                            getBindingContext: function () {
                                return oContext;
                            }
                        };
                    }
                });
            },

            CreatemodelParam: function () {
                this.getView().setModel(new JSONModel([
                    { editable: true, ID_CAMPO_API: 1, NOMBRE_PARAM: ''},
                    { editable: true, ID_CAMPO_API: 2, NOMBRE_PARAM: '' },
                    { editable: true, ID_CAMPO_API: 3, NOMBRE_PARAM: '' },
                    { editable: true, ID_CAMPO_API: 4, NOMBRE_PARAM: '', },
                ]), "oModelParamEntrada"),

                    this.getView().setModel(new JSONModel([
                        { editable: false, id: 1, Atributo: 'JSON' },
                        { editable: false, id: 2, Atributo: 'String' },
                        { editable: false, id: 3, Atributo: 'Date' },
                        { editable: false, id: 4, Atributo: 'Integer' },
                        { editable: false, id: 4, Atributo: 'Otro' }
                    ]), "oModelTipoParametro")
            },
            onCreateParam: function () {
                var that = this;
            
                // Crear y abrir el BusyDialog si no existe
                if (!this._oBusyDialog) {
                    this._oBusyDialog = new sap.m.BusyDialog({
                        text: "Cargando...",
                    });
                }
                this._oBusyDialog.open();
            
                // Simulación de carga (puedes reemplazar setTimeout con una promesa o llamada a un servicio)
                setTimeout(function () {
                    // Comprobamos si el fragmento ya está creado antes de abrirlo
                    if (!that.oViewCreate8) {
                        that.oViewCreate8 = sap.ui.xmlfragment("com.becloud.pdp.gessistemas.view.fragments.paramEntr", that);
                        that.getView().addDependent(that.oViewCreate8); // Aseguramos que el fragmento sea dependiente de la vista
                    }
            
                    // Cerrar el BusyDialog
                    that._oBusyDialog.close();
            
                    // Abrimos el fragmento
                    that.oViewCreate8.open(); 
            
                    // Escuchamos el evento de cerrar para limpiar memoria
                    that.oViewCreate8.attachAfterClose(function () {
                        that.oViewCreate8.destroy();
                        that.oViewCreate8 = null; // Limpiamos la referencia para evitar fugas de memoria
                    });
            
                }, 1000); // Simula un retardo de 1 segundo (ajusta según necesidad)
            }
            ,
            onCloseParam: function(){
                this.oViewCreate8.close();

            },

            
           

                /*onCreateParam: function () {
                    // Comprobamos si el fragmento ya está creado antes de abrirlo
                    if (!this.oViewCreate8) {
                        this.oViewCreate8 = sap.ui.xmlfragment("com.becloud.pdp.gessistemas.view.fragments.paramEntr", this);
                        this.getView().addDependent(this.oViewCreate8); // Aseguramos que el fragmento sea dependiente de la vista
                    }
                
                    // Asignamos los modelos editables para ambos TreeTable
                    var oModelEditable = new sap.ui.model.json.JSONModel({
                        editable: true
                    });
                
                    this.oViewCreate8.setModel(oModelEditable, "oModelCatalog");
                    this.oViewCreate8.setModel(oModelEditable, "oModelCatalogOutput");
                
                    // Abrimos el fragmento
                    this.oViewCreate8.open(); // Usamos `open` para asegurarnos de que se vea correctamente
                
                    // Opcional: podemos escuchar el evento de cerrar
                    this.oViewCreate8.attachAfterClose(function () {
                        this.oViewCreate8.destroy();
                        this.oViewCreate8 = null; // Limpiamos la referencia para evitar fugas de memoria
                    }.bind(this));
                },*/
                

            onNewFieldonCrear: function () {
                let model = this.getView().getModel('oModelParamEntrada');
                let data = model.getData();
                data.push({ editable: true, ID_PROP: '', NOMBRE_CAMPO: '', ESTADO: '', FECHA_CREACION: '', CRITICIDAD: '' });
                model.setData(data);
                model.refresh();
            },

            onEditAPI: function (oEvent) {

                /*// Comprobamos si el fragmento ya está creado antes de abrirlo
                if (!this.oViewCreateAPI) {
                    this.oViewCreateAPI = sap.ui.xmlfragment("com.becloud.pdp.gessistemas.view.fragments.editAPI", this);
                    this.getView().addDependent(this.oViewCreateAPI); // Aseguramos que el fragmento sea dependiente de la vista
                }

                // Abrimos el fragmento
                this.oViewCreateAPI.open(); // Usamos `open` para asegurarnos de que se vea correctamente

                // Opcional: podemos escuchar el evento de cerrar
                this.oViewCreateAPI.attachAfterClose(function () {
                    this.oViewCreateAPI.destroy();
                    this.oViewCreateAPI = null; // Limpiamos la referencia para evitar fugas de memoria
                }.bind(this));*/




                this.oViewEditAPI = sap.ui.xmlfragment("com.becloud.pdp.gessistemas.view.fragments.editAPI", this);
                this.getView().addDependent(this.oViewEditAPI);

                this.oViewEditAPI.attachAfterClose(function () {
                    this.oViewEditAPI.destroy();
                }.bind(this));

                var API_name = oEvent.getSource().getBindingContext("oModelUsersData").getObject().API_name;
                sap.ui.getCore().byId("idFragmentEdit").setTitle("Editar conexión: "+ API_name);

                var sPath = oEvent.getSource().getBindingContext("oModelUsersData").sPath;
                this.oViewEditAPI.bindElement({
                    path: sPath,
                    model: "oModelUsersData"
                });
                this.oViewEditAPI.open();
            

            },
            onCloseEditConexion: function(){
                this.oViewEditAPI.close();
            },

            onDetailAPI: function(oEvent){

               /* // Comprobamos si el fragmento ya está creado antes de abrirlo
                if (!this.oViewDetailAPI) {
                    this.oViewDetailAPI = sap.ui.xmlfragment("com.becloud.pdp.gessistemas.view.fragments.detailsAPI", this);
                    this.getView().addDependent(this.oViewDetailAPI); // Aseguramos que el fragmento sea dependiente de la vista
                }

                // Abrimos el fragmento
                this.oViewDetailAPI.open(); // Usamos `open` para asegurarnos de que se vea correctamente

                // Opcional: podemos escuchar el evento de cerrar
                this.oViewDetailAPI.attachAfterClose(function () {
                    this.oViewDetailAPI.destroy();
                    this.oViewDetailAPI = null; // Limpiamos la referencia para evitar fugas de memoria
                }.bind(this));*/





                this.oViewDetailAPI = sap.ui.xmlfragment("com.becloud.pdp.gessistemas.view.fragments.detailsAPI", this);
                this.getView().addDependent(this.oViewDetailAPI);

                this.oViewDetailAPI.attachAfterClose(function () {
                    this.oViewDetailAPI.destroy();
                }.bind(this));

                var API_name = oEvent.getSource().getBindingContext("oModelUsersData").getObject().API_name;
                sap.ui.getCore().byId("idDetailFragment").setTitle("Detalle conexión: " + API_name);

                var sPath = oEvent.getSource().getBindingContext("oModelUsersData").sPath;
                this.oViewDetailAPI.bindElement({
                    path: sPath,
                    model: "oModelUsersData"
                });
                this.oViewDetailAPI.open();


            },

            onCloseDetailsAPI: function(){
                this.oViewDetailAPI.close();
            },

            









            // CÓDIGO PARA EL TREETABLE






            onCollapseAll: function() {
                const oTreeTable = this.byId("TreeTable");
                oTreeTable.collapseAll();
            },
            
            onExpandFirstLevel: function() {
                const oTreeTable = this.byId("TreeTable");
                oTreeTable.expandToLevel(1);
            },
            
            onDragStart: function(oEvent) {
                const oTreeTable = this.byId("TreeTable");
                const oDragSession = oEvent.getParameter("dragSession");
                const oDraggedRow = oEvent.getParameter("target");
                const iDraggedRowIndex = oDraggedRow.getIndex();
                const aSelectedIndices = oTreeTable.getSelectedIndices();
                const aDraggedRowContexts = [];
            
                if (aSelectedIndices.length > 0) {
                    // If rows are selected, do not allow to start dragging from a row which is not selected.
                    if (aSelectedIndices.indexOf(iDraggedRowIndex) === -1) {
                        oEvent.preventDefault();
                    } else {
                        for (let i = 0; i < aSelectedIndices.length; i++) {
                            aDraggedRowContexts.push(oTreeTable.getContextByIndex(aSelectedIndices[i]));
                        }
                    }
                } else {
                    aDraggedRowContexts.push(oTreeTable.getContextByIndex(iDraggedRowIndex));
                }
            
                oDragSession.setComplexData("hierarchymaintenance", {
                    draggedRowContexts: aDraggedRowContexts
                });
            },
            
            onDrop: function(oEvent) {
                const oTreeTable = this.byId("TreeTable");
                const oDragSession = oEvent.getParameter("dragSession");
                const oDroppedRow = oEvent.getParameter("droppedControl");
                const aDraggedRowContexts = oDragSession.getComplexData("hierarchymaintenance").draggedRowContexts;
                const oNewParentContext = oTreeTable.getContextByIndex(oDroppedRow.getIndex());
            
                if (aDraggedRowContexts.length === 0 || !oNewParentContext) {
                    return;
                }
            
                const oModelCatalog = oTreeTable.getBinding().getModel();
                const oNewParent = oNewParentContext.getProperty();
            
                // In the JSON data of this example the children of a node are inside an array with the name "categories".
                if (!oNewParent.categories) {
                    oNewParent.categories = []; // Initialize the children array.
                }
            
                for (let i = 0; i < aDraggedRowContexts.length; i++) {
                    if (oNewParentContext.getPath().indexOf(aDraggedRowContexts[i].getPath()) === 0) {
                        // Avoid moving a node into one of its child nodes.
                        continue;
                    }
            
                    // Copy the data to the new parent.
                    oNewParent.categories.push(aDraggedRowContexts[i].getProperty());
            
                    // Remove the data. The property is simply set to undefined to preserve the tree state (expand/collapse states of nodes).
                    oModelCatalog.setProperty(aDraggedRowContexts[i].getPath(), undefined, aDraggedRowContexts[i], true);
                }
            },
            
            onCut: function(oEvent) {
                const oTreeTable = this.byId("TreeTable");
                const aSelectedIndices = oTreeTable.getSelectedIndices();
                const oModelCatalog = oTreeTable.getBinding().getModel();
            
                if (aSelectedIndices.length === 0) {
                    MessageToast.show("Select at least one row first.");
                    return;
                }
            
                // Cut the data.
                for (let i = 0; i < aSelectedIndices.length; i++) {
                    const oContext = oTreeTable.getContextByIndex(aSelectedIndices[i]);
                    const oData = oContext.getProperty();
            
                    if (oData) {
                        this._aClipboardData.push(oContext.getProperty());
            
                        // The property is simply set to undefined to preserve the tree state (expand/collapse states of nodes).
                        oModelCatalog.setProperty(oContext.getPath(), undefined, oContext, true);
                    }
                }
            
                if (this._aClipboardData.length > 0) {
                    this.byId("paste").setEnabled(true);
                }
            },
            
            onPaste: function(oEvent) {
                const oTreeTable = this.byId("TreeTable");
                const aSelectedIndices = oTreeTable.getSelectedIndices();
                const oModelCatalog = oTreeTable.getBinding().getModel();
            
                if (aSelectedIndices.length !== 1) {
                    MessageToast.show("Select exactly one row first.");
                    return;
                }
            
                const oNewParentContext = oTreeTable.getContextByIndex(aSelectedIndices[0]);
                const oNewParent = oNewParentContext.getProperty();
            
                // In the JSON data of this example the children of a node are inside an array with the name "categories".
                if (!oNewParent.categories) {
                    oNewParent.categories = []; // Initialize the children array.
                }
            
                // Paste the data to the new parent.
                oNewParent.categories = oNewParent.categories.concat(this._aClipboardData);
            
                this._aClipboardData = [];
                this.byId("paste").setEnabled(false);
                oModelCatalog.refresh();
            },

            onAddSublevel: function(oEvent) {
                // Obtener el índice de la fila donde se hizo clic en el botón de "Agregar subnivel"
                var oItem = oEvent.getSource().getParent();
                var oContext = oItem.getBindingContext("oModelCatalog");
                var sPath = oContext.getPath(); // La ruta del elemento actual
                var oModel = this.getView().getModel("oModelCatalog");
            
                // Crear el nuevo subnivel, aquí estamos agregando un nuevo objeto con los valores predeterminados
                var oNewSublevel = {
                    "name": "Nuevo Subnivel",
                    "type": "String",  // Establecemos un tipo predeterminado
                    "description": "Descripción breve del subnivel",
                    "categories": []  // Si es un subnivel que puede contener otros subniveles, inicializamos un array vacío
                };
            
                // Encontrar el nivel padre correcto en el modelo
                var oParent = oModel.getProperty(sPath);
            
                // Agregar el nuevo subnivel al array 'categories' del nivel correspondiente
                if (!oParent.categories) {
                    oParent.categories = [];  // Si el array 'categories' no existe, lo creamos
                }
            
                // Insertar el nuevo subnivel en el array de categorías del nivel actual
                oParent.categories.push(oNewSublevel);
            
                // Actualizar el modelo con el nuevo subnivel agregado
                oModel.refresh(true);
            }
            ,
            
            onAddMainLevel: function () {
                var oModel = this.getView().getModel("oModelCatalog");
                
                // Obtener los datos actuales de inputs
                var oCatalog = oModel.getProperty("/catalog/inputs");
                
                // Crear un nuevo "input" vacío para el nivel principal
                var oNewInput = {
                    "name": "nuevo_input",  // Nombre del nuevo input
                    "type": "JSON",         // Tipo de dato por defecto
                    "description": "Nuevo input agregado",  // Descripción por defecto
                    "subInputs": []         // Subniveles vacíos
                };
                
                // Agregar el nuevo objeto al array de inputs
                oCatalog.push(oNewInput);
                
                // Actualizar la propiedad en el modelo para que la vista se actualice
                oModel.setProperty("/catalog/inputs", oCatalog);
            },
            
            onDeleteSublevel: function (oEvent) {
                // Obtener la fila que contiene el botón de eliminar
                var oTable = this.byId("TreeTable");
                var oBindingContext = oEvent.getSource().getBindingContext("oModelCatalog");
            
                // Obtener el índice de la fila
                var sPath = oBindingContext.getPath();
                var oModel = this.getView().getModel("oModelCatalog");
            
                // Aquí eliminamos el elemento del subnivel correspondiente
                var oCatalog = oModel.getProperty("/catalog");
            
                // Dividir el path en partes para identificar qué nivel estamos manipulando
                var pathParts = sPath.split('/');
                
                // Identificar si estamos tratando con un subnivel
                if (pathParts.includes("subInputs")) {
                    // Obtener el índice de subInputs y eliminar el subnivel correspondiente
                    var subInputsIndex = parseInt(pathParts[pathParts.length - 1]);
                    var inputIndex = parseInt(pathParts[pathParts.length - 3]); // El índice del nivel principal
            
                    // Eliminar el subnivel del array de subInputs
                    oCatalog.inputs[inputIndex].subInputs.splice(subInputsIndex, 1);
                } else {
                    // Si no es un subnivel, es un nivel principal, eliminar el nivel principal
                    var mainLevelIndex = parseInt(pathParts[3]); // El índice del nivel principal
                    oCatalog.inputs.splice(mainLevelIndex, 1); // Eliminar el nivel principal
                }
            
                // Actualizar el modelo con los cambios
                oModel.setProperty("/catalog", oCatalog);
            },

            onSelectTypeChange: function (oEvent) {
                var selectedType = oEvent.getSource().getSelectedKey(); // Obtener el valor seleccionado del select
            
                // Aquí puedes hacer lo que sea necesario con la información de selectedType
                // Por ejemplo, actualizar la visibilidad del botón de agregar subnivel si el tipo es "JSON".
                var oModel = this.getView().getModel("oModelCatalog");
            
                // Iterar sobre las filas de la tabla (inputs) y actualizar la visibilidad del botón
                var aInputs = oModel.getProperty("/catalog/inputs");
                aInputs.forEach(function (input) {
                    input.isAddSublevelVisible = input.type === "JSON"; // Solo se habilita si el tipo es JSON
                });
            
                // Actualizar el modelo
                oModel.setProperty("/catalog/inputs", aInputs);
            },


            onReadParam: function(){
                var that = this;
            
                // Crear y abrir el BusyDialog si no existe
                if (!this._oBusyDialog) {
                    this._oBusyDialog = new sap.m.BusyDialog({
                        text: "Cargando...",
                    });
                }
                this._oBusyDialog.open();
            
                // Simulación de carga (puedes reemplazar setTimeout con una promesa o llamada a un servicio)
                setTimeout(function () {
                    // Comprobamos si el fragmento ya está creado antes de abrirlo
                    if (!that.oViewReadParam) {
                        that.oViewReadParam = sap.ui.xmlfragment("com.becloud.pdp.gessistemas.view.fragments.onlyreadParam", that);
                        that.getView().addDependent(that.oViewReadParam); // Aseguramos que el fragmento sea dependiente de la vista
                    }
            
                    // Cerrar el BusyDialog
                    that._oBusyDialog.close();
            
                    // Abrimos el fragmento
                    that.oViewReadParam.open(); 
            
                    // Escuchamos el evento de cerrar para limpiar memoria
                    that.oViewReadParam.attachAfterClose(function () {
                        that.oViewReadParam.destroy();
                        that.oViewReadParam = null; // Limpiamos la referencia para evitar fugas de memoria
                    });
            
                }, 1000); // Simula un retardo de 1 segundo (ajusta según necesidad)


            },

            onCloseReadParam: function(){
                this.oViewReadParam.close();

            },



            /*createCatalogModel: function () {
                // Modelo para los Inputs de Entrada (ya existente)
                const oModelInputs = new JSONModel({
                    "inputs": [
                        {
                            "name": "input_cliente",
                            "type": "JSON",
                            "description": "Input para datos del cliente",
                            "subInputs": [
                                {
                                    "name": "nombre",
                                    "type": "String",
                                    "description": "Nombre del cliente"
                                }
                                // Otros subinputs
                            ]
                        }
                        // Otros inputs de entrada...
                    ],
                    "types": [
                        { "key": "String", "value": "String" },
                        { "key": "JSON", "value": "JSON" },
                        { "key": "Date", "value": "Date" },
                        { "key": "Integer", "value": "Integer" }
                    ]
                });
            
                // Modelo para los Outputs (parámetros de salida)
                const oModelOutputs = new JSONModel({
                    "outputs": [
                        {
                            "name": "output_cliente",
                            "type": "JSON",
                            "description": "Output para datos del cliente",
                            "subInputs": [
                                {
                                    "name": "nombre_salida",
                                    "type": "String",
                                    "description": "Nombre del cliente (salida)"
                                }
                                // Otros subinputs
                            ]
                        }
                        // Otros outputs...
                    ]
                });
            
                // Establecer ambos modelos en la vista
                this.getView().setModel(oModelInputs, "oModelInputs");  // Modelo de Inputs de Entrada
                this.getView().setModel(oModelOutputs, "oModelOutputs");  // Modelo de Outputs de Salida
            } */
            
            
            
            


createCatalogModel: function () {
                // Crear el modelo JSON con los datos proporcionados
                const oModelCatalog = new JSONModel({
                    "catalog": {
                        "inputs": [
                            {
                                "name": "input_cliente", // Nombre del input en el primer nivel
                                "type": "JSON", // Tipo de dato: JSON
                                "description": "Input para datos del cliente",
                                "subInputs": [
                                    {
                                        "name": "nombre", // Nombre del segundo nivel
                                        "type": "String", // Tipo de dato: String
                                        "description": "Nombre del cliente",
                                        "subInputs": [
                                            {
                                                "name": "nombre_real", // Nombre real del cliente
                                                "type": "String", // Tipo de dato: String
                                                "description": "Nombre completo"
                                            },
                                            {
                                                "name": "nombre_apodo", // Apodo del cliente
                                                "type": "String", // Tipo de dato: String
                                                "description": "Apodo del cliente"
                                            }
                                        ]
                                    },
                                    {
                                        "name": "direccion", // Dirección del cliente
                                        "type": "String", // Tipo de dato: String
                                        "description": "Dirección del cliente"
                                    }
                                ]
                            },
                            {
                                "name": "input_producto", // Segundo input del primer nivel
                                "type": "JSON", // Tipo de dato: JSON
                                "description": "Input para datos del producto",
                                "subInputs": [
                                    {
                                        "name": "producto_nombre", // Nombre del producto
                                        "type": "String", // Tipo de dato: String
                                        "description": "Nombre del producto"
                                    },
                                    {
                                        "name": "precio", // Precio del producto
                                        "type": "Integer", // Tipo de dato: Integer
                                        "description": "Precio del producto"
                                    },
                                    {
                                        "name": "fecha_lanzamiento", // Fecha de lanzamiento
                                        "type": "Date", // Tipo de dato: Date
                                        "description": "Fecha de lanzamiento del producto"
                                    }
                                ]
                            }
                        ]
                    },
                    "types": [
                        { "key": "String", "value": "String" },
                        { "key": "JSON", "value": "JSON" },
                        { "key": "Date", "value": "Date" },
                        { "key": "Integer", "value": "Integer" },
                        { "key": "Double", "value": "Double" }
                    ]
                });
            
                // Establecer el modelo en la vista con el nombre 'oModelCatalog'
                this.getView().setModel(oModelCatalog, "oModelCatalog");
            },


            createCatalogModelOutput: function () {
                const oModelCatalogOutput = new JSONModel({
                    "catalog": {
                        "outputs": [
                            {
                                "name": "output_cliente", // Nombre del output en el primer nivel
                                "type": "JSON", // Tipo de dato: JSON
                                "description": "Output para datos del cliente",
                                "subOutputs": [
                                    {
                                        "name": "nombre", // Nombre del cliente
                                        "type": "String", // Tipo de dato: String
                                        "description": "Nombre del cliente",
                                        "subOutputs": [
                                            {
                                                "name": "nombre_real", // Nombre real del cliente
                                                "type": "String", // Tipo de dato: String
                                                "description": "Nombre completo"
                                            },
                                            {
                                                "name": "nombre_apodo", // Apodo del cliente
                                                "type": "String", // Tipo de dato: String
                                                "description": "Apodo del cliente"
                                            }
                                        ]
                                    },
                                    {
                                        "name": "direccion", // Dirección del cliente
                                        "type": "String", // Tipo de dato: String
                                        "description": "Dirección del cliente"
                                    }
                                ]
                            },
                            {
                                "name": "output_producto", // Segundo output del primer nivel
                                "type": "JSON", // Tipo de dato: JSON
                                "description": "Output para datos del producto",
                                "subOutputs": [
                                    {
                                        "name": "producto_nombre", // Nombre del producto
                                        "type": "String", // Tipo de dato: String
                                        "description": "Nombre del producto"
                                    },
                                    {
                                        "name": "precio", // Precio del producto
                                        "type": "Integer", // Tipo de dato: Integer
                                        "description": "Precio del producto"
                                    },
                                    {
                                        "name": "fecha_lanzamiento", // Fecha de lanzamiento
                                        "type": "Date", // Tipo de dato: Date
                                        "description": "Fecha de lanzamiento del producto"
                                    }
                                ]
                            }
                        ]
                    },
                    "types": [
                        { "key": "String", "value": "String" },
                        { "key": "JSON", "value": "JSON" },
                        { "key": "Date", "value": "Date" },
                        { "key": "Integer", "value": "Integer" },
                        { "key": "Double", "value": "Double" }
                    ]
                });
            
                // Establecer el modelo en la vista con el nombre 'oModelCatalogOutput'
                this.getView().setModel(oModelCatalogOutput, "oModelCatalogOutput");
            },


            onAddSublevelOutput: function(oEvent) {
                // Obtener el índice de la fila donde se hizo clic en el botón de "Agregar subnivel"
                var oItem = oEvent.getSource().getParent();
                var oContext = oItem.getBindingContext("oModelCatalogOutput");
                var sPath = oContext.getPath(); // La ruta del elemento actual
                var oModel = this.getView().getModel("oModelCatalogOutput");
            
                // Crear el nuevo subnivel
                var oNewSublevel = {
                    "name": "Nuevo Subnivel",
                    "type": "String", 
                    "description": "Descripción breve del subnivel",
                    "subOutputs": []  // Inicializamos el array vacío si es un subnivel
                };
            
                // Encontrar el nivel padre correcto en el modelo
                var oParent = oModel.getProperty(sPath);
            
                // Agregar el nuevo subnivel al array 'subOutputs' del nivel correspondiente
                if (!oParent.subOutputs) {
                    oParent.subOutputs = [];  // Si el array 'subOutputs' no existe, lo creamos
                }
            
                // Insertar el nuevo subnivel
                oParent.subOutputs.push(oNewSublevel);
            
                // Actualizar el modelo con el nuevo subnivel agregado
                oModel.refresh(true);
            },


            onDeleteSublevelOutput: function(oEvent) {
                // Obtener la fila que contiene el botón de eliminar
                var oTable = this.byId("TreeTableOutput");
                var oBindingContext = oEvent.getSource().getBindingContext("oModelCatalogOutput");
            
                // Obtener el índice de la fila
                var sPath = oBindingContext.getPath();
                var oModel = this.getView().getModel("oModelCatalogOutput");
            
                // Aquí eliminamos el subnivel correspondiente
                var oCatalog = oModel.getProperty("/catalog");
            
                var pathParts = sPath.split('/');
                if (pathParts.includes("subOutputs")) {
                    var subOutputsIndex = parseInt(pathParts[pathParts.length - 1]);
                    var outputIndex = parseInt(pathParts[pathParts.length - 3]); // El índice del nivel principal
            
                    // Eliminar el subnivel del array de subOutputs
                    oCatalog.outputs[outputIndex].subOutputs.splice(subOutputsIndex, 1);
                } else {
                    var mainLevelIndex = parseInt(pathParts[3]);
                    oCatalog.outputs.splice(mainLevelIndex, 1); // Eliminar el nivel principal
                }
            
                // Actualizar el modelo con los cambios
                oModel.setProperty("/catalog", oCatalog);
            },
            
            onAddMainLevelOutput: function() {
                var oModel = this.getView().getModel("oModelCatalogOutput");
                
                var oCatalog = oModel.getProperty("/catalog/outputs");
                
                // Crear un nuevo "output" vacío para el nivel principal
                var oNewOutput = {
                    "name": "nuevo_output",
                    "type": "JSON",
                    "description": "Nuevo output agregado",
                    "subOutputs": [] // Subniveles vacíos
                };
                
                // Agregar el nuevo objeto al array de outputs
                oCatalog.push(oNewOutput);
                
                oModel.setProperty("/catalog/outputs", oCatalog);
            },

            onSelectTypeChangeOutput: function(oEvent) {
                var selectedType = oEvent.getSource().getSelectedKey();
                var oModel = this.getView().getModel("oModelCatalogOutput");
            
                var aOutputs = oModel.getProperty("/catalog/outputs");
                aOutputs.forEach(function(output) {
                    output.isAddSublevelVisible = output.type === "JSON"; // Solo se habilita si el tipo es JSON
                });
            
                oModel.setProperty("/catalog/outputs", aOutputs);
            }
            
            
            

            
            
            




        });
    });



            
            


            


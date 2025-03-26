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

        return Controller.extend("com.becloud.pdp.gessistemas.controller.Main", {
            /* onInit: function () {
                this.onBusyDialog("Open");
                this.getOwnerComponent().getModel().metadataLoaded().then(function () {
                    var oModelCompanySystem = new JSONModel([]);
                    this.getView().setModel(oModelCompanySystem, "oModelCompanySystem");

                    var oModelProveedor = new JSONModel([]);
                    this.getView().setModel(oModelProveedor, "oModelProveedor");

                    var oModelCategorias = new JSONModel([]);
                    this.getView().setModel(oModelCategorias, "oModelCategorias");

                    this.getProducts().then(function (responseProducts) {
                        if (responseProducts.state) {
                            this.getProveedores().then(function (responseProveedor) {
                                this.getCategorias().then(function (responseCategoria) {

                                    this.onBusyDialog("Close");

                                    if (responseCategoria.state) {
                                        if (responseCategoria.rsp.length > 100) {
                                            oModelCategorias.setSizeLimit(responseCategoria.rsp.length);
                                        }
                                        oModelCategorias.setData(responseCategoria.rsp);
                                        oModelCategorias.refresh();
                                    } else {
                                        MessageBox.error(responseCategoria.msg, {
                                            title: "Obtención Categorias"
                                        });
                                    }

                                    if (responseProveedor.state) {
                                        if (responseProveedor.rsp.length > 100) {
                                            oModelProveedor.setSizeLimit(responseProveedor.rsp.length);
                                        }
                                        oModelProveedor.setData(responseProveedor.rsp);
                                        oModelProveedor.refresh();
                                    } else {
                                        MessageBox.error(responseProveedor.msg, {
                                            title: "Obtención Proveedores"
                                        });
                                    }

                                    if (responseProducts.rsp.length > 100) {
                                        oModelProveedor.setSizeLimit(responseProducts.rsp.length);
                                    }
                                    oModelCompanySystem.setData(responseProducts.rsp)
                                    oModelCompanySystem.refresh();
                                }.bind(this));
                            }.bind(this));
                        } else {
                            this.onBusyDialog("Close");
                            MessageBox.error(responseProducts.msg, {
                                title: "Obtención Productos"
                            });
                        }
                    }.bind(this));
                }.bind(this));
            }, */
            //USADO
            onInit: function () {
                var OmodelTableUser = new sap.ui.model.json.JSONModel({
                    isSecondTableVisible: false
                });
                this.getView().setModel(OmodelTableUser);

                //AGREGUÉ EL MODELO PARA LAS CREDENCIALES
                //Datos Estaticos
                this.onBusyDialog("Open");
                this.getCredenciales().then(function (responseCredenciales){
                    var oModelCredenciales = new JSONModel(responseCredenciales.rsp);
                    this.getView().setModel(oModelCredenciales, "oModelCredencialesFF");
                    this.onBusyDialog("Close");
                }.bind(this))

                //Datos Estaticos
                this.onBusyDialog("Open");
                this.getCompanySystem().then(function (responseCompanySystem){
                    var oModelCompanySystem = new JSONModel(responseCompanySystem.rsp);
                    this.getView().setModel(oModelCompanySystem, "oModelCompanySystem");
                    this.onBusyDialog("Close");
                }.bind(this))

                this.getCompanySystemRequest().then(function (responseCompanySystemRequest){
                    var oModelCompanySystemRequest = new JSONModel(responseCompanySystemRequest.rsp);
                    this.getView().setModel(oModelCompanySystemRequest, "oModelCompanySystemRequest");
                    this.onBusyDialog("Close");
                }.bind(this))

                this.getUsersData().then(function (responseUsersData){
                    console.log(responseUsersData)
                    var oModelUsersData = new JSONModel(responseUsersData.rsp);
                    console.log(oModelUsersData)
                    this.getView().setModel(oModelUsersData, "oModelUsersData");
                    this.onBusyDialog("Close");
                }.bind(this))

                //Datos Dinamicos
                /* this.onBusyDialog("Open");
                this.getOwnerComponent().getModel().metadataLoaded().then(function () {
                    var oModelCompanySystem = new JSONModel([]);
                    this.getView().setModel(oModelCompanySystem, "oModelCompanySystem");

                    this.getProducts().then(function (responseCompanySystem) {
                        if (responseCompanySystem.state) {
                            this.onBusyDialog("Close");

                            oModelCompanySystem.setData(responseCompanySystem.rsp)
                            oModelCompanySystem.refresh();
                        } else {
                            this.onBusyDialog("Close");
                            MessageBox.error(responseCompanySystem.msg, {
                                title: "Obtención Productos"
                            });
                        }
                    }.bind(this));
                }.bind(this));     */
            },
            
            onResetFilters: function () {
                this.getView().byId("ipSistemaSearch").setValue();
                this.getView().byId("slEstadoSearch").setSelectedKey("0");
                this.getView().byId("slFechaSearch").setDateValue(null);

                var oTable = this.getView().byId("idProductsTable");
                oTable.getBinding("items").filter([], sap.ui.model.FilterType.Application);
            },
            onNewSystem: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteNewSystem");
            },
            onListUserData: function () {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteListUserData");
            },

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
            //USADO
            onCreate: function () {
                this.oViewCreate = sap.ui.xmlfragment("com.becloud.pdp.gessistemas.view.fragments.createCompanySystem", this);
                this.getView().addDependent(this.oViewCreate);

                this.oViewCreate.attachAfterClose(function () {
                    this.oViewCreate.destroy();
                }.bind(this));

                this.getCompanySystem().then(function (responseCompanySystem) {
                    if (responseCompanySystem.state) {
                        this.oViewCreate.open();
                    } else {
                        this.oViewCreate.destroy();
                        //MESSAGE
                    }
                }.bind(this));
            },
            //USADO
            onCloseCreate: function () {
                this.oViewCreate.close();
            },
            //USADO
            onCloseCreateRequest: function () {
                this.oViewCreateRequest.close();
            },
            //USADO
            onSaveCreate: function () {
                if (this.validateCreate()) {
                    var companySystemName = sap.ui.getCore().byId("ipNameCreate").getValue().trim();

                    var status = sap.ui.getCore().byId("slStatusCreate").getSelectedKey().trim();
                    var statusCheck = (status === "Activo")
                    var descripcion = sap.ui.getCore().byId("ipDescriptionCreate").getValue().trim();
                    
                    var json = {
                        id : 3,
                        companySystemName: companySystemName,
                        status: statusCheck,
                        descripcion: descripcion,
                        creationDate: new Date().toISOString(),
                    };

                    var oModelCompanySystem = this.getView().getModel("oModelCompanySystem");
                    var oData = oModelCompanySystem.getData();

                    if (!Array.isArray(oData)) {
                        oData = [];
                    }
            
                    oData.push(json);
            
                    oModelCompanySystem.setData(oData);
            
                    MessageBox.success("Se ha creado el sistema correctamente.");
                    this.onCloseCreate();
                } else {
                    MessageBox.error("Complete todos los campos para continuar.", {
                        title: "Validación"
                    });
                } 
            },
            //USADO
            onSaveCreateRequest: function () {
                if (this.validateCreateRequest()) {
                    var campo = sap.ui.getCore().byId("ipCampoRequest").getValue().trim();
                    var alerta = sap.ui.getCore().byId("slIdAlertaRequest").getSelectedKey();
                    var descripcion = sap.ui.getCore().byId("ipDescripcionCrearRequest").getValue().trim();
                    var plazoConservacion = sap.ui.getCore().byId("dtPlazoConservacionRequest").getDateValue();
                    
                    var json = {
                        id : 3,
                        campo: campo,
                        descripcion: descripcion,
                        plazoConservacion: plazoConservacion,
                        alerta: alerta,
                        creationDate: new Date().toISOString(),
                    };

                    var oModelCompanySystemRequest = this.getView().getModel("oModelCompanySystemRequest");
                    var oData = oModelCompanySystemRequest.getData();

                    if (!Array.isArray(oData)) {
                        oData = [];
                    }
            
                    oData.push(json);
            
                    oModelCompanySystemRequest.setData(oData);
            
                    MessageBox.success("Se ha creado el sistema correctamente.");
                    this.onCloseCreate();
                } else {
                    MessageBox.error("Complete todos los campos para continuar.", {
                        title: "Validación"
                    });
                } 
            },

            onCredenciales: function () {
                this.oViewCreate = sap.ui.xmlfragment("com.becloud.pdp.gessistemas.view.fragments.Credenciales", this);
                this.getView().addDependent(this.oViewCreate);

                this.oViewCreate.attachAfterClose(function () {
                    this.oViewCreate.destroy();
                }.bind(this));

                this.getCredenciales().then(function (responseCredenciales) {
                    if (responseCredenciales.state) {
                        this.oViewCreate.open();
                    } else {
                        this.oViewCreate.destroy();
                        //MESSAGE
                    }
                }.bind(this));
            },


            getCredenciales: function(){

                return new Promise(
                    function resolver(resolve) {
                        resolve({
                            state: true,
                            rsp: [
                                {
                                    "id": "1",
                                    "Tipo_autent": "Autenticación A",
                                    "URI": "uri de prueba",
                                    "Usuario": "Admin",
                                    "Contraseña": "*************",
                                }
                            ]                            
                        })

                    }.bind(this))


            },


            onSaveCredenciales: function(){
                if (this.validateCreate()) {
                    var autenticacion = sap.ui.getCore().byId("ipAutenticacion").getValue().trim();
                    var method = sap.ui.getCore().byId("slMethodCreate").getSelectedKey();
                    var endPoint = sap.ui.getCore().byId("ipEndPointCreate").getValue().trim();
                    var tipoConexion = sap.ui.getCore().byId("ipTypeConnectionCreate").getSelectedKey();
                    var status = sap.ui.getCore().byId("slStatusCreate").getSelectedKey().trim();
                    var statusCheck = (status === "Activo")
                    var descripcion = sap.ui.getCore().byId("ipDescriptionCreate").getValue().trim();
 
                    
                    var json = {
                        id : 3,
                        autenticacion: companySystemName,
                        method: method,
                        endPoint: endPoint,
                        tipoConexion: tipoConexion,
                        status: statusCheck,
                        descripcion: descripcion,
                        token: token,
                        creationDate: new Date().toISOString(),
                    };

                    var oModelCompanySystem = this.getView().getModel("oModelCompanySystem");
                    var oData = oModelCompanySystem.getData();

                    if (!Array.isArray(oData)) {
                        oData = [];
                    }
            
                    oData.push(json);
            
                    oModelCompanySystem.setData(oData);
            
                    MessageBox.success("Se ha creado el sistema correctamente.");
                    this.onCloseCreate();
                } else {
                    MessageBox.error("Complete todos los campos para continuar.", {
                        title: "Validación"
                    });
                } 




            },


            onEdit: function (oEvent) {
                this.oViewEditCompanySystem = sap.ui.xmlfragment("com.becloud.pdp.gessistemas.view.fragments.editCompanySystem", this);
                this.getView().addDependent(this.oViewEditCompanySystem);
            
                this.oViewEditCompanySystem.attachAfterClose(function () {
                    this.oViewEditCompanySystem.destroy();
                }.bind(this));
            
                var companySystemName = oEvent.getSource().getBindingContext("oModelCompanySystem").getObject().companySystemName;
                sap.ui.getCore().byId("dlgEditCompanySystem").setTitle("Editar Sistema: " + companySystemName);
            
                var sPath = oEvent.getSource().getBindingContext("oModelCompanySystem").sPath;
                this.sPath = sPath;
            
                this.oViewEditCompanySystem.bindElement({
                    path: sPath,
                    model: "oModelCompanySystem"
                });
            
                this.oViewEditCompanySystem.open();
            },
            
            onSaveEdit: function () {
                var name = sap.ui.getCore().byId("ipNameEdit").getValue().trim();
                var method = sap.ui.getCore().byId("slMethodEdit").getSelectedKey();
                var endPoint = sap.ui.getCore().byId("ipEndPointEdit").getValue().trim();
                var connectionType = sap.ui.getCore().byId("ipTypeConnectionEdit").getSelectedKey();
                var status = sap.ui.getCore().byId("slStatusEdit").getSelectedKey();
                var token = sap.ui.getCore().byId("ipTokenEdit").getValue().trim();
                var description = sap.ui.getCore().byId("ipDescriptionEdit").getValue().trim();
    
                if (!name || !method || !endPoint || !connectionType || !status || !token) {
                    MessageBox.error("Por favor, complete todos los campos requeridos.");
                    return;
                }
                
                var updatedData = {
                    companySystemName: name,
                    method: method,
                    endPoint: endPoint,
                    connectionType: connectionType,
                    status: status,
                    token: token,
                    description: description
                };
    
                var numerPath = this.sPath.split("/")[1];
                var oModel = this.getView().getModel("oModelCompanySystem").getData()[numerPath];
                oModel.companySystemName= updatedData.companySystemName;
                oModel.method= updatedData.method;
                oModel.endPoint= updatedData.endPoint;
                oModel.ConnectionType= updatedData.ConnectionType;
                oModel.status= updatedData.status;
                oModel.token= updatedData.token;
                oModel.description= updatedData.description;

                this.getView().getModel("oModelCompanySystem").refresh();

                /* oModel.setProperty("/companySystemName", updatedData.companySystemName);
                oModel.setProperty("/method", updatedData.method);
                oModel.setProperty("/endPoint", updatedData.endPoint);
                oModel.setProperty("/ConnectionType", updatedData.ConnectionType);
                oModel.setProperty("/status", updatedData.status);
                oModel.setProperty("/token", updatedData.token);
                oModel.setProperty("/description", updatedData.description); */
    
                MessageBox.success("Los cambios se han guardado correctamente.");
                
                this.oViewEditCompanySystem.close();
            },
    
            onCloseEdit: function () {
                this.oViewEditCompanySystem.close();
            },
            //USADO
            onShowInformation: function (oEvent) {
                this.oViewInfoCompanySystem = sap.ui.xmlfragment("com.becloud.pdp.gessistemas.view.fragments.informacionCompanySystem", this);
                this.getView().addDependent(this.oViewInfoCompanySystem);

                this.oViewInfoCompanySystem.attachAfterClose(function () {
                    this.oViewInfoCompanySystem.destroy();
                }.bind(this));

                var companySystemName = oEvent.getSource().getBindingContext("oModelCompanySystem").getObject().companySystemName;
                sap.ui.getCore().byId("dlgInfoCompanySystem").setTitle(companySystemName);

                var sPath = oEvent.getSource().getBindingContext("oModelCompanySystem").sPath;
                this.oViewInfoCompanySystem.bindElement({
                    path: sPath,
                    model: "oModelCompanySystem"
                });
                this.oViewInfoCompanySystem.open();
            },

            onCloseInfoSystemCompany: function () {
                this.oViewInfoCompanySystem.close();
            },

            formatPhoto: function (photo) {
                if (photo) {
                    return "data:image/png;base64," + photo.substring(104)
                }
                return
            },

            onActive: function (oEvent) {
                var oModelCompanySystem = this.getView().getModel("oModelCompanySystem");
                var path = oEvent.getSource().getBindingContext("oModelCompanySystem").getPath()
                path = path.split("/")[1];
                oModelCompanySystem.getData()[path].status = false;
                oModelCompanySystem.refresh();
                MessageToast.show("Se ha activado el producto seleccionado.")
            },

            onDesc: function (oEvent) {
                var oModelCompanySystem = this.getView().getModel("oModelCompanySystem");
                var path = oEvent.getSource().getBindingContext("oModelCompanySystem").getPath()
                path = path.split("/")[1];
                oModelCompanySystem.getData()[path].status = true;
                oModelCompanySystem.refresh();
                MessageToast.show("Se ha descontinuado el producto seleccionado.")

            },

            changeFilter: function () {
                var NameSystem = this.getView().byId("ipSistemaSearch").getValue().trim();
                var estado = this.getView().byId("slEstadoSearch").getSelectedKey();
                
                var oDateRange = this.getView().byId("slFechaSearch");
                console.log(oDateRange)
                var startDate = oDateRange.getDateValue();
                var endDate = oDateRange.getSecondDateValue();
                debugger
            
                var oTable = this.getView().byId("idProductsTable");
                var filtros = [];
            
                if (NameSystem !== "") {
                    var filtroNombre = new Filter({
                        path: "companySystemName",
                        operator: sap.ui.model.FilterOperator.Contains,
                        value1: NameSystem
                    });
                    filtros.push(filtroNombre);
                }
            
                if (estado !== "0") {
                    var status = estado === "1";
                    var filtroEstado = new Filter({
                        path: "status",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: status
                    });
                    filtros.push(filtroEstado);
                }
            
                if (startDate && endDate) {
                    /* var startDateFormatted = startDate.toISOString().split('T')[0];
                    var endDateFormatted = endDate.toISOString().split('T')[0]; */

                    var startDateFormatted = this.formatterDate(startDate);
                    var endDateFormatted = this.formatterDate(endDate);
            
                    var filtroStart = new Filter({
                        path: "creationDate",
                        operator: sap.ui.model.FilterOperator.BT,
                        value1: startDateFormatted,
                        value2: endDateFormatted, 
                    });
                    filtros.push(filtroStart);
            
                    /* var filtroEnd = new Filter({
                        path: "creationDate",
                        operator: sap.ui.model.FilterOperator.LE,
                        value1: endDateFormatted
                    });
                    filtros.push(filtroEnd); */
                }
            
                oTable.getBinding("items").filter(filtros, sap.ui.model.FilterType.Application);
            },

            onDateRangeChange: function (oEvent) {
                this.changeFilter();
            },
            //USADO
            onExcel: function () {
                this.getCompanySystem().then(function (response) {
                    if (response.state) {
                        if (response.rsp.length > 0) {
                            response.rsp.sort(function (a, b) {
                                if (a.companySystemName < b.companySystemName) {
                                    return -1;
                                }
                                if (a.companySystemName > b.companySystemName) {
                                    return 1;
                                }
                                return 0;
                            });

                            var aCols, oRowBinding, oSettings;
                            oRowBinding = response.rsp;
                            aCols = this.createColumnConfig();
                            oSettings = {
                                workbook: {
                                    columns: aCols,
                                    context: {
                                        sheetName: "Sistemas"
                                    }
                                },
                                dataSource: oRowBinding,
                                fileName: "lista_Sistemas.xlsx"
                            };
                            new Spreadsheet(oSettings).build();
                        } else {
                            MessageBox.information("No se han encontrado registros para descargar.");
                        }
                    } else {
                        MessageBox.error(response.msg, {
                            title: "Obtención de datos"
                        });
                    }
                }.bind(this));
            },
            //USADO
            createColumnConfig: function () {
                var aCols = [];
                
                aCols.push({
                    label: "Sistema",
                    type: EdmType.String,
                    property: "companySystemName",
                    width: 25,
                    wrap: true
                });
                
                aCols.push({
                    label: "Método",
                    type: EdmType.String,
                    property: "method",
                    width: 20,
                    wrap: true
                });
                
                aCols.push({
                    label: "endPoint",
                    type: EdmType.String,
                    property: "endPoint",
                    width: 30,
                    wrap: true
                });
                
                aCols.push({
                    label: "Tipo Conexión",
                    type: EdmType.String,
                    property: "ConnectionType",
                    width: 25,
                    wrap: true
                });
                
                aCols.push({
                    label: "Descripción",
                    type: EdmType.String,
                    property: "Description",
                    width: 30,
                    wrap: true
                });
            
                aCols.push({
                    label: "Token",
                    type: EdmType.String,
                    property: "Token",
                    width: 25,
                    wrap: true
                });
                
                aCols.push({
                    label: "Estado",
                    type: EdmType.Enumeration,
                    property: "status",
                    valueMap: {
                        true: "Inactivo",
                        false: "Activo"
                    },
                    width: 20,
                    wrap: true
                });
            
                return aCols;
            },
            //USADO
            onRefresh: function () {
                this.onBusyDialog("Open");

                var oModelCompanySystem = new JSONModel([]);
                this.getView().setModel(oModelCompanySystem, "oModelCompanySystem");

                this.getCompanySystem().then(function (response) {
                    this.onBusyDialog("Close");
                    if (response.state) {
                        oModelCompanySystem.setData(response.rsp)
                        oModelCompanySystem.refresh();
                    } else {
                        MessageBox.error(response.msg, {
                            title: "Obtención de datos"
                        });
                    }
                }.bind(this));
            },

            updateFinished: function (oEvent) {
                var total = oEvent.getParameter("total")
                this.getView().byId("tProducts").setText("Registros (" + total + ") ");
            },



            //USADO
            getCompanySystem: function () {
                return new Promise(
                    function resolver(resolve) {
                        resolve({
                            state: true,
                            rsp: [
                                {
                                    "id": "1",
                                    "companySystemName": "Tech Solutions Inc.",
                                    "Descripcion": "Descripcion abcd",
                                    "Servicios": "3",
                                    "creationDate": "Fri Jan 17 2025 00:00:00 GMT-0400",
                                    "Creador": "Admin05",
                                    "status": "1",
    
                                },
                                {
                                    "id": "2",
                                    "companySystemName": "Global Finance Corp.",
                                    "method": "POST",
                                    "endPoint": "/api/v1/transactions",
                                    "creationDate": "Fri Jan 16 2025 00:00:00 GMT-0400",
                                    "connectionType": "API",
                                    "status": "1",
                                    "description": "Registro de nuevas transacciones financieras.",
                                    "token": "def456uvw"
                                },
                                {
                                    "id": "3",
                                    "companySystemName": "HealthCare Systems Ltd.",
                                    "method": "PUT",
                                    "endPoint": "/api/v1/patients/12345",
                                    "creationDate": "Thu Jan 15 2025 00:00:00 GMT-0400",
                                    "connectionType": "API",
                                    "status": "2",
                                    "description": "Actualización de datos del paciente.",
                                    "token": "ghi789rst"
                                },
                                {
                                    "id": "4",
                                    "companySystemName": "Retail Innovations LLC",
                                    "method": "DELETE",
                                    "endPoint": "/api/v1/products/98765",
                                    "creationDate": "Wed Jan 14 2025 00:00:00 GMT-0400",
                                    "connectionType": "API",
                                    "status": "1",
                                    "description": "Eliminación de un producto del inventario.",
                                    "token": "jkl012abc"
                                },
                                {
                                    "id": "5",
                                    "companySystemName": "EduTech Solutions",
                                    "method": "GET",
                                    "endPoint": "/api/v1/courses",
                                    "creationDate": null, // Simulando un caso sin fecha
                                    "connectionType": "API",
                                    "status": "1",
                                    "description": "Obtención de la lista de cursos disponibles.",
                                    "token": null
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

            getUsersData: function () {
                return new Promise(
                    function resolver(resolve) {
                        resolve({
                            state: true,
                            rsp: [
                                {
                                    id: "1",
                                    Nombre_api: "Api 1",
                                    lastName: "Péreziyo",
                                    email: "juan.perez@example.com",
                                    rut: "12345678-9",
                                    status: "Activo",
                                    creationDate: "2023-01-01",
                                    phone: "+56 9 1234 5678"
                                },
                                /*
                                {
                                    id: "2",
                                    firstName: "María",
                                    lastName: "González",
                                    email: "maria.gonzalez@example.com",
                                    rut: "98765432-1",
                                    status: "Inactivo",
                                    creationDate: "2023-01-02",
                                    phone: "+56 9 8765 4321"
                                },
                                {
                                    id: "3",
                                    firstName: "Carlos",
                                    lastName: "Sánchez",
                                    email: "carlos.sanchez@example.com",
                                    rut: "11223344-5",
                                    status: "Activo",
                                    creationDate: "2023-01-03",
                                    phone: "+56 9 1122 3344"
                                },
                                {
                                    id: "4",
                                    firstName: "Ana",
                                    lastName: "Martínez",
                                    email: "ana.martinez@example.com",
                                    rut: "55667788-0",
                                    status: "Activo",
                                    creationDate: "2023-01-04",
                                    phone: "+56 9 2233 4455"
                                }*/
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
            //USADO
            validateCreate: function () {
                var fields = [{
                    "id": "ipNameCreate",
                    "required": true,
                    "tipo": "ip",
                    "texto":"Escriba un Nombre."
                },
                {
                    "id": "slStatusCreate",
                    "required": true,
                    "tipo": "sl",
                    "texto":"Seleccione el Estado."
                },{
                    "id": "ipDescriptionCreate",
                    "required": true,
                    "tipo": "ip",
                    "texto":"Escriba una Descripción."
                }];
                return this.validate(fields) === false;
            },
            //USADO
            validate: function(fields) {
                console.log('validar')
                var error = false;
                var value;
                for (var i = 0; i < fields.length; i++) {
                    var input = sap.ui.getCore().byId(fields[i].id);
                    if (fields[i].required) {
                        if (fields[i].tipo === "ip") {
                            value = input.getValue();
                            if (value.length === 0) {
                                input.setValueState("Error");
                                input.setValueStateText(fields[i].texto);
                                error = true;
                            }
                        }
                        else if (fields[i].tipo === "sl") {
                            value = input.getSelectedKey();
                            if (value.length === 0) {
                                input.setValueState("Error");
                                input.setValueStateText(fields[i].texto);
                                error = true;
                            }
                        }
                        else if (fields[i].tipo === "dt") {
                            console.log(input)
                            value = input.getDateValue();
                            if (value === null) {
                                input.setValueState("Error");
                                input.setValueStateText(fields[i].texto);
                                error = true;
                            }
                        }
                        else if (fields[i].tipo === "dtp") {
                            console.log(input)
                            value = input.getDateValue();
                            if (value === null) {
                                input.setValueState("Error");
                                input.setValueStateText(fields[i].texto);
                                error = true;
                            }
                        }
                    }
                }
                return error;
            },
            //USADO
            validateCreateRequest: function () {
                var fields = [{
                    "id": "ipCampoRequest",
                    "required": true,
                    "tipo": "ip",
                    "texto":"Escriba el Nombre del campo."
                },{
                    "id": "slIdAlertaRequest",
                    "required": true,
                    "tipo": "sl",
                    "texto":"Seleccione una alerta."
                },{
                    "id": "ipDescripcionCrearRequest",
                    "required": true,
                    "tipo": "ip",
                    "texto":"Escriba una Descripción."
                },{
                    "id": "dtPlazoConservacionRequest",
                    "required": true,
                    "tipo": "dt",
                    "texto":"Seleccione un plazo."
                }];
                return this.validateRequest(fields) === false;
            },
            //USADO
            validateRequest: function(fields) {
                console.log('validar')
                var error = false;
                var value;
                for (var i = 0; i < fields.length; i++) {
                    var input = sap.ui.getCore().byId(fields[i].id);
                    if (fields[i].required) {
                        if (fields[i].tipo === "ip") {
                            value = input.getValue();
                            if (value.length === 0) {
                                input.setValueState("Error");
                                input.setValueStateText(fields[i].texto);
                                error = true;
                            }
                        }
                        else if (fields[i].tipo === "sl") {
                            value = input.getSelectedKey();
                            if (value.length === 0) {
                                input.setValueState("Error");
                                input.setValueStateText(fields[i].texto);
                                error = true;
                            }
                        }
                        else if (fields[i].tipo === "dt") {
                            console.log(input)
                            value = input.getDateValue();
                            if (value === null) {
                                input.setValueState("Error");
                                input.setValueStateText(fields[i].texto);
                                error = true;
                            }
                        }
                        else if (fields[i].tipo === "dtp") {
                            console.log(input)
                            value = input.getDateValue();
                            if (value === null) {
                                input.setValueState("Error");
                                input.setValueStateText(fields[i].texto);
                                error = true;
                            }
                        }
                    }
                }
                return error;
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
            onOpenUserData: function (oEvent) {
                var oButton = oEvent.getSource();
                var oContext = oButton.getBindingContext("oModelCompanySystem");
                var oData = oContext.getObject();
            
                // Guardar el título en un modelo global
                var oModel = this.getOwnerComponent().getModel("globalModel");
                oModel.setProperty("/pageTitle", "Datos de " + oData.companySystemName);
            
                // Navegar a la vista de usuario
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteUserData");
            }




            

            
    
        
            
        });
    });




  
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
        }

        
    })
 }
);
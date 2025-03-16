"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var XLSX = require("xlsx");
// Carga el archivo de Excel
var archivoExcel = XLSX.readFile('C:\Users\Floqui PC\Downloads\Telegram Desktop\Inventario almacen costos y cantidades (7).xlsx');
// Obtiene la primera hoja del archivo
var hoja = archivoExcel.Sheets[archivoExcel.SheetNames[0]];
// Convierte la hoja en un arreglo de objetos
var datos = XLSX.utils.sheet_to_json(hoja);
// Muestra los datos por pantalla
console.log(datos);

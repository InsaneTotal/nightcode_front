import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const exportExcelReport = async ({ orders, filter }) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Apu's Bar";
  workbook.created = new Date();

  /* =========================
     FILTRO DINÁMICO
  ========================== */
  const filteredOrders =
    filter === "Hoy"
      ? orders.slice(0, 1)
      : filter === "Semana"
        ? orders
        : [...orders, ...orders];

  /* =========================
     LOGO (coloca logo.png en /public)
  ========================== */
  try {
    const response = await fetch("/logo.png");
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();

    const logoId = workbook.addImage({
      buffer,
      extension: "png",
    });

    const sheet = workbook.addWorksheet("Reporte General");

    sheet.addImage(logoId, {
      tl: { col: 0, row: 0 },
      ext: { width: 140, height: 70 },
    });

    sheet.addRow([]);
    sheet.addRow(["Reporte Apu's Bar - " + filter]);
    sheet.mergeCells("A2:E2");

    sheet.getRow(2).font = { size: 18, bold: true };
    sheet.getRow(2).alignment = { horizontal: "center" };

    sheet.addRow([]);

    /* =========================
       HEADER
    ========================== */
    const header = sheet.addRow([
      "Mesa",
      "Mesero",
      "Método",
      "Total",
      "Estado",
    ]);

    header.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF6B21A8" }, // MORADO
      };
      cell.alignment = { horizontal: "center" };
    });

    /* =========================
       DATA
    ========================== */
    filteredOrders.forEach((o) => {
      const row = sheet.addRow([o.mesa, o.mesero, o.metodo, o.total, o.status]);

      row.getCell(4).numFmt = '"$"#,##0';
    });

    /* =========================
       TOTAL AUTOMÁTICO
    ========================== */
    const totalRowIndex = sheet.lastRow.number + 1;

    sheet.addRow([]);
    sheet.addRow([
      "",
      "",
      "TOTAL GENERAL",
      { formula: `SUM(D5:D${sheet.lastRow.number})` },
    ]);

    const totalRow = sheet.getRow(sheet.lastRow.number);

    totalRow.getCell(3).font = { bold: true };
    totalRow.getCell(4).numFmt = '"$"#,##0';
    totalRow.getCell(4).font = { bold: true };

    /* =========================
       ESTILOS GENERALES
    ========================== */
    sheet.columns.forEach((col) => {
      col.width = 20;
    });

    const bufferExcel = await workbook.xlsx.writeBuffer();

    saveAs(new Blob([bufferExcel]), `Reporte-ApusBar-${filter}.xlsx`);
  } catch (error) {
    console.error("Error generando Excel:", error);
  }
};

import ExcelJS from "exceljs";

export async function POST(request) {
  try {
    const { orders, filter } = await request.json();

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

    const sheet = workbook.addWorksheet("Reporte General");

    sheet.addRow(["Reporte Apu's Bar - " + filter]);
    sheet.mergeCells("A1:E1");

    sheet.getRow(1).font = { size: 18, bold: true };
    sheet.getRow(1).alignment = { horizontal: "center" };

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
        fgColor: { argb: "FF6B21A8" },
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

    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Reporte-ApusBar-${filter}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error generando Excel:", error);
    return Response.json(
      { error: "Error al generar el archivo Excel" },
      { status: 500 },
    );
  }
}

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generarPdfVentas = ({
  ventas,
  fechaInicio,
  fechaFin,
  totalGeneral,
  formatMoney,
  calcularTotal,
}) => {
  const doc = new jsPDF();

  const fechaActual = new Date().toLocaleString();
  const rango =
    fechaInicio && fechaFin
      ? `${fechaInicio} - ${fechaFin}`
      : "Todas las fechas";

  /* ================= HEADER ================= */

  doc.setFontSize(18);
  doc.setTextColor(212, 175, 55);
  doc.text("APU'S BAR", 14, 20);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text("Reporte de Ventas", 14, 28);
  doc.text(`Rango: ${rango}`, 14, 34);
  doc.text(`Generado: ${fechaActual}`, 14, 40);

  /* ================= TABLA ================= */

  const rows = ventas.map((venta) => [
    new Date(venta.fecha).toLocaleString(),
    venta.metodo === "Efectivo" ? "Efectivo" : "Transferencia",
    venta.empleado,
    formatMoney(calcularTotal(venta.productos)),
  ]);

  autoTable(doc, {
    startY: 48,
    head: [["Fecha", "Método", "Empleado", "Total"]],
    body: rows,
    theme: "striped",
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [212, 175, 55],
    },
    styles: {
      fontSize: 10,
    },
  });

  /* ================= TOTAL ================= */

  const finalY = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(13);
  doc.setTextColor(0, 128, 0);
  doc.text(`Total General: ${formatMoney(totalGeneral)}`, 14, finalY);

  /* ================= FOOTER ================= */

  const pageCount = doc.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() - 40,
      doc.internal.pageSize.getHeight() - 10,
    );
  }

  doc.save("reporte-ventas.pdf");
};

// components/InvoicePDF.tsx
'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface InvoicePDFData {
  id: number;
  title: string;
  price: string;
  invoice_type: 'incomes' | 'expenses';
  date: string;
  car_id: number;
  brand: string;
  model: string;
  year: string;
  plate: string;
  list_details: {
    item: string;
    quantity: number;
    rate: string;
    amount: string;
  }[];
  list_images: {
    id: number;
    image: string;
  }[];
  partner_refund: boolean;
  comment: string;
}

export async function generateInvoicePDF(invoice: InvoicePDFData): Promise<void> {
  // Crear documento PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = 18;

  // 🔥 CABECERA
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#000000');
  doc.text('INVOICE', margin, yPos);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#717171');
  doc.text(`${invoice.brand} ${invoice.model}`, margin, yPos + 7);

  // 🔥 NÚMERO, TÍTULO Y FECHA (derecha)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#000000');
  doc.text(`#${invoice.id}`, pageWidth - margin - 30, yPos);

  // 🔥 TÍTULO DE LA FACTURA
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#717171');
  // Truncar título si es muy largo
  const titleText = invoice.title.length > 30 ? invoice.title.substring(0, 28) + '...' : invoice.title;
  doc.text(titleText, pageWidth - margin - 30, yPos + 7, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#999999');
  const dateStr = new Date(invoice.date).toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  });
  doc.text(dateStr, pageWidth - margin - 30, yPos + 14, { align: 'right' });

  yPos += 24;

  // 🔥 LÍNEA SEPARADORA
  doc.setDrawColor('#000000');
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // 🔥 INFORMACIÓN DEL AUTO
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#000000');
  doc.text(`${invoice.brand} ${invoice.model}`, margin, yPos);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#717171');
  doc.text(`(${invoice.plate})`, margin + 70, yPos);

  doc.setFontSize(11);
  doc.setTextColor('#717171');
  doc.text(`${invoice.year} • ID: ${invoice.car_id}`, margin, yPos + 6);

  yPos += 16;

  // 🔥 INFORMACIÓN GRID (3 columnas)
  const colWidth = (pageWidth - margin * 2) / 3;

  // Columna 1: Invoice Type
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#717171');
  doc.text('INVOICE TYPE', margin, yPos);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const isIncome = invoice.invoice_type === 'incomes';
  doc.setTextColor(isIncome ? '#16a34a' : '#dc2626');
  doc.text(invoice.invoice_type === 'incomes' ? 'INCOME' : 'EXPENSE', margin, yPos + 6);

  // Columna 2: Partner Refund
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#717171');
  doc.text('PARTNER REFUND', margin + colWidth, yPos);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#000000');
  doc.text(invoice.partner_refund ? 'Yes' : 'No', margin + colWidth, yPos + 6);

  // Columna 3: Total
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#717171');
  doc.text('TOTAL', margin + colWidth * 2, yPos);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isIncome ? '#16a34a' : '#dc2626');
  doc.text(`$${parseFloat(invoice.price).toFixed(2)}`, margin + colWidth * 2, yPos + 6);

  yPos += 18;

  // 🔥 LÍNEA SEPARADORA
  doc.setDrawColor('#ebebeb');
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // 🔥 TABLA DE ITEMS
  const tableHeaders = ['#', 'ITEM', 'QUANTITY', 'RATE', 'AMOUNT'];
  const tableData = invoice.list_details && invoice.list_details.length > 0
    ? invoice.list_details.map((item, index) => [
        (index + 1).toString(),
        item.item,
        item.quantity.toString(),
        `$${parseFloat(item.rate).toFixed(2)}`,
        `$${parseFloat(item.amount).toFixed(2)}`,
      ])
    : [['', 'No items in this invoice', '', '', '']];

  autoTable(doc, {
    startY: yPos,
    head: [tableHeaders],
    body: tableData,
    theme: 'striped',
    styles: {
      fontSize: 10,
      cellPadding: 4,
      textColor: '#333333',
      lineColor: '#e0e0e0',
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: '#f5f5f5',
      textColor: '#717171',
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto', halign: 'left' },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
    },
    margin: { left: margin, right: margin },
    tableWidth: 'auto',
    rowPageBreak: 'auto',
    didParseCell: function(data) {
      if (data.column.index === 1 && data.cell.raw) {
        const text = String(data.cell.raw);
        if (text.length > 30) {
          data.cell.styles.fontSize = 9;
        }
      }
    },
  });

  // 🔥 OBTENER LA POSICIÓN Y DE LA TABLA
  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // 🔥 TOTAL
  yPos = finalY;

  // Línea separadora antes del total
  doc.setDrawColor('#000000');
  doc.setLineWidth(0.5);
  const totalLineX = pageWidth - margin - 70;
  doc.line(totalLineX, yPos, pageWidth - margin, yPos);

  yPos += 6;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#333333');
  doc.text('Total', pageWidth - margin - 70 + 4, yPos);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#000000');
  doc.text(`$${parseFloat(invoice.price).toFixed(2)}`, pageWidth - margin - 4, yPos, { align: 'right' });

  yPos += 14;

  // 🔥 COMENTARIO (si existe)
  if (invoice.comment) {
    doc.setDrawColor('#ebebeb');
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#717171');
    doc.text('COMMENTS', margin, yPos);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#333333');
    
    const commentLines = doc.splitTextToSize(invoice.comment, pageWidth - margin * 2);
    doc.text(commentLines, margin, yPos + 6);
    yPos += 10 + (commentLines.length * 5);
  }

  // 🔥 FOOTER
  const footerY = doc.internal.pageSize.getHeight() - 12;
  doc.setDrawColor('#ebebeb');
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#999999');
  doc.text('Generated from GT Connections', margin, footerY + 2);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#999999');
  doc.text(`Invoice #${invoice.id}`, pageWidth - margin, footerY + 2, { align: 'right' });

  // 🔥 GUARDAR PDF
  doc.save(`Invoice_${invoice.id}_${invoice.brand}.pdf`);
}
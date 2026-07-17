// app/admin/properties/profit-and-loss/[id]/generatePDF.ts

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProfitAndLossDetail } from '@/app/lib/api/propertiesAdmin';

export const generateProfitAndLossPDF = (data: ProfitAndLossDetail) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colores
  const colors = {
    primary: '#000000',
    secondary: '#717171',
    income: '#16a34a',
    expense: '#dc2626',
    border: '#ebebeb',
    background: '#fafafa',
  };

  // ==================== HEADER ====================
  doc.setFillColor(colors.primary);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  doc.setTextColor('#ffffff');
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Profit and Loss Report', pageWidth / 2, 18, { align: 'center' });

  // ==================== TÍTULO ====================
  doc.setTextColor(colors.primary);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(data.listing.name, pageWidth / 2, 45, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.secondary);
  doc.text(`Date: ${new Date(data.date).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })} • ID: #${data.id}`, pageWidth / 2, 53, { align: 'center' });

  // Línea separadora
  doc.setDrawColor(colors.border);
  doc.line(20, 58, pageWidth - 20, 58);

  // ==================== RESUMEN ====================
  let yPos = 68;

  // Incomes
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.primary);
  doc.text('Incomes', 30, yPos);
  yPos += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor('#444444');
  
  const incomeItems = [
    { label: 'Rent:', value: `$${parseFloat(data.rent).toFixed(2)}` },
    { label: 'Additional Income:', value: `$${parseFloat(data.additional_income).toFixed(2)}` },
  ];
  
  incomeItems.forEach(item => {
    doc.text(item.label, 35, yPos);
    doc.text(item.value, 150, yPos, { align: 'right' });
    yPos += 5;
  });

  doc.setDrawColor(colors.border);
  doc.line(30, yPos - 1, 190, yPos - 1);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.income);
  doc.text('Total Incomes:', 35, yPos + 4);
  doc.text(`$${parseFloat(data.total_income).toFixed(2)}`, 150, yPos + 4, { align: 'right' });
  yPos += 12;

  // Expenses
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(colors.primary);
  doc.text('Expenses', 30, yPos);
  yPos += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor('#444444');
  
  const expenseItems = [
    { label: 'Rent:', value: `$${parseFloat(data.rent).toFixed(2)}` },
    { label: 'Invoices:', value: `$${parseFloat(data.invoices).toFixed(2)}` },
  ];
  
  expenseItems.forEach(item => {
    doc.text(item.label, 35, yPos);
    doc.text(item.value, 150, yPos, { align: 'right' });
    yPos += 5;
  });

  doc.setDrawColor(colors.border);
  doc.line(30, yPos - 1, 190, yPos - 1);
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colors.expense);
  doc.text('Total Expenses:', 35, yPos + 4);
  doc.text(`$${parseFloat(data.total_expenses).toFixed(2)}`, 150, yPos + 4, { align: 'right' });
  yPos += 12;

  // Stats
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(colors.primary);
  doc.text('Stats', 30, yPos);
  yPos += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const statsItems = [
    { label: 'Income - Expenses:', value: `$${parseFloat(data.income_minus_expenses).toFixed(2)}`, color: parseFloat(data.income_minus_expenses) >= 0 ? colors.income : colors.expense },
    { label: 'Partner Net:', value: `$${parseFloat(data.partner_net).toFixed(2)}`, color: parseFloat(data.partner_net) >= 0 ? colors.income : colors.expense },
    { label: 'Deposit:', value: `$${parseFloat(data.deposit).toFixed(2)}`, color: parseFloat(data.deposit) >= 0 ? colors.income : colors.expense },
  ];
  
  statsItems.forEach(item => {
    doc.setTextColor('#444444');
    doc.text(item.label, 35, yPos);
    doc.setTextColor(item.color);
    doc.text(item.value, 150, yPos, { align: 'right' });
    yPos += 5;
  });

  yPos += 8;

  // Línea separadora
  doc.setDrawColor(colors.border);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 6;

  // ==================== INVOICES ====================
  if (data.list_invoices && data.list_invoices.length > 0) {
    // Verificar si necesitamos una nueva página
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(colors.primary);
    doc.text('Invoices', 20, yPos);
    yPos += 6;

    const invoiceRows = data.list_invoices.map(invoice => [
      invoice.id.toString(),
      new Date(invoice.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      invoice.title.length > 25 ? invoice.title.substring(0, 22) + '...' : invoice.title,
      invoice.invoice_type,
      `$${parseFloat(invoice.price).toFixed(2)}`,
      invoice.partner_refund ? 'Yes' : 'False'
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['ID', 'Date', 'Title', 'Type', 'Price', 'Refund']],
      body: invoiceRows,
      theme: 'striped',
      headStyles: {
        fillColor: '#000000',
        textColor: '#ffffff',
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: '#333333',
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 30 },
        2: { cellWidth: 50 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30 },
        5: { cellWidth: 25 },
      },
      styles: {
        overflow: 'linebreak',
        cellPadding: 2,
      },
      didParseCell: function(data) {
        // 🔥 Type column - color según tipo
        if (data.section === 'body' && data.column.index === 3) {
          const rawValue = String(data.cell.raw).toLowerCase();
          if (rawValue === 'expenses') {
            data.cell.styles.textColor = '#dc2626';
            data.cell.styles.fontStyle = 'bold';
          } else if (rawValue === 'incomes') {
            data.cell.styles.textColor = '#16a34a';
            data.cell.styles.fontStyle = 'bold';
          }
        }
        
        // 🔥 Price column - color según valor
        if (data.section === 'body' && data.column.index === 4) {
          const rawValue = String(data.cell.raw);
          // Verificar si es un número negativo (contiene -)
          if (rawValue.includes('-')) {
            data.cell.styles.textColor = '#dc2626';
          } else {
            data.cell.styles.textColor = '#16a34a';
          }
        }
        
        // 🔥 Refund column
        if (data.section === 'body' && data.column.index === 5) {
          const rawValue = String(data.cell.raw);
          if (rawValue === 'Yes') {
            data.cell.styles.textColor = '#16a34a';
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = '#717171';
          }
        }
      },
    });

    // Obtener la última posición Y después de la tabla
    const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || yPos + 20;
    yPos = finalY + 8;
  }

  // ==================== RESERVATIONS ====================
  if (data.list_reservations && data.list_reservations.length > 0) {
    // Verificar si necesitamos una nueva página
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(colors.primary);
    doc.text('Reservations', 20, yPos);
    yPos += 6;

    const reservationRows = data.list_reservations.map(res => [
      res.confirmation_code || res.id.toString(),
      res.guest_name || 'N/A',
      new Date(res.start_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      new Date(res.end_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
      res.nights?.toString() || '0',
      `$${parseFloat(res.earnings || '0').toFixed(2)}`,
      res.status || 'N/A'
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Code', 'Guest', 'Check In', 'Check Out', 'Nights', 'Earnings', 'Status']],
      body: reservationRows,
      theme: 'striped',
      headStyles: {
        fillColor: '#000000',
        textColor: '#ffffff',
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: '#333333',
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 15 },
        5: { cellWidth: 30 },
        6: { cellWidth: 25 },
      },
      styles: {
        overflow: 'linebreak',
        cellPadding: 2,
      },
      didParseCell: function(data) {
        // 🔥 Earnings column - color verde
        if (data.section === 'body' && data.column.index === 5) {
          data.cell.styles.textColor = '#16a34a';
          data.cell.styles.fontStyle = 'bold';
        }
        
        // 🔥 Status column - color según estado
        if (data.section === 'body' && data.column.index === 6) {
          const rawValue = String(data.cell.raw).toLowerCase();
          if (rawValue === 'confirmed') {
            data.cell.styles.textColor = '#16a34a';
          } else if (rawValue === 'cancelled') {
            data.cell.styles.textColor = '#dc2626';
          } else if (rawValue === 'pending') {
            data.cell.styles.textColor = '#f59e0b';
          } else {
            data.cell.styles.textColor = '#717171';
          }
        }
      },
    });
  }

  // ==================== FOOTER ====================
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor('#999999');
    doc.text(
      `Generated on ${new Date().toLocaleString()} • Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // ==================== GUARDAR PDF ====================
  const fileName = `ProfitAndLoss_${data.listing.name}_${data.id}.pdf`;
  doc.save(fileName);
};
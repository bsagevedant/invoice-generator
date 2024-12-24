import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { Invoice } from '../types/invoice';

export const generatePDF = (invoice: Invoice) => {
  const doc = new jsPDF();

  // Add header
  doc.setFontSize(20);
  doc.text('INVOICE', 14, 20);
  
  doc.setFontSize(10);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 14, 30);
  doc.text(`Date: ${format(invoice.date, 'MM/dd/yyyy')}`, 14, 35);
  doc.text(`Due Date: ${format(invoice.dueDate, 'MM/dd/yyyy')}`, 14, 40);

  // From section
  doc.setFontSize(12);
  doc.text('From:', 14, 55);
  doc.setFontSize(10);
  doc.text(invoice.from.name, 14, 62);
  doc.text(invoice.from.address, 14, 67);
  doc.text(invoice.from.email, 14, 72);

  // To section
  doc.setFontSize(12);
  doc.text('Bill To:', 14, 87);
  doc.setFontSize(10);
  doc.text(invoice.to.name, 14, 94);
  doc.text(invoice.to.address, 14, 99);
  doc.text(invoice.to.email, 14, 104);

  // Items table
  autoTable(doc, {
    startY: 120,
    head: [['Description', 'Quantity', 'Rate', 'Amount']],
    body: invoice.items.map(item => [
      item.description,
      item.quantity.toString(),
      `$${item.rate.toFixed(2)}`,
      `$${item.amount.toFixed(2)}`
    ]),
    foot: [
      ['', '', 'Subtotal:', `$${invoice.subtotal.toFixed(2)}`],
      ['', '', 'Tax (10%):', `$${invoice.tax.toFixed(2)}`],
      ['', '', 'Total:', `$${invoice.total.toFixed(2)}`]
    ],
  });

  // Notes
  if (invoice.notes) {
    const finalY = (doc as any).lastAutoTable.finalY || 120;
    doc.text('Notes:', 14, finalY + 20);
    doc.setFontSize(10);
    doc.text(invoice.notes, 14, finalY + 27);
  }

  // Save the PDF
  doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
};
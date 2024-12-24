import React, { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, Download } from 'lucide-react';
import { Invoice, LineItem } from '../types/invoice';
import { generatePDF } from '../utils/pdfGenerator';

const initialInvoice: Invoice = {
  id: crypto.randomUUID(),
  invoiceNumber: `INV-${Date.now()}`,
  date: new Date(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  from: {
    name: '',
    address: '',
    email: '',
  },
  to: {
    name: '',
    address: '',
    email: '',
  },
  items: [],
  notes: '',
  subtotal: 0,
  tax: 0,
  total: 0,
};

export default function InvoiceForm() {
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);

  const addLineItem = () => {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    setInvoice({
      ...invoice,
      items: [...invoice.items, newItem],
    });
  };

  const removeLineItem = (id: string) => {
    setInvoice({
      ...invoice,
      items: invoice.items.filter(item => item.id !== id),
    });
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setInvoice({
      ...invoice,
      items: invoice.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = Number(updatedItem.quantity) * Number(updatedItem.rate);
          }
          return updatedItem;
        }
        return item;
      }),
    });
  };

  const calculateTotals = () => {
    const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;
    setInvoice({ ...invoice, subtotal, tax, total });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateTotals();
    generatePDF(invoice);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Invoice Generator</h1>
        <button
          type="submit"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Download size={20} />
          Generate PDF
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">From</h2>
          <input
            type="text"
            placeholder="Your Name"
            className="w-full p-2 border rounded"
            value={invoice.from.name}
            onChange={e => setInvoice({
              ...invoice,
              from: { ...invoice.from, name: e.target.value }
            })}
          />
          <input
            type="text"
            placeholder="Your Address"
            className="w-full p-2 border rounded"
            value={invoice.from.address}
            onChange={e => setInvoice({
              ...invoice,
              from: { ...invoice.from, address: e.target.value }
            })}
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full p-2 border rounded"
            value={invoice.from.email}
            onChange={e => setInvoice({
              ...invoice,
              from: { ...invoice.from, email: e.target.value }
            })}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">To</h2>
          <input
            type="text"
            placeholder="Client Name"
            className="w-full p-2 border rounded"
            value={invoice.to.name}
            onChange={e => setInvoice({
              ...invoice,
              to: { ...invoice.to, name: e.target.value }
            })}
          />
          <input
            type="text"
            placeholder="Client Address"
            className="w-full p-2 border rounded"
            value={invoice.to.address}
            onChange={e => setInvoice({
              ...invoice,
              to: { ...invoice.to, address: e.target.value }
            })}
          />
          <input
            type="email"
            placeholder="Client Email"
            className="w-full p-2 border rounded"
            value={invoice.to.email}
            onChange={e => setInvoice({
              ...invoice,
              to: { ...invoice.to, email: e.target.value }
            })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-700">Line Items</h2>
          <button
            type="button"
            onClick={addLineItem}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Plus size={20} />
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {invoice.items.map(item => (
            <div key={item.id} className="flex gap-4 items-center">
              <input
                type="text"
                placeholder="Description"
                className="flex-1 p-2 border rounded"
                value={item.description}
                onChange={e => updateLineItem(item.id, 'description', e.target.value)}
              />
              <input
                type="number"
                placeholder="Quantity"
                className="w-24 p-2 border rounded"
                value={item.quantity}
                onChange={e => updateLineItem(item.id, 'quantity', Number(e.target.value))}
              />
              <input
                type="number"
                placeholder="Rate"
                className="w-32 p-2 border rounded"
                value={item.rate}
                onChange={e => updateLineItem(item.id, 'rate', Number(e.target.value))}
              />
              <div className="w-32 p-2 bg-gray-100 rounded">
                ${item.amount.toFixed(2)}
              </div>
              <button
                type="button"
                onClick={() => removeLineItem(item.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <textarea
          placeholder="Notes"
          className="w-full p-2 border rounded"
          value={invoice.notes}
          onChange={e => setInvoice({ ...invoice, notes: e.target.value })}
        />
      </div>

      <div className="flex justify-end space-y-2">
        <div className="w-64 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (10%):</span>
            <span>${invoice.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>${invoice.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </form>
  );
}
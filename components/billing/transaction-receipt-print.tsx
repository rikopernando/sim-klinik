/**
 * Transaction Receipt Print Component
 * Printable receipt for transaction history detail page
 */

import { formatCurrency, formatDateTime, getPaymentMethodLabel } from "@/lib/billing/billing-utils"
import type { TransactionHistoryItem } from "@/types/transaction"

interface TransactionReceiptPrintProps {
  transaction: TransactionHistoryItem
}

const VISIT_TYPE_LABELS: Record<string, string> = {
  outpatient: "Rawat Jalan",
  inpatient: "Rawat Inap",
  emergency: "UGD",
}

const ITEM_TYPE_LABELS: Record<string, string> = {
  service: "Layanan",
  drug: "Obat",
  material: "Material",
  room: "Kamar",
  laboratory: "Laboratorium",
  radiology: "Radiologi",
}

export function TransactionReceiptPrint({ transaction }: TransactionReceiptPrintProps) {
  const { payment, billing, patient, visit } = transaction
  const hasBillingItems = billing.items && billing.items.length > 0

  return (
    <div className="hidden print:block">
      <div className="mx-auto max-w-[210mm] bg-white p-8 text-black">
        {/* Header */}
        <div className="mb-6 border-b-2 border-black pb-4 text-center">
          <h1 className="text-2xl font-bold">KLINIK BUMI ANDALAS</h1>
          <p className="text-sm">Jl. Kesehatan No. 123, Jakarta</p>
          <p className="text-sm">Telp: (021) 1234-5678</p>
          <p className="mt-2 text-sm font-semibold">BUKTI PEMBAYARAN</p>
          <p className="text-xs">ID: {payment.id.slice(0, 8).toUpperCase()}</p>
        </div>

        {/* Patient & Visit Info */}
        <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p>
              <strong>Nama Pasien:</strong> {patient.name}
            </p>
            <p>
              <strong>No. RM:</strong> {patient.mrNumber}
            </p>
          </div>
          <div className="text-right">
            <p>
              <strong>No. Kunjungan:</strong> {visit.visitNumber}
            </p>
            <p>
              <strong>Tipe:</strong> {VISIT_TYPE_LABELS[visit.visitType] || visit.visitType}
            </p>
            <p>
              <strong>Tanggal:</strong> {formatDateTime(payment.receivedAt)}
            </p>
          </div>
        </div>

        {/* Billing Items */}
        {hasBillingItems && (
          <table className="mb-6 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="py-2 text-left">Item</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Harga Satuan</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {billing.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-300">
                  <td className="py-2">
                    <p className="font-medium">{item.itemName}</p>
                    <p className="text-xs text-gray-600">
                      {ITEM_TYPE_LABELS[item.itemType] || item.itemType}
                      {item.itemCode && ` • ${item.itemCode}`}
                    </p>
                  </td>
                  <td className="py-2 text-center">{item.quantity}</td>
                  <td className="py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-2 text-right">{formatCurrency(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Summary */}
        <div className="mb-6 flex justify-end">
          <div className="w-1/2 text-sm">
            <div className="flex justify-between border-t-2 border-black py-2 text-base font-bold">
              <span>Total Tagihan:</span>
              <span>{formatCurrency(billing.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="mb-6">
          <h3 className="mb-2 border-b border-gray-400 pb-1 text-sm font-bold">
            Rincian Pembayaran:
          </h3>
          <div className="pl-2 text-sm">
            <div className="flex justify-between">
              <span>Metode Pembayaran:</span>
              <span className="font-semibold">{getPaymentMethodLabel(payment.paymentMethod)}</span>
            </div>
            <div className="flex justify-between">
              <span>Jumlah Dibayar:</span>
              <span className="font-semibold">{formatCurrency(payment.amount)}</span>
            </div>
            {payment.paymentMethod === "cash" && payment.amountReceived && (
              <>
                <div className="flex justify-between text-gray-600">
                  <span>Uang Diterima:</span>
                  <span>{formatCurrency(payment.amountReceived)}</span>
                </div>
                {!!payment.changeGiven && (
                  <div className="flex justify-between text-gray-600">
                    <span>Kembalian:</span>
                    <span>{formatCurrency(payment.changeGiven)}</span>
                  </div>
                )}
              </>
            )}
            {payment.paymentReference && (
              <div className="mt-1 text-xs text-gray-600">Ref: {payment.paymentReference}</div>
            )}
          </div>
          <div className="mt-2 flex justify-between border-t border-gray-400 py-2 text-sm font-bold">
            <span>Status:</span>
            <span
              className={billing.paymentStatus === "paid" ? "text-green-600" : "text-orange-600"}
            >
              {billing.paymentStatus === "paid"
                ? "LUNAS"
                : billing.paymentStatus === "partial"
                  ? "SEBAGIAN"
                  : "BELUM LUNAS"}
            </span>
          </div>
        </div>

        {/* Notes */}
        {payment.notes && (
          <div className="mb-6 text-sm">
            <h3 className="mb-1 font-bold">Catatan:</h3>
            <p className="text-gray-600">{payment.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 border-t border-gray-400 pt-4 text-center text-xs">
          <p>Terima kasih atas kepercayaan Anda</p>
          <p>Simpan bukti ini sebagai bukti pembayaran yang sah</p>
          <p className="mt-2 text-gray-600">
            Dicetak pada: {formatDateTime(new Date().toString())}
          </p>
        </div>
      </div>
    </div>
  )
}

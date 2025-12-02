/**
 * Receipt Print Component
 * Printable receipt/invoice for completed billing transactions
 */

import { formatCurrency, formatDateTime, generateReceiptNumber, getPaymentMethodLabel } from "@/lib/billing/billing-utils";
import type { PaymentStatus } from "@/types/billing";

interface BillingItem {
    itemName: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
    description?: string;
}

interface Payment {
    id: number;
    amount: string;
    paymentMethod: string;
    paymentReference: string | null;
    changeGiven: string | null;
    receivedAt: Date | string;
}

interface Billing {
    id: number;
    subtotal: string;
    discount: string;
    discountPercentage: string | null;
    insuranceCoverage: string;
    totalAmount: string;
    paidAmount: string;
    remainingAmount: string;
    patientPayable: string;
    paymentStatus: PaymentStatus;
    paymentMethod: string | null;
}

interface Patient {
    name: string;
    mrNumber: string;
}

interface Visit {
    visitNumber: string;
    createdAt: Date | string;
}

interface ReceiptData {
    billing: Billing;
    items: BillingItem[];
    payments: Payment[];
    patient: Patient;
    visit: Visit;
}

interface ReceiptPrintProps {
    data: ReceiptData;
}

export function ReceiptPrint({ data }: ReceiptPrintProps) {
    const { billing, items, payments, patient, visit } = data;
    const receiptNumber = generateReceiptNumber(billing.id);

    return (
        <div className="hidden print:block">
            <div className="max-w-[210mm] mx-auto p-8 bg-white text-black">
                {/* Header */}
                <div className="text-center mb-6 border-b-2 border-black pb-4">
                    <h1 className="text-2xl font-bold">KLINIK SEHAT</h1>
                    <p className="text-sm">Jl. Kesehatan No. 123, Jakarta</p>
                    <p className="text-sm">Telp: (021) 1234-5678</p>
                    <p className="text-sm mt-2 font-semibold">KUITANSI PEMBAYARAN</p>
                    <p className="text-xs">No: {receiptNumber}</p>
                </div>

                {/* Patient & Visit Info */}
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div>
                        <p><strong>Nama Pasien:</strong> {patient.name}</p>
                        <p><strong>No. RM:</strong> {patient.mrNumber}</p>
                    </div>
                    <div className="text-right">
                        <p><strong>No. Kunjungan:</strong> {visit.visitNumber}</p>
                        <p><strong>Tanggal:</strong> {formatDateTime(visit.createdAt.toString())}</p>
                    </div>
                </div>

                {/* Billing Items */}
                <table className="w-full mb-6 text-sm border-collapse">
                    <thead>
                        <tr className="border-b-2 border-black">
                            <th className="text-left py-2">Item</th>
                            <th className="text-center py-2">Qty</th>
                            <th className="text-right py-2">Harga Satuan</th>
                            <th className="text-right py-2">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index} className="border-b border-gray-300">
                                <td className="py-2">
                                    <p className="font-medium">{item.itemName}</p>
                                    {item.description && (
                                        <p className="text-xs text-gray-600">{item.description}</p>
                                    )}
                                </td>
                                <td className="text-center py-2">{item.quantity}</td>
                                <td className="text-right py-2">{formatCurrency(item.unitPrice)}</td>
                                <td className="text-right py-2">{formatCurrency(item.totalPrice)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Summary */}
                <div className="flex justify-end mb-6">
                    <div className="w-1/2 text-sm">
                        <div className="flex justify-between py-1">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(billing.subtotal)}</span>
                        </div>
                        {parseFloat(billing.discount) > 0 && (
                            <div className="flex justify-between py-1 text-red-600">
                                <span>
                                    Diskon
                                    {billing.discountPercentage && ` (${billing.discountPercentage}%)`}:
                                </span>
                                <span>-{formatCurrency(billing.discount)}</span>
                            </div>
                        )}
                        {parseFloat(billing.insuranceCoverage) > 0 && (
                            <div className="flex justify-between py-1 text-blue-600">
                                <span>Jaminan/Asuransi:</span>
                                <span>-{formatCurrency(billing.insuranceCoverage)}</span>
                            </div>
                        )}
                        <div className="flex justify-between py-2 border-t-2 border-black font-bold text-base">
                            <span>Total Tagihan:</span>
                            <span>{formatCurrency(billing.patientPayable)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Details */}
                <div className="mb-6">
                    <h3 className="font-bold text-sm mb-2 border-b border-gray-400 pb-1">Rincian Pembayaran:</h3>
                    {payments.map((payment, index) => {
                        const changeGiven = payment.changeGiven ? parseFloat(payment.changeGiven) : 0;
                        return (
                            <div key={payment.id} className="text-sm mb-2 pl-2">
                                <div className="flex justify-between">
                                    <span>Pembayaran {payments.length > 1 ? `#${index + 1}` : ""} - {getPaymentMethodLabel(payment.paymentMethod)}:</span>
                                    <span className="font-semibold">{formatCurrency(payment.amount)}</span>
                                </div>
                                {changeGiven > 0 && (
                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span>Kembalian:</span>
                                        <span>{formatCurrency(changeGiven)}</span>
                                    </div>
                                )}
                                {payment.paymentReference && (
                                    <div className="text-xs text-gray-600">
                                        Ref: {payment.paymentReference}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div className="flex justify-between py-2 border-t border-gray-400 font-bold text-sm mt-2">
                        <span>Status:</span>
                        <span className="text-green-600">LUNAS</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-xs text-center border-t border-gray-400 pt-4">
                    <p>Terima kasih atas kepercayaan Anda</p>
                    <p>Simpan kuitansi ini sebagai bukti pembayaran yang sah</p>
                    <p className="mt-2 text-gray-600">Dicetak pada: {formatDateTime(new Date().toString())}</p>
                </div>
            </div>
        </div>
    );
}

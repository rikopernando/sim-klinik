/**
 * Billing Items List Component
 * Display billing items with tabs by type
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, groupItemsByType, calculateTotalByType } from "@/lib/billing/billing-utils";
import type { BillingItem } from "@/types/billing";

interface BillingItemsListProps {
    items: BillingItem[];
}

function BillingItemCard({ item }: { item: BillingItem }) {
    return (
        <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <div>
                <p className="font-medium">{item.itemName}</p>
                <p className="text-sm text-muted-foreground">
                    {item.quantity} x {formatCurrency(item.unitPrice)}
                    {item.description && ` - ${item.description}`}
                </p>
            </div>
            <p className="font-semibold">{formatCurrency(item.totalPrice)}</p>
        </div>
    );
}

function ItemTypeTab({
    items,
    type,
    label,
}: {
    items: BillingItem[];
    type: string;
    label: string;
}) {
    const total = useMemo(() => calculateTotalByType(items, type), [items, type]);

    return (
        <div className="space-y-2">
            {items.map((item) => (
                <BillingItemCard key={item.id} item={item} />
            ))}
            <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                    <span>Subtotal {label}</span>
                    <span>{formatCurrency(total)}</span>
                </div>
            </div>
        </div>
    );
}

export function BillingItemsList({ items }: BillingItemsListProps) {
    const groupedItems = useMemo(() => groupItemsByType(items), [items]);

    const tabs = [
        { key: "all", label: "Semua", count: items.length },
        {
            key: "services",
            label: "Layanan",
            count: groupedItems.services.length,
            items: groupedItems.services,
        },
        {
            key: "drugs",
            label: "Obat",
            count: groupedItems.drugs.length,
            items: groupedItems.drugs,
        },
        {
            key: "materials",
            label: "Material",
            count: groupedItems.materials.length,
            items: groupedItems.materials,
        },
        {
            key: "rooms",
            label: "Kamar",
            count: groupedItems.rooms.length,
            items: groupedItems.rooms,
        },
    ].filter((tab) => tab.key === "all" || tab.count > 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Rincian Tagihan</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="all">
                    <TabsList className="mb-4">
                        {tabs.map((tab) => (
                            <TabsTrigger key={tab.key} value={tab.key}>
                                {tab.label} ({tab.count})
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <TabsContent value="all" className="space-y-2">
                        {items.map((item) => (
                            <BillingItemCard key={item.id} item={item} />
                        ))}
                    </TabsContent>

                    {tabs.slice(1).map((tab) => (
                        <TabsContent key={tab.key} value={tab.key} className="space-y-2">
                            <ItemTypeTab
                                items={items}
                                type={tab.key.slice(0, -1)}
                                label={tab.label}
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    );
}

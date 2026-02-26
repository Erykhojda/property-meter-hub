import { useAppStore, useManagerScope } from "@/data/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Mail, Phone, Building2, CalendarDays } from "lucide-react";

export default function MojProfilPage() {
    const { state } = useAppStore();
    const { myBudynki } = useManagerScope();
    const { user, zarzadcy, zarzadcaPrzypisania } = state;

    const zarzadca = zarzadcy.find((z) => z.id === user?.zarzadca_id);

    // Active assignments
    const activeAssignments = zarzadcaPrzypisania.filter(
        (p) => p.zarzadca_id === user?.zarzadca_id && !p.data_do
    );
    // Historical
    const historicalAssignments = zarzadcaPrzypisania.filter(
        (p) => p.zarzadca_id === user?.zarzadca_id && !!p.data_do
    );

    if (!zarzadca) {
        return (
            <div className="flex items-center justify-center py-32 text-muted-foreground">
                Nie znaleziono profilu zarządcy.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Mój profil</h1>
                <p className="text-muted-foreground">Dane konta i przypisane budynki</p>
            </div>

            {/* Profile card */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <UserCircle className="h-8 w-8" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{zarzadca.full_name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{zarzadca.firma}</p>
                            <Badge
                                variant="outline"
                                className={zarzadca.status === "active"
                                    ? "mt-1 bg-success/10 text-success border-success/20"
                                    : "mt-1 bg-muted text-muted-foreground"}
                            >
                                {zarzadca.status === "active" ? "Aktywny" : "Nieaktywny"}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{zarzadca.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{zarzadca.telefon}</span>
                    </div>
                    {zarzadca.nip_firmy && (
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-xs font-mono text-muted-foreground w-4">NIP</span>
                            <span>{zarzadca.nip_firmy}</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Active buildings */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Przypisane budynki</CardTitle>
                        <Badge variant="secondary">{myBudynki.length}</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {myBudynki.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                            Brak aktywnych przypisań budynków
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {activeAssignments.map((a) => {
                                const b = myBudynki.find((x) => x.id === a.budynek_id);
                                if (!b) return null;
                                return (
                                    <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="flex items-center gap-3">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">{b.nazwa}</p>
                                                <p className="text-xs text-muted-foreground">{b.adres}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <CalendarDays className="h-3 w-3" />
                                            od {a.data_od}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Historical */}
            {historicalAssignments.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base text-muted-foreground">Historia przypisań</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {historicalAssignments.map((a) => {
                                const b = state.budynki.find((x) => x.id === a.budynek_id);
                                return (
                                    <div key={a.id} className="flex items-center justify-between rounded-lg border border-dashed p-3 opacity-60">
                                        <div className="flex items-center gap-3">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            <p className="text-sm">{b?.nazwa ?? a.budynek_id}</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {a.data_od} → {a.data_do}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

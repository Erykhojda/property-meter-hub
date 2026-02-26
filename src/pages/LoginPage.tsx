import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Lock, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { zarzadcy } from "@/data/mock-data";
import type { AuthUser } from "@/data/store";

interface LoginPageProps {
    onLogin: (user: AuthUser) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
    const [selectedZarzadcaId, setSelectedZarzadcaId] = useState(zarzadcy[0]?.id ?? "");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const selectedZarzadca = zarzadcy.find((z) => z.id === selectedZarzadcaId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedZarzadcaId) { toast.error("Wybierz konto zarządcy"); return; }
        if (!password.trim()) { toast.error("Podaj hasło"); return; }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onLogin({
                name: selectedZarzadca?.full_name ?? selectedZarzadcaId,
                email: selectedZarzadca?.email ?? `${selectedZarzadcaId}@demo.pl`,
                zarzadca_id: selectedZarzadcaId,
            });
        }, 700);
    };

    return (
        <div className="min-h-screen flex bg-background">

            {/* ── Left panel – branding ── */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-[hsl(222,47%,8%)] flex-col justify-between p-12 overflow-hidden">
                {/* Mesh / glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-sky-500/10 blur-[100px]" />
                    {/* Subtle grid */}
                    <div
                        className="absolute inset-0 opacity-[0.04]"
                        style={{
                            backgroundImage: "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
                            backgroundSize: "40px 40px",
                        }}
                    />
                </div>

                {/* Logo */}
                <div className="relative">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-lg tracking-tighter shadow-lg shadow-primary/40">
                            S
                        </div>
                        <div>
                            <span className="text-white font-bold text-lg leading-none">SCORE</span>
                            <span className="block text-white/40 text-xs leading-tight">by Appartme</span>
                        </div>
                    </div>
                </div>

                {/* Center headline */}
                <div className="relative space-y-6">
                    <h2 className="text-4xl font-bold text-white leading-snug">
                        Zarządzaj swoimi<br />
                        <span className="text-primary">nieruchomościami</span><br />
                        w jednym miejscu
                    </h2>
                    <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                        Monitoruj zużycie mediów, zarządzaj strukturą budynków i kontroluj urządzenia pomiarowe Bmeters.
                    </p>

                    {/* Feature pills */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        {["Zużycie mediów", "Struktura budynków", "Mierniki Bmeters", "Alarmy urządzeń"].map((f) => (
                            <span key={f} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                {f}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Bottom */}
                <p className="relative text-white/20 text-xs">© 2025 Appartme · SCORE v0.1.0</p>
            </div>

            {/* ── Right panel – form ── */}
            <div className="flex flex-1 items-center justify-center relative bg-background">
                {/* subtle right-side glow */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full bg-primary/8 blur-[100px]" />
                    <div className="absolute -bottom-32 left-0 w-[300px] h-[300px] rounded-full bg-sky-500/6 blur-[80px]" />
                </div>

                <div className="relative w-full max-w-sm px-6 py-12">

                    {/* Mobile logo */}
                    <div className="flex lg:hidden items-center gap-2.5 mb-10">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-base">B</div>
                        <span className="font-bold text-xl">Panel Zarządcy</span>
                    </div>

                    {/* Header */}
                    <div className="mb-8 space-y-1">
                        <p className="text-xs font-semibold text-primary uppercase tracking-widest">Bmeters</p>
                        <h1 className="text-2xl font-bold tracking-tight">Zaloguj się</h1>
                        <p className="text-sm text-muted-foreground">Wybierz konto i podaj hasło, aby kontynuować</p>
                    </div>

                    {/* Card */}
                    <div className="rounded-2xl border bg-card shadow-lg shadow-black/5 p-6 space-y-5">
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Account selector */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="zarzadca">
                                    Konto zarządcy
                                </label>
                                <Select value={selectedZarzadcaId} onValueChange={setSelectedZarzadcaId}>
                                    <SelectTrigger id="zarzadca" className="h-11">
                                        <SelectValue placeholder="Wybierz zarządcę..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {zarzadcy.map((z) => (
                                            <SelectItem key={z.id} value={z.id}>
                                                <div className="flex flex-col py-0.5">
                                                    <span className="font-medium text-sm">{z.full_name}</span>
                                                    {z.firma && <span className="text-xs text-muted-foreground">{z.firma}</span>}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedZarzadca?.email && (
                                    <p className="text-xs text-muted-foreground pl-0.5 flex items-center gap-1">
                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        {selectedZarzadca.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="password">
                                    Hasło
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="pl-10 pr-10 h-11"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 gap-2 font-semibold shadow-md shadow-primary/20"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                        </svg>
                                        Logowanie…
                                    </>
                                ) : (
                                    <>Zaloguj się <ChevronRight className="h-4 w-4" /></>
                                )}
                            </Button>
                        </form>

                        <div className="flex items-center gap-2 pt-1">
                            <div className="h-px flex-1 bg-border" />
                            <p className="text-xs text-muted-foreground">demo &mdash; dowolne hasło</p>
                            <div className="h-px flex-1 bg-border" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

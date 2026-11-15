"""Exames ocupacionais, treinamentos, acidentes e vales."""

from .common import add, brl, d, pick, rng, rows, uid

CLINIC = "Clínica de Medicina do Trabalho Vida Ocupacional"
# curso: (título, horas, validade em dias)
COURSES = {
    "NR-35": ("Trabalho em altura", 8, 730), "NR-18": ("Condições e meio ambiente de trabalho na construção", 6, 365),
    "NR-10": ("Segurança em instalações e serviços em eletricidade", 40, 730), "NR-06": ("Equipamentos de proteção individual", 4, 365),
    "NR-12": ("Segurança no trabalho em máquinas e equipamentos", 8, 730), "NR-33": ("Segurança e saúde em espaços confinados", 16, 365),
}  # fmt: skip


def exams() -> None:
    staff = rows("employees")
    expiring = {staff[8]["id"], staff[22]["id"]}  # um armador de Candeias e um pedreiro de Cuiabá
    for i, emp in enumerate(staff[:30], start=1):
        valid = 7 if emp["id"] in expiring else rng.randint(30, 330)
        add("health-exams", f"exam:{i}", employeeId=emp["id"], type="periodic" if i > 4 else "admission", issuedAt=d(valid - 365), validUntil=d(valid),
            result="fit_with_restrictions" if i % 11 == 0 else "fit", clinic=CLINIC, doctor="Dr. Henrique Salles — CRM 4412", notes="")  # fmt: skip
    assert sum(1 for e in rows("health-exams") if e["validUntil"] == "@d+7") == 2


def trainings() -> None:
    staff = rows("employees")
    plan = [("NR-35", [0, 1, 2, 3, 4, 5, 6, 12, 13, 14]), ("NR-18", [0, 1, 2, 3, 15, 16]), ("NR-10", [7, 8]), ("NR-12", [24]), ("NR-33", [9])]
    count = 0
    for code, idx in plan:
        title, hours, validity = COURSES[code]
        for pos, i in enumerate(idx):
            count += 1
            done = -rng.randint(40, validity - 60)
            if code == "NR-35" and pos == 0:
                done = 25 - validity  # vence em 25 dias
            add("trainings", f"training:{count}", employeeId=staff[i]["id"], courseCode=code, title=title, hours=hours, completedAt=d(done),
                validUntil=d(done + validity), provider="Centro de Treinamento Segurança Total", certificateRef=f"CERT-{4000 + count}")  # fmt: skip
    assert len(rows("trainings")) == 20, len(rows("trainings"))


def accidents() -> None:
    staff = rows("employees")
    add("work-accidents", "accident:1", obraId=uid("obra:candeias"), employeeId=staff[11]["id"], date=d(-70), kind="typical", severity="no_leave",
        description="Corte superficial na mão durante manuseio de vergalhão sem luva adequada.", catIssued=True, catDueDate=d(-69), daysOff=0,
        investigationStatus="closed", correctiveActions=["Reforço do DDS sobre manuseio de aço", "Substituição das luvas por modelo com proteção anticorte"])  # fmt: skip
    add("work-accidents", "accident:2", obraId=uid("obra:cuiaba"), employeeId=staff[21]["id"], date=d(-35), kind="typical", severity="with_leave",
        description="Torção de tornozelo ao descer de plataforma de trabalho.", catIssued=True, catDueDate=d(-34), daysOff=2,
        investigationStatus="closed", correctiveActions=["Instalação de degrau antiderrapante no acesso", "Inspeção das plataformas pelo técnico de segurança"])  # fmt: skip


def advances() -> None:
    staff = rows("employees")
    kinds = [("advance", 600, "Adiantamento quinzenal"), ("transport", 220, "Vale-transporte do mês"), ("meal", 380, "Vale-alimentação"), ("travel", 540, "Diárias de viagem — mobilização")]
    for i in range(12):
        emp = staff[(i * 3) % 34]
        kind, value, note = kinds[i % 4]
        add("advances", f"advance:{i + 1}", employeeId=emp["id"], obraId=emp["obraId"], kind=kind, amountCents=brl(value + rng.randint(0, 6) * 50), date=d(-rng.randint(1, 20)),
            status=pick(["paid", "paid", "approved", "requested"]), notes=note)  # fmt: skip


def build() -> None:
    exams()
    trainings()
    accidents()
    advances()

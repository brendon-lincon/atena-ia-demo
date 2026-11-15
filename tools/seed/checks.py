"""Verificações de coerência do seed. Falham a geração se algum invariante do manual for violado."""

from .common import rows, uid

MINIMUMS = {
    "schedule-activities": 60, "employees": 34, "diary-entries": 45, "photos": 120, "compliance-items": 25, "cost-entries": 40,
    "advances": 12, "health-exams": 30, "trainings": 20, "conversations": 8, "messages": 60, "emails": 15, "email-templates": 16,
    "library-items": 40, "documents": 20, "document-templates": 12, "deadlines": 30, "tasks": 25, "insights": 12,
}  # fmt: skip


def check(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def build() -> None:
    for name, minimum in MINIMUMS.items():
        check(len(rows(name)) >= minimum, f"{name}: esperado ao menos {minimum}, gerado {len(rows(name))}")
    for obra in rows("obras"):
        items = [r for r in rows("eap-items") if r["obraId"] == obra["id"]]
        fronts = [r for r in items if r["level"] == "front"]
        check(sum(r["contractedCents"] for r in fronts) == obra["contractValueCents"], f"EAP de {obra['code']} não soma o contrato")
        check(abs(sum(r["weightPct"] for r in fronts) - 100) < 0.1, f"Pesos da EAP de {obra['code']} não somam 100%")
        weighted = sum(r["progressPct"] * r["contractedCents"] for r in fronts) / obra["contractValueCents"]
        check(abs(weighted - obra["actualPhysicalPct"]) < 0.15, f"Avanço de {obra['code']} difere da média ponderada da EAP")
    for budget in rows("budgets"):
        items = [r for r in rows("budget-items") if r["budgetId"] == budget["id"]]
        check(sum(r["totalCents"] for r in items) == budget["directCostCents"], f"Itens do orçamento {budget['name']} não somam o custo direto")
        check(budget["directCostCents"] + budget["indirectCostCents"] + budget["bdiCents"] == budget["totalCents"], f"Total do orçamento {budget['name']} incoerente")
    cuiaba = uid("obra:cuiaba")
    check(len([m for m in rows("measurements") if m["obraId"] == cuiaba]) == 4, "Cuiabá deve ter 4 medições")
    check(any(m["number"] == 4 and m["status"] == "approved" for m in rows("measurements") if m["obraId"] == cuiaba), "Medição nº 4 deve estar pronta para enviar")
    for item in rows("measurement-items"):
        check(item["accumulatedQty"] <= item["contractedQty"] + 1e-6, "Medido acima do contratado")
    for obra in rows("obras"):
        if obra["actualCostToDateCents"]:
            spent = sum(c["amountCents"] for c in rows("cost-entries") if c["obraId"] == obra["id"])
            check(spent == obra["actualCostToDateCents"], f"Custos de {obra['code']} não somam o realizado")
    for obra in rows("obras"):
        latest = [e for e in rows("diary-entries") if e["obraId"] == obra["id"]]
        if latest:
            first = min(latest, key=lambda e: abs(int(e["date"][2:])))
            check(first["headcountOwn"] + first["headcountThird"] == obra["headcount"], f"Efetivo de {obra['code']} difere do diário mais recente")
    check(sum(1 for e in rows("health-exams") if e["validUntil"] == "@d+7") == 2, "Devem existir 2 ASO vencendo em 7 dias")
    armadores = [a for a in rows("allocations") if a["role"] == "rebar"]
    check(len({a["employeeId"] for a in armadores}) * 2 == len(armadores), "Conflito da equipe de armação ausente")

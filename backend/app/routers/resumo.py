from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Abastecimento, Despesa, Ganho, Jornada, User
from ..schemas import PlataformaResumo, ResumoOut
from ..security import get_current_user

router = APIRouter(prefix="/resumo", tags=["resumo"])

PERIODOS = {"hoje", "semana", "mes", "tudo"}
_TZ = ZoneInfo("Europe/Lisbon")


def _intervalo(periodo: str) -> tuple[date | None, date | None]:
    """Devolve [início, fim) para o período, em data local de Portugal. (None, None) = tudo."""
    hoje = datetime.now(_TZ).date()
    if periodo == "hoje":
        return hoje, hoje + timedelta(days=1)
    if periodo == "semana":
        inicio = hoje - timedelta(days=hoje.weekday())  # segunda-feira
        return inicio, inicio + timedelta(days=7)
    if periodo == "mes":
        inicio = hoje.replace(day=1)
        fim = inicio.replace(year=inicio.year + 1, month=1) if inicio.month == 12 else inicio.replace(month=inicio.month + 1)
        return inicio, fim
    return None, None


def _parse_data(valor: str | None) -> date | None:
    if not valor:
        return None
    try:
        return date.fromisoformat(valor)
    except ValueError:
        return None


@router.get("", response_model=ResumoOut)
def resumo(
    periodo: str = "hoje",
    inicio: str | None = None,
    fim: str | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ResumoOut:
    # Intervalo personalizado (datas inclusivas) tem prioridade sobre o `periodo`.
    d_inicio = _parse_data(inicio)
    d_fim = _parse_data(fim)
    if d_inicio and d_fim:
        if d_fim < d_inicio:
            d_inicio, d_fim = d_fim, d_inicio
        periodo = "intervalo"
        ini, fim_excl = d_inicio, d_fim + timedelta(days=1)  # half-open [ini, fim_excl)
    else:
        if periodo not in PERIODOS:
            periodo = "hoje"
        ini, fim_excl = _intervalo(periodo)

    gq = db.query(Ganho).filter(Ganho.user_id == user.id)
    aq = db.query(Abastecimento).filter(Abastecimento.user_id == user.id)
    dq = db.query(Despesa).filter(Despesa.user_id == user.id)
    jq = db.query(Jornada).filter(Jornada.user_id == user.id)
    if ini and fim_excl:
        gq = gq.filter(Ganho.data >= ini, Ganho.data < fim_excl)
        aq = aq.filter(Abastecimento.data >= ini, Abastecimento.data < fim_excl)
        dq = dq.filter(Despesa.data >= ini, Despesa.data < fim_excl)
        jq = jq.filter(Jornada.data >= ini, Jornada.data < fim_excl)

    ganhos = gq.all()
    abastecimentos = aq.all()
    despesas = dq.all()
    jornadas = jq.all()

    total_ganhos = sum(g.valor_bruto + (g.gorjetas or 0) for g in ganhos)
    total_custos = sum(a.total for a in abastecimentos) + sum(d.valor for d in despesas)
    lucro = total_ganhos - total_custos
    km = sum(g.km or 0 for g in ganhos)
    horas = sum(g.horas or 0 for g in ganhos)
    corridas = sum(g.num_corridas or 0 for g in ganhos)

    # Km do hodómetro: soma dos km rodados nas jornadas completas (km início e fim presentes).
    jornadas_completas = [j for j in jornadas if j.km_inicio is not None and j.km_fim is not None]
    km_rodados = sum(j.km_fim - j.km_inicio for j in jornadas_completas) if jornadas_completas else None

    por_plataforma: dict[str, dict[str, float]] = {}
    for g in ganhos:
        p = por_plataforma.setdefault(
            g.plataforma, {"ganhos": 0.0, "corridas": 0.0, "km": 0.0, "horas": 0.0}
        )
        p["ganhos"] += g.valor_bruto + (g.gorjetas or 0)
        p["corridas"] += g.num_corridas or 0
        p["km"] += g.km or 0
        p["horas"] += g.horas or 0

    plataformas = [
        PlataformaResumo(
            plataforma=nome,
            ganhos=v["ganhos"],
            corridas=int(v["corridas"]),
            km=v["km"],
            horas=v["horas"],
            ganhos_por_hora=(v["ganhos"] / v["horas"]) if v["horas"] > 0 else None,
            ganhos_por_km=(v["ganhos"] / v["km"]) if v["km"] > 0 else None,
        )
        for nome, v in sorted(por_plataforma.items(), key=lambda kv: kv[1]["ganhos"], reverse=True)
    ]

    return ResumoOut(
        periodo=periodo,
        inicio=ini,
        fim=(fim_excl - timedelta(days=1)) if fim_excl else None,
        ganhos=total_ganhos,
        custos=total_custos,
        lucro=lucro,
        km=km,
        horas=horas,
        corridas=corridas,
        km_rodados=km_rodados,
        lucro_por_km=(lucro / km) if km > 0 else None,
        lucro_por_hora=(lucro / horas) if horas > 0 else None,
        plataformas=plataformas,
    )

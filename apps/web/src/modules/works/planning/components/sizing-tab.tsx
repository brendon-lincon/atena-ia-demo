import { useState } from 'react';
import { formatNumber } from '@/core/format';
import { AnimatedNumber } from '@/design/patterns/animated-number';
import { Input, Label, Select, Slider } from '@/design/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/design/ui/misc';
import { SERVICES, sizeByCrew, sizeByDeadline } from '@/modules/works/planning/lib/sizing';
import { t } from '@/modules/works/planning/i18n';

const MAX_CREW = 40;
const MAX_DAYS = 120;

/** Serviço × produtividade → equipe e prazo, com controles deslizantes e recálculo ao vivo. */
export function SizingTab() {
  const [serviceId, setServiceId] = useState(SERVICES[0]?.id ?? '');
  const [quantity, setQuantity] = useState(120);
  const [days, setDays] = useState(30);
  const [crew, setCrew] = useState(8);
  const service = SERVICES.find((s) => s.id === serviceId) ?? SERVICES[0];
  if (!service) return null;
  const byDeadline = sizeByDeadline(service, quantity, days);
  const byCrew = sizeByCrew(service, quantity, crew);
  const num = (n: number) => formatNumber(Math.round(n));
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t('sizing.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground">{t('sizing.hint')}</p>
          <div className="space-y-1.5">
            <Label htmlFor="svc">{t('sizing.service')}</Label>
            <Select id="svc" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
              {SERVICES.map((s) => (
                <option key={s.id} value={s.id}>
                  {t(`sizing.services.${s.id as 'concrete'}`)} ({s.unit})
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qty">
              {t('sizing.quantity')} ({service.unit})
            </Label>
            <Input
              id="qty"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(Number(e.target.value), 1))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>
              {t('sizing.deadline')}: <span className="tnum font-semibold">{days}</span>
            </Label>
            <Slider
              value={[days]}
              min={5}
              max={MAX_DAYS}
              onValueChange={(v) => setDays(v[0] ?? days)}
              aria-label={t('sizing.deadline')}
            />
          </div>
          <div className="space-y-1.5">
            <Label>
              {t('sizing.crew')}: <span className="tnum font-semibold">{crew}</span>
            </Label>
            <Slider
              value={[crew]}
              min={1}
              max={MAX_CREW}
              onValueChange={(v) => setCrew(v[0] ?? crew)}
              aria-label={t('sizing.crew')}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('sizing.result')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Result
            label={t('sizing.needsCrew')}
            value={byDeadline.crew}
            unit={t('sizing.people')}
            format={num}
          />
          <Result
            label={t('sizing.resultingDays')}
            value={byCrew.days}
            unit={t('sizing.days')}
            format={num}
          />
          <Result
            label={t('sizing.totalHh')}
            value={byDeadline.totalHh}
            unit={t('sizing.hh')}
            format={num}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Result({
  label,
  value,
  unit,
  format,
}: {
  label: string;
  value: number;
  unit: string;
  format: (n: number) => string;
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="flex items-baseline gap-2">
        <AnimatedNumber
          value={value}
          format={format}
          className="text-4xl font-semibold tracking-tight tnum"
        />
        <span className="text-lg text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}

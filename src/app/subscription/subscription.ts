import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import ApexCharts from 'apexcharts';
import {
  SubscriptionPlansService,
  Plan,
  Subscriber,
} from './services/subscription-plans.service';

@Component({
  selector: 'app-subscription',
  template: `
    <div class="p-4 lg:p-6">
      <!-- Page header -->
      <div class="mb-5 flex items-center justify-between">
        <div>
          <h1
            class="font-heading font-bold text-2xl lg:text-3xl"
            style="color:var(--foreground)"
          >
            Assinaturas
          </h1>
          <p class="text-sm mt-0.5" style="color:var(--muted-foreground)">
            Gestão de planos e assinantes da plataforma
          </p>
        </div>
        <div
          class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style="background-color:hsl(152,69%,40%,0.1);color:hsl(152,69%,40%)"
        >
          <span class="material-icons" style="font-size:1rem"
            >workspace_premium</span
          >
          {{ plans.length }} planos cadastrados
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loadingPlans" class="flex items-center justify-center py-20">
        <svg
          style="width:2.5rem;height:2.5rem"
          viewBox="0 0 100 100"
          fill="none"
        >
          <circle
            cx="50"
            cy="50"
            r="36"
            stroke="var(--primary)"
            stroke-width="3"
            opacity="0.1"
          />
          <circle
            cx="50"
            cy="50"
            r="36"
            stroke="var(--primary)"
            stroke-width="3"
            stroke-linecap="round"
            stroke-dasharray="169.6 226.2"
            style="transform-origin:50px 50px;animation:sp-cw 1.3s cubic-bezier(0.4,0,0.2,1) infinite"
          />
          <circle
            cx="50"
            cy="50"
            r="22"
            stroke="var(--primary)"
            stroke-width="2.5"
            opacity="0.1"
          />
          <circle
            cx="50"
            cy="50"
            r="22"
            stroke="var(--primary)"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-dasharray="69.1 138.2"
            opacity="0.65"
            style="transform-origin:50px 50px;animation:sp-ccw 0.9s cubic-bezier(0.4,0,0.2,1) infinite"
          />
          <circle
            cx="50"
            cy="50"
            r="5"
            fill="var(--primary)"
            style="animation:sp-pulse 1.3s ease-in-out infinite"
          />
        </svg>
      </div>

      <!-- KPIs -->
      <div
        *ngIf="!loadingPlans"
        class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4"
      >
        <div class="card p-4 lg:p-5">
          <div class="flex items-start justify-between mb-2">
            <span
              class="text-xs font-medium leading-tight"
              style="color:var(--muted-foreground)"
              >Assinantes</span
            >
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style="background-color:hsl(152,69%,40%,0.1);color:hsl(152,69%,40%)"
            >
              <span class="material-icons" style="font-size:1.1rem"
                >groups</span
              >
            </div>
          </div>
          <div
            class="font-heading font-bold text-2xl lg:text-3xl mt-1"
            style="color:var(--foreground)"
          >
            {{ totalSubscribers }}
          </div>
          <div class="text-xs mt-1" style="color:var(--muted-foreground)">
            em todos os planos
          </div>
        </div>

        <div class="card p-4 lg:p-5">
          <div class="flex items-start justify-between mb-2">
            <span
              class="text-xs font-medium leading-tight"
              style="color:var(--muted-foreground)"
              >Receita Potencial</span
            >
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style="background-color:hsl(36,95%,55%,0.1);color:hsl(36,95%,55%)"
            >
              <span class="material-icons" style="font-size:1.1rem"
                >payments</span
              >
            </div>
          </div>
          <div
            class="font-heading font-bold text-2xl lg:text-3xl mt-1"
            style="color:var(--foreground)"
          >
            R$ {{ totalRevenue | number: '1.0-0' }}
          </div>
          <div class="text-xs mt-1" style="color:var(--muted-foreground)">
            /mês estimado
          </div>
        </div>

        <div class="card p-4 lg:p-5">
          <div class="flex items-start justify-between mb-2">
            <span
              class="text-xs font-medium leading-tight"
              style="color:var(--muted-foreground)"
              >Planos Pagos</span
            >
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style="background-color:hsl(221,83%,53%,0.1);color:hsl(221,83%,53%)"
            >
              <span class="material-icons" style="font-size:1.1rem">stars</span>
            </div>
          </div>
          <div
            class="font-heading font-bold text-2xl lg:text-3xl mt-1"
            style="color:var(--foreground)"
          >
            {{ paidPlansCount }}
          </div>
          <div class="text-xs mt-1" style="color:var(--muted-foreground)">
            de {{ plans.length }} planos
          </div>
        </div>

        <div class="card p-4 lg:p-5">
          <div class="flex items-start justify-between mb-2">
            <span
              class="text-xs font-medium leading-tight"
              style="color:var(--muted-foreground)"
              >Ticket Médio</span
            >
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style="background-color:hsl(280,65%,55%,0.1);color:hsl(280,65%,55%)"
            >
              <span class="material-icons" style="font-size:1.1rem"
                >trending_up</span
              >
            </div>
          </div>
          <div
            class="font-heading font-bold text-2xl lg:text-3xl mt-1"
            style="color:var(--foreground)"
          >
            R$ {{ avgTicket | number: '1.0-0' }}
          </div>
          <div class="text-xs mt-1" style="color:var(--muted-foreground)">
            por assinante
          </div>
        </div>
      </div>

      <!-- Cards de planos -->
      <div
        *ngIf="!loadingPlans"
        class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4"
      >
        <div
          *ngFor="let plan of plans; let i = index"
          (click)="selectPlan(plan)"
          class="card p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
          [style.border]="isSelected(plan) ? '2px solid var(--primary)' : ''"
          [style.box-shadow]="
            isSelected(plan) ? '0 0 0 4px hsl(152,69%,40%,0.1)' : ''
          "
        >
          <!-- Header card -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2.5">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                [style.background-color]="getPlanBg(i)"
                [style.color]="getPlanColor(i)"
              >
                <span class="material-icons" style="font-size:1.2rem">{{
                  getPlanIcon(plan)
                }}</span>
              </div>
              <div>
                <h2
                  class="font-heading font-bold text-base"
                  style="color:var(--foreground)"
                >
                  {{ plan.name }}
                </h2>
                <p class="text-xs" style="color:var(--muted-foreground)">
                  {{ plan._count.subscriptions }} assinante{{
                    plan._count.subscriptions !== 1 ? 's' : ''
                  }}
                </p>
              </div>
            </div>
            <span
              class="text-xs font-medium px-2 py-0.5 rounded-full"
              [style.background-color]="
                plan.active ? 'hsl(152,69%,40%,0.1)' : 'hsl(0,0%,50%,0.1)'
              "
              [style.color]="plan.active ? 'hsl(152,69%,40%)' : 'hsl(0,0%,50%)'"
            >
              {{ plan.active ? 'Ativo' : 'Inativo' }}
            </span>
          </div>

          <!-- Preço -->
          <div class="flex items-baseline gap-1 mb-3">
            <span
              class="font-heading font-bold text-3xl"
              style="color:var(--foreground)"
            >
              {{ plan.price | currency: 'BRL' : 'symbol' : '1.0-0' }}
            </span>
            <span class="text-sm" style="color:var(--muted-foreground)"
              >/mês</span
            >
          </div>

          <!-- Descrição -->
          <p
            *ngIf="plan.description"
            class="text-xs mb-3"
            style="color:var(--muted-foreground)"
          >
            {{ plan.description }}
          </p>

          <!-- Features -->
          <ul class="space-y-1.5 mb-3">
            <li
              *ngFor="let feature of plan.features"
              class="flex items-center gap-2 text-xs"
              style="color:var(--foreground)"
            >
              <span
                class="material-icons"
                style="font-size:0.95rem;color:var(--primary)"
                >check_circle</span
              >
              {{ feature }}
            </li>
          </ul>

          <!-- Footer -->
          <div
            class="pt-3 border-t flex items-center gap-1.5 text-xs"
            style="border-color:var(--border);color:var(--muted-foreground)"
          >
            <span class="material-icons" style="font-size:0.95rem"
              >sports_tennis</span
            >
            {{
              plan.max_courts
                ? 'Até ' +
                  plan.max_courts +
                  ' quadra' +
                  (plan.max_courts > 1 ? 's' : '')
                : 'Quadras ilimitadas'
            }}
          </div>
        </div>
      </div>

      <!-- Gráficos -->
      <div
        *ngIf="!loadingPlans && plans.length > 0"
        class="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4"
      >
        <div class="card" style="padding:1.25rem 1.25rem 0.5rem">
          <div class="flex items-center justify-between mb-1">
            <div>
              <h2
                class="font-heading font-semibold text-base"
                style="color:var(--foreground)"
              >
                Distribuição de Assinantes
              </h2>
              <p class="text-xs mt-0.5" style="color:var(--muted-foreground)">
                Total:
                <span
                  class="font-heading font-bold"
                  style="color:var(--primary)"
                  >{{ totalSubscribers }}</span
                >
              </p>
            </div>
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center"
              style="background-color:hsl(152,69%,40%,0.1);color:hsl(152,69%,40%)"
            >
              <span class="material-icons" style="font-size:1.1rem"
                >donut_large</span
              >
            </div>
          </div>
          <div #donutEl></div>
        </div>

        <div class="card" style="padding:1.25rem 1.25rem 0.5rem">
          <div class="flex items-center justify-between mb-1">
            <div>
              <h2
                class="font-heading font-semibold text-base"
                style="color:var(--foreground)"
              >
                Receita por Plano
              </h2>
              <p class="text-xs mt-0.5" style="color:var(--muted-foreground)">
                Mensal estimado:
                <span
                  class="font-heading font-bold"
                  style="color:var(--primary)"
                  >R$ {{ totalRevenue | number: '1.2-2' }}</span
                >
              </p>
            </div>
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center"
              style="background-color:hsl(36,95%,55%,0.1);color:hsl(36,95%,55%)"
            >
              <span class="material-icons" style="font-size:1.1rem"
                >bar_chart</span
              >
            </div>
          </div>
          <div #barEl></div>
        </div>
      </div>

      <!-- Detalhe dos assinantes -->
      <div *ngIf="selectedPlan" class="card overflow-hidden" style="padding:0">
        <div
          class="px-5 py-4 flex items-center justify-between"
          style="border-bottom:1px solid var(--border)"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center"
              style="background-color:hsl(152,69%,40%,0.1);color:hsl(152,69%,40%)"
            >
              <span class="material-icons" style="font-size:1.1rem"
                >people</span
              >
            </div>
            <div>
              <h3
                class="font-heading font-semibold text-base"
                style="color:var(--foreground)"
              >
                Assinantes — {{ selectedPlan.name }}
              </h3>
              <p class="text-xs" style="color:var(--muted-foreground)">
                {{ subscribers.length }}
                {{
                  subscribers.length === 1
                    ? 'estabelecimento'
                    : 'estabelecimentos'
                }}
              </p>
            </div>
          </div>
          <button
            (click)="selectedPlan = null"
            class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            style="color:var(--muted-foreground)"
          >
            <span class="material-icons" style="font-size:1.1rem">close</span>
          </button>
        </div>

        <div
          *ngIf="loadingSubscribers"
          class="flex items-center justify-center py-12"
        >
          <svg style="width:2rem;height:2rem" viewBox="0 0 100 100" fill="none">
            <circle
              cx="50"
              cy="50"
              r="36"
              stroke="var(--primary)"
              stroke-width="3"
              opacity="0.1"
            />
            <circle
              cx="50"
              cy="50"
              r="36"
              stroke="var(--primary)"
              stroke-width="3"
              stroke-linecap="round"
              stroke-dasharray="169.6 226.2"
              style="transform-origin:50px 50px;animation:sp-cw 1.3s cubic-bezier(0.4,0,0.2,1) infinite"
            />
          </svg>
        </div>

        <div
          *ngIf="subscribersError"
          class="flex flex-col items-center justify-center py-12 gap-2"
        >
          <span
            class="material-icons"
            style="font-size:2rem;color:hsl(0,84%,60%)"
            >error_outline</span
          >
          <span class="text-sm" style="color:var(--muted-foreground)"
            >Erro ao carregar assinantes</span
          >
        </div>

        <div
          *ngIf="
            !loadingSubscribers && !subscribersError && subscribers.length === 0
          "
          class="flex flex-col items-center justify-center py-12 gap-2"
        >
          <span
            class="material-icons"
            style="font-size:2rem;color:var(--muted-foreground)"
            >inbox</span
          >
          <span class="text-sm" style="color:var(--muted-foreground)"
            >Nenhum assinante neste plano</span
          >
        </div>

        <div
          *ngIf="!loadingSubscribers && subscribers.length > 0"
          class="overflow-x-auto"
        >
          <table class="w-full text-sm">
            <thead>
              <tr style="background-color:var(--muted)">
                <th
                  class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide"
                  style="color:var(--muted-foreground)"
                >
                  Estabelecimento
                </th>
                <th
                  class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide"
                  style="color:var(--muted-foreground)"
                >
                  Responsável
                </th>
                <th
                  class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide"
                  style="color:var(--muted-foreground)"
                >
                  Quadras
                </th>
                <th
                  class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide"
                  style="color:var(--muted-foreground)"
                >
                  Status
                </th>
                <th
                  class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide"
                  style="color:var(--muted-foreground)"
                >
                  Adesão
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                *ngFor="let sub of subscribers"
                class="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40"
                style="border-top:1px solid var(--border)"
              >
                <td class="px-5 py-3">
                  <div class="flex items-center gap-2.5">
                    <div
                      class="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold"
                      style="background-color:hsl(152,69%,40%,0.1);color:hsl(152,69%,40%)"
                    >
                      {{
                        getInitials(
                          sub.user.establishment?.name || sub.user.name
                        )
                      }}
                    </div>
                    <span class="font-medium" style="color:var(--foreground)">{{
                      sub.user.establishment?.name || '—'
                    }}</span>
                  </div>
                </td>
                <td class="px-5 py-3">
                  <div style="color:var(--foreground)">{{ sub.user.name }}</div>
                  <div class="text-xs" style="color:var(--muted-foreground)">
                    {{ sub.user.email }}
                  </div>
                </td>
                <td class="px-5 py-3">
                  <div
                    class="flex items-center gap-1.5"
                    style="color:var(--foreground)"
                  >
                    <span
                      class="material-icons"
                      style="font-size:1rem;color:var(--muted-foreground)"
                      >sports_tennis</span
                    >
                    {{ sub.user.establishment?._count?.courts ?? '—' }}
                  </div>
                </td>
                <td class="px-5 py-3">
                  <span
                    class="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                    [style.background-color]="statusBg(sub.status)"
                    [style.color]="statusColor(sub.status)"
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full"
                      [style.background-color]="statusColor(sub.status)"
                    ></span>
                    {{ statusLabel(sub.status) }}
                  </span>
                </td>
                <td class="px-5 py-3" style="color:var(--muted-foreground)">
                  {{
                    sub.ends_at
                      ? (sub.ends_at | date: 'dd/MM/yyyy')
                      : sub.trial_ends_at
                        ? (sub.trial_ends_at | date: 'dd/MM/yyyy')
                        : (sub.created_at | date: 'dd/MM/yyyy')
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class Subscription implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('donutEl') donutEl!: ElementRef<HTMLElement>;
  @ViewChild('barEl') barEl!: ElementRef<HTMLElement>;

  plans: Plan[] = [];
  selectedPlan: Plan | null = null;
  subscribers: Subscriber[] = [];
  loadingPlans = false;
  loadingSubscribers = false;
  subscribersError = false;

  private donutChart?: ApexCharts;
  private barChart?: ApexCharts;
  private viewReady = false;
  private dataReady = false;

  private planBgColors = [
    'hsl(152,69%,40%,0.1)',
    'hsl(36,95%,55%,0.1)',
    'hsl(221,83%,53%,0.1)',
    'hsl(280,65%,55%,0.1)',
  ];
  private planFgColors = [
    'hsl(152,69%,40%)',
    'hsl(36,95%,55%)',
    'hsl(221,83%,53%)',
    'hsl(280,65%,55%)',
  ];

  constructor(private plansService: SubscriptionPlansService) {}

  get totalSubscribers(): number {
    return this.plans.reduce((s, p) => s + p._count.subscriptions, 0);
  }
  get totalRevenue(): number {
    return this.plans.reduce((s, p) => s + p._count.subscriptions * p.price, 0);
  }
  get paidPlansCount(): number {
    return this.plans.filter((p) => p.price > 0).length;
  }
  get avgTicket(): number {
    return this.totalSubscribers > 0
      ? this.totalRevenue / this.totalSubscribers
      : 0;
  }

  ngOnInit(): void {
    this.loadingPlans = true;
    this.plansService.getPlans().subscribe({
      next: ({ plans }) => {
        this.plans = plans;
        this.loadingPlans = false;
        this.dataReady = true;
        this.tryRenderCharts();
      },
      error: () => {
        this.loadingPlans = false;
      },
    });
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.tryRenderCharts();
  }

  ngOnDestroy(): void {
    this.donutChart?.destroy();
    this.barChart?.destroy();
  }

  private tryRenderCharts(): void {
    if (!this.viewReady || !this.dataReady) return;
    setTimeout(() => this.renderCharts(), 0);
  }

  private renderCharts(): void {
    const active = this.plans.filter((p) => p._count.subscriptions > 0);
    const donutLabels = active.map((p) => p.name);
    const donutData = active.map((p) => p._count.subscriptions);
    const barCategories = this.plans.map((p) => p.name);
    const barData = this.plans.map(
      (p) => +(p._count.subscriptions * p.price).toFixed(2),
    );

    if (this.donutEl?.nativeElement && donutData.length > 0) {
      this.donutChart?.destroy();
      this.donutChart = new ApexCharts(this.donutEl.nativeElement, {
        series: donutData,
        chart: {
          type: 'donut',
          height: 260,
          fontFamily: 'Inter, sans-serif',
          animations: { enabled: true, speed: 700 },
        },
        labels: donutLabels,
        colors: ['#22a55c', '#f59e0b', '#3b82f6', '#a855f7'],
        legend: {
          position: 'bottom',
          labels: { colors: 'hsl(160,10%,55%)' },
          fontSize: '12px',
          markers: { width: 10, height: 10, radius: 12 } as any,
          itemMargin: { horizontal: 8, vertical: 4 },
        },
        stroke: { width: 0 },
        dataLabels: { enabled: false },
        tooltip: {
          theme: 'dark',
          y: {
            formatter: (v: number) => `${v} assinante${v !== 1 ? 's' : ''}`,
          },
        },
        plotOptions: {
          pie: {
            donut: {
              size: '70%',
              labels: {
                show: true,
                name: { color: 'hsl(160,10%,55%)' },
                value: {
                  color: 'hsl(160,10%,30%)',
                  fontSize: '20px',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                },
              },
            },
          },
        },
      });
      this.donutChart.render();
    }

    if (this.barEl?.nativeElement && barData.length > 0) {
      this.barChart?.destroy();
      this.barChart = new ApexCharts(this.barEl.nativeElement, {
        series: [{ name: 'Receita', data: barData }],
        chart: {
          type: 'bar',
          height: 260,
          toolbar: { show: false },
          fontFamily: 'Inter, sans-serif',
          animations: { enabled: true, speed: 700 },
        },
        colors: ['#22a55c'],
        dataLabels: { enabled: false },
        plotOptions: {
          bar: { borderRadius: 8, columnWidth: '45%', distributed: false },
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'light',
            shadeIntensity: 0.4,
            opacityFrom: 1,
            opacityTo: 0.7,
            stops: [0, 100],
          },
        },
        xaxis: {
          categories: barCategories,
          axisBorder: { show: false },
          axisTicks: { show: false },
          labels: {
            style: {
              colors: 'hsl(160,10%,55%)',
              fontSize: '11px',
              fontFamily: 'Inter, sans-serif',
            },
          },
        },
        yaxis: {
          labels: {
            formatter: (v: number) => (v === 0 ? '0' : `R$${Math.round(v)}`),
            style: {
              colors: 'hsl(160,10%,55%)',
              fontSize: '11px',
              fontFamily: 'Inter, sans-serif',
            },
          },
        },
        grid: {
          borderColor: 'hsl(150,12%,90%)',
          strokeDashArray: 4,
          padding: { left: 8 },
        },
        tooltip: {
          theme: 'dark',
          y: {
            formatter: (v: number) =>
              `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          },
        },
      });
      this.barChart.render();
    }
  }

  selectPlan(plan: Plan): void {
    if (this.selectedPlan?.id === plan.id) {
      this.selectedPlan = null;
      return;
    }
    this.selectedPlan = plan;
    this.loadingSubscribers = true;
    this.subscribersError = false;
    this.plansService.getSubscribers(plan.id).subscribe({
      next: ({ subscriptions }) => {
        this.subscribers = subscriptions;
        this.loadingSubscribers = false;
      },
      error: () => {
        this.loadingSubscribers = false;
        this.subscribersError = true;
      },
    });
  }

  isSelected(plan: Plan): boolean {
    return this.selectedPlan?.id === plan.id;
  }

  getPlanBg(index: number): string {
    return this.planBgColors[index % this.planBgColors.length];
  }
  getPlanColor(index: number): string {
    return this.planFgColors[index % this.planFgColors.length];
  }

  getPlanIcon(plan: Plan): string {
    if (plan.price === 0) return 'card_giftcard';
    if (plan.price < 100) return 'rocket_launch';
    if (plan.price < 300) return 'workspace_premium';
    return 'diamond';
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('');
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'Ativo',
      TRIAL: 'Trial',
      EXPIRED: 'Expirado',
      CANCELLED: 'Cancelado',
      PAST_DUE: 'Inadimplente',
    };
    return map[status] ?? status;
  }

  statusBg(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'hsl(152,69%,40%,0.1)',
      TRIAL: 'hsl(221,83%,53%,0.1)',
      EXPIRED: 'hsl(0,0%,50%,0.1)',
      CANCELLED: 'hsl(0,84%,60%,0.1)',
      PAST_DUE: 'hsl(36,95%,55%,0.1)',
    };
    return map[status] ?? 'hsl(0,0%,50%,0.1)';
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      ACTIVE: 'hsl(152,69%,40%)',
      TRIAL: 'hsl(221,83%,53%)',
      EXPIRED: 'hsl(0,0%,50%)',
      CANCELLED: 'hsl(0,84%,60%)',
      PAST_DUE: 'hsl(36,95%,55%)',
    };
    return map[status] ?? 'hsl(0,0%,50%)';
  }
}

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
    <div class="p-6">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Gestão de Assinaturas
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Planos ativos e assinantes da plataforma
        </p>
      </div>

      <!-- Loading -->
      <div *ngIf="loadingPlans" class="flex justify-center py-16">
        <span class="text-gray-400 dark:text-gray-500 text-sm"
          >Carregando planos...</span
        >
      </div>

      <!-- Cards de planos -->
      <div
        *ngIf="!loadingPlans"
        class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <div
          *ngFor="let plan of plans"
          (click)="selectPlan(plan)"
          class="cursor-pointer rounded-xl border p-5 transition-all duration-200"
          [ngClass]="cardClass(plan)"
        >
          <div class="flex items-start justify-between mb-3">
            <h2 class="text-base font-semibold text-gray-900 dark:text-white">
              {{ plan.name }}
            </h2>
            <span
              class="text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full"
            >
              {{ plan._count.subscriptions }} assinantes
            </span>
          </div>
          <p class="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
            {{ plan.price | currency: 'BRL' : 'symbol' : '1.0-0' }}
            <span class="text-sm font-normal text-gray-400">/mês</span>
          </p>
          <p
            *ngIf="plan.description"
            class="text-xs text-gray-500 dark:text-gray-400 mb-3"
          >
            {{ plan.description }}
          </p>
          <ul class="space-y-1">
            <li
              *ngFor="let feature of plan.features"
              class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300"
            >
              <span class="text-green-500">✓</span> {{ feature }}
            </li>
          </ul>
          <p
            *ngIf="plan.max_courts"
            class="mt-3 text-xs text-gray-400 dark:text-gray-500"
          >
            Até {{ plan.max_courts }} quadra{{ plan.max_courts > 1 ? 's' : '' }}
          </p>
          <p
            *ngIf="!plan.max_courts"
            class="mt-3 text-xs text-gray-400 dark:text-gray-500"
          >
            Quadras ilimitadas
          </p>
        </div>
      </div>

      <!-- Gráficos -->
      <div
        *ngIf="!loadingPlans && plans.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
      >
        <div
          class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5"
        >
          <h3 class="font-semibold text-sm text-gray-900 dark:text-white mb-1">
            Assinantes por Plano
          </h3>
          <div #donutEl></div>
        </div>
        <div
          class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5"
        >
          <h3 class="font-semibold text-sm text-gray-900 dark:text-white mb-1">
            Receita Potencial Mensal
          </h3>
          <div #barEl></div>
        </div>
      </div>

      <!-- Tabela de assinantes -->
      <div
        *ngIf="selectedPlan"
        class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
      >
        <div
          class="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between"
        >
          <h3 class="font-semibold text-gray-900 dark:text-white text-sm">
            Assinantes — {{ selectedPlan.name }}
          </h3>
          <button
            (click)="selectedPlan = null"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none"
          >
            &times;
          </button>
        </div>
        <div *ngIf="loadingSubscribers" class="flex justify-center py-10">
          <span class="text-gray-400 text-sm">Carregando assinantes...</span>
        </div>
        <div *ngIf="subscribersError" class="flex justify-center py-10">
          <span class="text-red-400 text-sm">Erro ao carregar assinantes.</span>
        </div>
        <div
          *ngIf="
            !loadingSubscribers && !subscribersError && subscribers.length === 0
          "
          class="flex justify-center py-10"
        >
          <span class="text-gray-400 text-sm"
            >Nenhum assinante neste plano.</span
          >
        </div>
        <table
          *ngIf="!loadingSubscribers && subscribers.length > 0"
          class="w-full text-sm"
        >
          <thead class="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th
                class="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
              >
                Estabelecimento
              </th>
              <th
                class="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
              >
                Responsável
              </th>
              <th
                class="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
              >
                Quadras
              </th>
              <th
                class="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
              >
                Status
              </th>
              <th
                class="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
              >
                Adesão
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let sub of subscribers"
              class="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
            >
              <td class="px-5 py-3 font-medium text-gray-900 dark:text-white">
                {{ sub.user.establishment?.name || '—' }}
              </td>
              <td class="px-5 py-3 text-gray-600 dark:text-gray-300">
                <div>{{ sub.user.name }}</div>
                <div class="text-xs text-gray-400">{{ sub.user.email }}</div>
              </td>
              <td class="px-5 py-3 text-gray-600 dark:text-gray-300">
                {{ sub.user.establishment?._count?.courts ?? '—' }}
              </td>
              <td class="px-5 py-3">
                <span
                  class="text-xs font-medium px-2 py-0.5 rounded-full"
                  [class]="statusClass(sub.status)"
                  >{{ statusLabel(sub.status) }}</span
                >
              </td>
              <td class="px-5 py-3 text-gray-500 dark:text-gray-400">
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

  constructor(private plansService: SubscriptionPlansService) {}

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
    // Aguarda o *ngIf renderizar os divs no DOM
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
        chart: { type: 'donut', height: 240, fontFamily: 'Inter, sans-serif' },
        labels: donutLabels,
        colors: ['#22a55c', '#16a34a', '#15803d', '#166534'],
        legend: {
          position: 'bottom',
          labels: { colors: 'hsl(160,10%,55%)' },
          fontSize: '12px',
        },
        dataLabels: { enabled: false },
        tooltip: {
          theme: 'dark',
          y: {
            formatter: (v: number) => `${v} assinante${v !== 1 ? 's' : ''}`,
          },
        },
        plotOptions: { pie: { donut: { size: '65%' } } },
      });
      this.donutChart.render();
    }

    if (this.barEl?.nativeElement && barData.length > 0) {
      this.barChart?.destroy();
      this.barChart = new ApexCharts(this.barEl.nativeElement, {
        series: [{ name: 'Receita Potencial', data: barData }],
        chart: {
          type: 'bar',
          height: 240,
          toolbar: { show: false },
          fontFamily: 'Inter, sans-serif',
        },
        colors: ['#22a55c'],
        dataLabels: { enabled: false },
        plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
        xaxis: {
          categories: barCategories,
          axisBorder: { show: false },
          axisTicks: { show: false },
          labels: { style: { colors: 'hsl(160,10%,55%)', fontSize: '11px' } },
        },
        yaxis: {
          labels: {
            formatter: (v: number) => (v === 0 ? '0' : `R$${Math.round(v)}`),
            style: { colors: 'hsl(160,10%,55%)', fontSize: '11px' },
          },
        },
        grid: { borderColor: 'hsl(150,12%,90%)', strokeDashArray: 4 },
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

  cardClass(plan: Plan): string {
    const selected = this.selectedPlan?.id === plan.id;
    return selected
      ? 'border-green-500 bg-green-50 dark:border-green-500 dark:bg-green-900/10'
      : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800';
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

  statusClass(status: string): string {
    const map: Record<string, string> = {
      ACTIVE:
        'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
      TRIAL: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
      EXPIRED: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
      CANCELLED: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
      PAST_DUE:
        'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
    };
    return map[status] ?? '';
  }
}

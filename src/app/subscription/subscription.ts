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
  templateUrl: './subscription.html',
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

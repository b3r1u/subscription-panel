import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Plan {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  max_courts: number | null;
  features: string[];
  active: boolean;
  _count: {
    subscriptions: number;
  };
}

export interface Subscriber {
  id: string;
  status: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELLED' | 'PAST_DUE';
  created_at: string;
  ends_at: string | null;
  trial_ends_at: string | null;
  user: {
    name: string;
    email: string;
    establishment: {
      name: string;
      _count: { courts: number };
    } | null;
  };
}

@Injectable({ providedIn: 'root' })
export class SubscriptionPlansService {
  private api = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getPlans(): Observable<{ plans: Plan[] }> {
    return this.http.get<{ plans: Plan[] }>(`${this.api}/platform/plans`);
  }

  getSubscribers(planId: string): Observable<{ subscriptions: Subscriber[] }> {
    return this.http.get<{ subscriptions: Subscriber[] }>(
      `${this.api}/platform/plans/${planId}/subscribers`,
    );
  }
}

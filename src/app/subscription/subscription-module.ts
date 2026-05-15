import { NgModule }            from '@angular/core';
import { CommonModule }        from '@angular/common';
import { HttpClientModule }    from '@angular/common/http';
import { SubscriptionRoutingModule } from './subscription-routing-module';
import { Subscription }        from './subscription';

@NgModule({
  declarations: [Subscription],
  imports: [CommonModule, HttpClientModule, SubscriptionRoutingModule],
})
export class SubscriptionModule {}
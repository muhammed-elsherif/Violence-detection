import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface PaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  billingData: {
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    apartment: string;
    floor: string;
    street: string;
    building: string;
    shipping_method: string;
    postal_code: string;
    city: string;
    country: string;
    state: string;
  };
}

interface PaymentResponse {
  iframe_url: string;
  payment_key: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = environment.apiUrl;
  private paymobApiKey = environment.paymobApiKey;

  constructor(private http: HttpClient) {}

  // Step 1: Get authentication token
  private getAuthToken(): Observable<any> {
    return this.http.post(`${this.apiUrl}/payment/auth-token`, {
      api_key: this.paymobApiKey
    });
  }

  // Step 2: Create order
  private createOrder(authToken: string, amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/payment/order`, {
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: amount * 100, // Convert to cents
      currency: 'EGP',
      items: []
    });
  }

  // Step 3: Get payment key
  private getPaymentKey(authToken: string, orderId: string, billingData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/payment/payment-key`, {
      auth_token: authToken,
      amount_cents: billingData.amount * 100,
      expiration: 3600,
      order_id: orderId,
      billing_data: billingData,
      currency: 'EGP',
      integration_id: environment.paymobIntegrationId
    });
  }

  // Main payment method that orchestrates the payment flow
  initiatePayment(paymentRequest: PaymentRequest): Observable<PaymentResponse> {
    return new Observable(observer => {
      this.getAuthToken().subscribe(
        authResponse => {
          const authToken = authResponse.token;
          
          this.createOrder(authToken, paymentRequest.amount).subscribe(
            orderResponse => {
              const orderId = orderResponse.id;
              
              this.getPaymentKey(authToken, orderId, paymentRequest.billingData).subscribe(
                paymentKeyResponse => {
                  observer.next({
                    iframe_url: `https://accept.paymob.com/api/acceptance/iframes/${environment.paymobIframeId}?payment_token=${paymentKeyResponse.token}`,
                    payment_key: paymentKeyResponse.token
                  });
                  observer.complete();
                },
                error => observer.error(error)
              );
            },
            error => observer.error(error)
          );
        },
        error => observer.error(error)
      );
    });
  }

  // Verify payment status
  verifyPayment(paymentKey: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/payment/verify/${paymentKey}`);
  }
} 
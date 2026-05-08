import { HttpService } from '@nestjs/axios';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import CircuitBreaker from 'opossum';

interface CustomerProfileResponse {
  customerId: string;
  cpf: string;
  name: string;
  email?: string;
  phone: string;
  vehicles?: Array<{
    plate: string;
    brand: string;
    model: string;
    year: number;
  }>;
}

@Injectable()
export class CustomerServiceClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly retries: number;
  private readonly breaker: CircuitBreaker<[string], CustomerProfileResponse>;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('customerService.url') || '';
    this.timeoutMs = this.configService.get<number>('customerService.timeout', 3000);
    this.retries = this.configService.get<number>('customerService.retries', 1);

    this.breaker = new CircuitBreaker(this.fetchProfile.bind(this), {
      timeout: this.timeoutMs,
      errorThresholdPercentage: 50,
      resetTimeout: 10000,
      rollingCountBuckets: 10,
      rollingCountTimeout: 10000,
    });
  }

  isEnabled(): boolean {
    return Boolean(this.baseUrl);
  }

  async getCustomerProfile(cpf: string): Promise<CustomerProfileResponse> {
    if (!this.isEnabled()) {
      throw new ServiceUnavailableException(
        'Customer Service URL is not configured',
      );
    }

    try {
      return await this.breaker.fire(cpf);
    } catch {
      throw new ServiceUnavailableException(
        'servico temporariamente indisponivel',
      );
    }
  }

  private async fetchProfile(cpf: string): Promise<CustomerProfileResponse> {
    const endpoint = `${this.baseUrl}/customers/${cpf}/profile`;

    let lastError: unknown;
    const attempts = this.retries + 1;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const response = await this.httpService.axiosRef.get<CustomerProfileResponse>(
          endpoint,
          {
            timeout: this.timeoutMs,
          },
        );

        return response.data;
      } catch (error) {
        lastError = error;
        if (attempt < attempts) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    }

    throw lastError;
  }
}


import { Repository } from 'typeorm';
import { Subscription, SubscriptionTier, SubscriptionStatus } from '../models/subscription.model';
import { AppError } from '../middlewares/error.middleware';

export interface CreateSubscriptionInput {
  userId: string;
  tier: SubscriptionTier;
  stripeCustomerId?: string;
}

export class PaymentService {
  constructor(private subscriptionRepository: Repository<Subscription>) {}

  async createSubscription(input: CreateSubscriptionInput): Promise<Subscription> {
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: { userId: input.userId, status: SubscriptionStatus.ACTIVE },
    });

    if (existingSubscription) {
      throw new AppError(400, 'User already has an active subscription');
    }

    const subscription = this.subscriptionRepository.create({
      ...input,
      status: SubscriptionStatus.TRIAL,
      trialStart: new Date(),
      trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
    });

    return await this.subscriptionRepository.save(subscription);
  }

  async getSubscriptionByUserId(userId: string): Promise<Subscription | null> {
    return await this.subscriptionRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async upgradeSubscription(subscriptionId: string, newTier: SubscriptionTier): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({ where: { id: subscriptionId } });

    if (!subscription) {
      throw new AppError(404, 'Subscription not found');
    }

    subscription.tier = newTier;
    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.currentPeriodStart = new Date();
    subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return await this.subscriptionRepository.save(subscription);
  }

  async cancelSubscription(subscriptionId: string, reason?: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({ where: { id: subscriptionId } });

    if (!subscription) {
      throw new AppError(404, 'Subscription not found');
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.cancelledAt = new Date();
    if (reason) {
      subscription.cancelReason = reason;
    }

    return await this.subscriptionRepository.save(subscription);
  }

  async renewSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({ where: { id: subscriptionId } });

    if (!subscription) {
      throw new AppError(404, 'Subscription not found');
    }

    subscription.currentPeriodStart = subscription.currentPeriodEnd;
    subscription.currentPeriodEnd = new Date(subscription.currentPeriodEnd!.getTime() + 30 * 24 * 60 * 60 * 1000);
    subscription.status = SubscriptionStatus.ACTIVE;

    return await this.subscriptionRepository.save(subscription);
  }

  async getActiveSubscriptions(): Promise<Subscription[]> {
    return await this.subscriptionRepository.find({
      where: { status: SubscriptionStatus.ACTIVE },
    });
  }

  async handleWebhookEvent(eventType: string, data: any): Promise<void> {
    switch (eventType) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        // Handle Stripe webhook events
        console.log('Processing subscription webhook:', eventType, data);
        break;
      case 'invoice.payment_succeeded':
        // Handle successful payment
        console.log('Payment succeeded:', data);
        break;
      case 'invoice.payment_failed':
        // Handle failed payment
        console.log('Payment failed:', data);
        break;
      default:
        console.log('Unhandled webhook event:', eventType);
    }
  }
}

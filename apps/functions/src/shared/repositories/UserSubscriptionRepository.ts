import {
    CreateUserSubscriptionDTO,
    UpdateUserSubscriptionDTO,
    UserSubscriptionDocument,
} from '@akademiasaas/shared';

export interface UserSubscriptionRepository {
    create(dto: CreateUserSubscriptionDTO): Promise<UserSubscriptionDocument>;
    update(id: string, dto: UpdateUserSubscriptionDTO): Promise<UserSubscriptionDocument>;
    delete(id: string): Promise<void>;
    getById(id: string): Promise<UserSubscriptionDocument | null>;
    getByUserId(userId: string): Promise<UserSubscriptionDocument[]>;
    getActiveSubscriptionsForUser(userId: string): Promise<UserSubscriptionDocument[]>;
    getUpcomingRenewals(days: number): Promise<UserSubscriptionDocument[]>;
}

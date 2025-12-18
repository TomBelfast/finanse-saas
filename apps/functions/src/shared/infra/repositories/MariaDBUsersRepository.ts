import { Pool, RowDataPacket } from 'mysql2/promise';
import { UsersRepository } from '../../domain/repositories/UsersRepository';
import { UserDocument, BaseOrder } from '@akademiasaas/shared';
import Stripe from 'stripe';
import { StripeInvoiceWithId } from 'shared/models/stripe';
import { getDatabasePool } from '../database';

interface Dependencies {
  pool: Pool;
}

/**
 * Database row type for users table
 */
interface UserRow extends RowDataPacket {
  uid: string;
  email: string | null;
  contact_email: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  mobile_fcm_tokens: string | null;
  web_fcm_tokens: string | null;
  terms_and_policy_accept_date: Date | null;
  terms_and_privacy_policy: number;
  stripe_customer_id: string | null;
  country: string | null;
  features: string | null;
  ip: string | null;
  subscription: string | null;
  lang: string | null;
  timezone: string | null;
  invoice_data: string | null;
  phone_number: string | null;
  default_currency: string | null;
  onboarding: string | null;
  created_at: Date;
  updated_at: Date;
}

export class MariaDBUsersRepository implements UsersRepository {
  constructor(private dependencies: Dependencies) { }

  private parseJSONField<T>(field: string | null): T | null {
    if (!field) return null;
    try {
      return JSON.parse(field) as T;
    } catch {
      return null;
    }
  }

  private formatJSONField<T>(field: T | null | undefined): string | null {
    if (field === null || field === undefined) return null;
    return JSON.stringify(field);
  }

  private mapRowToUserDocument(row: UserRow): UserDocument {
    return {
      uid: row.uid,
      email: row.email || '',
      contactEmail: row.contact_email || '',
      firstName: row.first_name,
      lastName: row.last_name,
      avatarUrl: this.parseJSONField<string[]>(row.avatar_url),
      mobileFcmTokens: this.parseJSONField<string[]>(row.mobile_fcm_tokens),
      webFcmTokens: this.parseJSONField<string[]>(row.web_fcm_tokens),
      termsAndPolicyAcceptDate: row.terms_and_policy_accept_date ? new Date(row.terms_and_policy_accept_date) : null,
      termsAndPrivacyPolicy: Boolean(row.terms_and_privacy_policy),
      stripeCustomerId: row.stripe_customer_id || undefined,
      country: row.country || undefined,
      features: this.parseJSONField<string[]>(row.features) || [],
      ip: row.ip,
      subscription: this.parseJSONField(row.subscription),
      lang: row.lang || undefined,
      timezone: row.timezone || undefined,
      invoiceData: this.parseJSONField(row.invoice_data) || undefined,
      phoneNumber: row.phone_number || undefined,
      defaultCurrency: row.default_currency || undefined,
      onboarding: this.parseJSONField(row.onboarding) || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  public async findUserById(userId: string): Promise<UserDocument | null> {
    const [rows] = await this.dependencies.pool.execute<UserRow[]>(
      'SELECT * FROM users WHERE uid = ?',
      [userId]
    );
    if (rows.length === 0) return null;
    return this.mapRowToUserDocument(rows[0]);
  }

  public async findUserBySlug(slug: string): Promise<UserDocument | null> {
    const [rows] = await this.dependencies.pool.execute<UserRow[]>(
      `SELECT * FROM users WHERE JSON_EXTRACT(onboarding, '$.salesPageSettings.slug') = ?`,
      [slug]
    );
    if (rows.length === 0) return null;
    if (rows.length > 1) {
      throw new Error(`More than one user has the same slug ${slug}`);
    }
    return this.mapRowToUserDocument(rows[0]);
  }

  public async findUserByDomain(domain: string): Promise<UserDocument | null> {
    const [rows] = await this.dependencies.pool.execute<UserRow[]>(
      `SELECT * FROM users WHERE JSON_CONTAINS(JSON_EXTRACT(onboarding, '$.salesPageSettings.domains'), ?)`,
      [JSON.stringify(domain)]
    );
    if (rows.length === 0) return null;
    if (rows.length > 1) {
      throw new Error(`More than one user has the same domain ${domain}`);
    }
    return this.mapRowToUserDocument(rows[0]);
  }

  public async findUserByEmail(email: string): Promise<UserDocument | null> {
    const [rows] = await this.dependencies.pool.execute<UserRow[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    if (rows.length === 0) return null;
    return this.mapRowToUserDocument(rows[0]);
  }

  public async createUser(userData: UserDocument): Promise<void> {
    await this.dependencies.pool.execute(
      `INSERT INTO users (
        uid, email, contact_email, first_name, last_name, avatar_url,
        mobile_fcm_tokens, web_fcm_tokens, terms_and_policy_accept_date,
        terms_and_privacy_policy, stripe_customer_id, country, features,
        ip, subscription, lang, timezone, invoice_data, phone_number,
        default_currency, onboarding, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        userData.uid,
        userData.email,
        userData.contactEmail,
        userData.firstName,
        userData.lastName,
        this.formatJSONField(userData.avatarUrl),
        this.formatJSONField(userData.mobileFcmTokens),
        this.formatJSONField(userData.webFcmTokens),
        userData.termsAndPolicyAcceptDate,
        userData.termsAndPrivacyPolicy,
        userData.stripeCustomerId,
        userData.country,
        this.formatJSONField(userData.features),
        userData.ip,
        this.formatJSONField(userData.subscription),
        userData.lang,
        userData.timezone,
        this.formatJSONField(userData.invoiceData),
        userData.phoneNumber,
        userData.defaultCurrency,
        this.formatJSONField(userData.onboarding),
      ]
    );
  }

  public async updateUser(userId: string, data: Partial<UserDocument>): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.email !== undefined) {
      fields.push('email = ?');
      values.push(data.email);
    }
    if (data.contactEmail !== undefined) {
      fields.push('contact_email = ?');
      values.push(data.contactEmail);
    }
    if (data.firstName !== undefined) {
      fields.push('first_name = ?');
      values.push(data.firstName);
    }
    if (data.lastName !== undefined) {
      fields.push('last_name = ?');
      values.push(data.lastName);
    }
    if (data.avatarUrl !== undefined) {
      fields.push('avatar_url = ?');
      values.push(this.formatJSONField(data.avatarUrl));
    }
    if (data.mobileFcmTokens !== undefined) {
      fields.push('mobile_fcm_tokens = ?');
      values.push(this.formatJSONField(data.mobileFcmTokens));
    }
    if (data.webFcmTokens !== undefined) {
      fields.push('web_fcm_tokens = ?');
      values.push(this.formatJSONField(data.webFcmTokens));
    }
    if (data.termsAndPolicyAcceptDate !== undefined) {
      fields.push('terms_and_policy_accept_date = ?');
      values.push(data.termsAndPolicyAcceptDate);
    }
    if (data.termsAndPrivacyPolicy !== undefined) {
      fields.push('terms_and_privacy_policy = ?');
      values.push(data.termsAndPrivacyPolicy);
    }
    if (data.stripeCustomerId !== undefined) {
      fields.push('stripe_customer_id = ?');
      values.push(data.stripeCustomerId);
    }
    if (data.country !== undefined) {
      fields.push('country = ?');
      values.push(data.country);
    }
    if (data.features !== undefined) {
      fields.push('features = ?');
      values.push(this.formatJSONField(data.features));
    }
    if (data.ip !== undefined) {
      fields.push('ip = ?');
      values.push(data.ip);
    }
    if (data.subscription !== undefined) {
      fields.push('subscription = ?');
      values.push(this.formatJSONField(data.subscription));
    }
    if (data.lang !== undefined) {
      fields.push('lang = ?');
      values.push(data.lang);
    }
    if (data.timezone !== undefined) {
      fields.push('timezone = ?');
      values.push(data.timezone);
    }
    if (data.invoiceData !== undefined) {
      fields.push('invoice_data = ?');
      values.push(this.formatJSONField(data.invoiceData));
    }
    if (data.phoneNumber !== undefined) {
      fields.push('phone_number = ?');
      values.push(data.phoneNumber);
    }
    if (data.defaultCurrency !== undefined) {
      fields.push('default_currency = ?');
      values.push(data.defaultCurrency);
    }
    if (data.onboarding !== undefined) {
      fields.push('onboarding = ?');
      values.push(this.formatJSONField(data.onboarding));
    }

    if (fields.length === 0) return;

    fields.push('updated_at = NOW()');
    values.push(userId);

    await this.dependencies.pool.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE uid = ?`,
      values
    );
  }

  public async updateUserField(userId: string, key: string[], value: unknown): Promise<void> {
    // For nested fields, we'll update the JSON field
    if (key.length > 1) {
      const jsonPath = `$.${key.join('.')}`;
      await this.dependencies.pool.execute(
        `UPDATE users SET onboarding = JSON_SET(COALESCE(onboarding, '{}'), ?, ?), updated_at = NOW() WHERE uid = ?`,
        [jsonPath, JSON.stringify(value), userId]
      );
    } else {
      // Simple field update
      const fieldName = key[0].replace(/([A-Z])/g, '_$1').toLowerCase();
      await this.dependencies.pool.execute(
        `UPDATE users SET ${fieldName} = ?, updated_at = NOW() WHERE uid = ?`,
        [value, userId]
      );
    }
  }

  public async getAllUserIds(): Promise<string[]> {
    const [rows] = await this.dependencies.pool.execute<UserRow[]>('SELECT uid FROM users');
    return rows.map((row) => row.uid);
  }

  public async getAllUsers(): Promise<UserDocument[]> {
    const [rows] = await this.dependencies.pool.execute<UserRow[]>('SELECT * FROM users');
    return rows.map((row) => this.mapRowToUserDocument(row));
  }

  public async getAllCreators(): Promise<UserDocument[]> {
    const [rows] = await this.dependencies.pool.execute<UserRow[]>(
      `SELECT * FROM users WHERE JSON_CONTAINS(features, ?)`,
      [JSON.stringify('creator')]
    );
    return rows.map((row) => this.mapRowToUserDocument(row));
  }

  public async upsertSubscriptionData(
    userId: string,
    subscriptionId: string,
    subscription: Stripe.Subscription
  ): Promise<void> {
    // This would need a separate table for Stripe subscriptions
    // For now, we'll store it in a JSON field or create a separate table
    await this.dependencies.pool.execute(
      `INSERT INTO user_subscriptions (id, user_id, name, amount, currency, period_start, period_end, renewal_date, provider, status, is_automatic_renewal, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         amount = VALUES(amount),
         currency = VALUES(currency),
         period_start = VALUES(period_start),
         period_end = VALUES(period_end),
         renewal_date = VALUES(renewal_date),
         provider = VALUES(provider),
         status = VALUES(status),
         is_automatic_renewal = VALUES(is_automatic_renewal),
         description = VALUES(description),
         updated_at = NOW()`,
      [
        subscriptionId,
        userId,
        subscription.items.data[0]?.price.nickname || 'Subscription',
        subscription.items.data[0]?.price.unit_amount ? subscription.items.data[0].price.unit_amount / 100 : 0,
        subscription.currency.toUpperCase(),
        subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : new Date(),
        subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : new Date(),
        subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : new Date(),
        'stripe',
        subscription.status === 'active' ? 'active' : 'inactive',
        !subscription.cancel_at_period_end,
        JSON.stringify(subscription),
      ]
    );
  }

  public async addSubscriptionInvoice(userId: string, invoice: StripeInvoiceWithId): Promise<void> {
    // This would need a separate invoices table
    // For now, storing in a JSON field in user_subscriptions or creating a new table
    // Implementation depends on your schema
  }

  public async findSubscriptionInvoice(
    userId: string,
    invoiceId: string
  ): Promise<StripeInvoiceWithId | null> {
    // Implementation depends on your schema
    return null;
  }

  public async updateSubscriptionInvoice(
    userId: string,
    invoiceId: string,
    invoice: Partial<Stripe.Invoice & { connectedInvoice: BaseOrder['connectedInvoice'] }>
  ): Promise<void> {
    // Implementation depends on your schema
  }

  public async getAllActiveSalesPages(): Promise<UserDocument[]> {
    const [rows] = await this.dependencies.pool.execute<UserRow[]>(
      `SELECT * FROM users WHERE JSON_EXTRACT(onboarding, '$.salesPageSettings.active') = true`
    );
    return rows.map((row) => this.mapRowToUserDocument(row));
  }
}


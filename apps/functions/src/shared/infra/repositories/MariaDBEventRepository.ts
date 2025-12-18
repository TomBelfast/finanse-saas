import { Pool, RowDataPacket } from 'mysql2/promise';
import { BusinessEvent } from '@akademiasaas/shared';

interface Dependencies {
    pool: Pool;
}

interface EventRow extends RowDataPacket {
    event_id: string;
    event_name: string;
    event_domain: string;
    revision: number | null;
    timestamp: Date;
    metadata: string | null;
    payload: string;
    created_at: Date;
}

export class MariaDBEventRepository {
    constructor(private dependencies: Dependencies) { }

    async save(event: BusinessEvent): Promise<void> {
        const metadataJson = event.metadata ? JSON.stringify(event.metadata) : null;
        const payloadJson = JSON.stringify(event.payload);

        await this.dependencies.pool.execute(
            `INSERT INTO events (
        event_id, event_name, event_domain, revision, timestamp, metadata, payload, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                event.eventId,
                event.eventName,
                event.eventDomain,
                event.revision,
                event.timestamp,
                metadataJson,
                payloadJson
            ]
        );
    }

    async getEventsByDomain(domain: string, limit: number = 100): Promise<BusinessEvent[]> {
        const [rows] = await this.dependencies.pool.execute<EventRow[]>(
            'SELECT * FROM events WHERE event_domain = ? ORDER BY timestamp DESC LIMIT ?',
            [domain, limit]
        );

        return rows.map(this.mapRowToEvent);
    }

    // Not checking exact type mapping here as BusinessEvent is a union. 
    // We return a generic structure compatible with BusinessEventMetadata & payload.
    private mapRowToEvent(row: EventRow): any {
        return {
            eventId: row.event_id,
            eventName: row.event_name,
            eventDomain: row.event_domain,
            revision: row.revision,
            timestamp: row.timestamp,
            metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
            payload: JSON.parse(row.payload),
        };
    }
}

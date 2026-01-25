declare module '@rails/actioncable' {
    export function createConsumer(url?: string): Consumer;

    export interface Consumer {
        subscriptions: Subscriptions;
        disconnect(): void;
    }

    export interface Subscriptions {
        create(channel: string | object, mixin: object): Subscription;
    }

    export interface Subscription {
        unsubscribe(): void;
    }
}

declare namespace NodeJS {
    interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production' | 'test';
        readonly __buildDate: string;
        readonly __buildVersion?: string;
    }
}

// a simple server config
export interface APIConfig {
  serverPort: number;
}

const config: APIConfig = {
  // In the future, place other config values here. Like data store connection strings, etc...
  serverPort: parseInt(process.env.SERVER_PORT || '8080', 10),
};

export default config;

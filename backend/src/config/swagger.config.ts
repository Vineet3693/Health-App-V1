import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import appConfig from './app.config';

let swaggerDocument;

try {
  swaggerDocument = YAML.load(path.join(__dirname, '../../docs/api/openapi.yaml'));
} catch (error) {
  swaggerDocument = {
    openapi: '3.0.0',
    info: {
      title: 'Health App API',
      version: '1.0.0',
      description: 'Comprehensive Health & Wellness Application API',
    },
    servers: [
      {
        url: `http://localhost:${appConfig.app.port}/api/${appConfig.app.apiVersion}`,
        description: 'Development server',
      },
    ],
  };
}

export const swaggerSpec = swaggerDocument;
export const swaggerUiOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Health App API Docs',
};

export default swaggerUi;

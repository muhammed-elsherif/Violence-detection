import { Injectable } from '@nestjs/common';

@Injectable()
export class AiModelService {
    getAllModels() {
        return [
          {
            id: 1,
            name: 'Fire Detection',
            type: 'CV',
            description: 'Detect fire incidents in real-time video feed.',
            endpoint: '/api/models/fire-detection',
            createdAt: new Date(),
          },
          {
            id: 2,
            name: 'Sentiment Analyzer',
            type: 'NLP',
            description: 'Analyze text sentiment (positive, negative, neutral).',
            endpoint: '/api/models/sentiment',
            createdAt: new Date(),
          },
        ];
      }
}

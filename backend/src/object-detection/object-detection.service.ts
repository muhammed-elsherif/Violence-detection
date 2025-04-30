/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";

@Injectable()
export class ObjectDetectionService {
    getObjectDetection() {
        return {
        label: 'person',
        confidence: 0.98,
        type: 'human',
        };
    }
}

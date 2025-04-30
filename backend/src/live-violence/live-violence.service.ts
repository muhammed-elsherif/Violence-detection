/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";

@Injectable()
export class LiveViolenceService {
    getLiveViolenceDetection() {
        return {
            label: 'violence',
            confidence: 0.93,
            type: 'fighting',
        };
    }
}

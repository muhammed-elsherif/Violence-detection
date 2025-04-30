/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";

@Injectable()
export class GunDetectionService {
    getGunDetection() {
        return {
            label: "gun",
            confidence: 0.95,
            type: "firearm",
        };
    }
}

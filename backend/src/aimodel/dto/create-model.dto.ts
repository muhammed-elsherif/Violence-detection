export class CreateModelDto {
  name: string;
  type: "CV" | "NLP";
  description: string;
  endpoint: string;
}

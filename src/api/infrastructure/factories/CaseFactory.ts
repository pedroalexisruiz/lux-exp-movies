import { toCamelCaseKeys } from '../../../utils/caseParser';

export class CaseFactory {
  static fromApi<TInput, TOutput = TInput>(data: TInput): TOutput {
    return toCamelCaseKeys(data) as unknown as TOutput;
  }
}

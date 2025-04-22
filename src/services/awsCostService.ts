import { CostExplorerClient, GetCostAndUsageCommand } from "@aws-sdk/client-cost-explorer";
import { CostData, DateRange } from '../types';
import { getCurrentMonthlyRange } from '../utils/dateUtils';

export class AwsCostService {
  private client: CostExplorerClient;

  constructor(region: string = "ap-northeast-1") {
    this.client = new CostExplorerClient({ region });
  }

  async getCost(dateRange?: DateRange): Promise<CostData> {
    const { start, end } = dateRange || getCurrentMonthlyRange();
    
    const command = new GetCostAndUsageCommand({
      TimePeriod: { Start: start, End: end },
      Granularity: "MONTHLY",
      Metrics: ["UnblendedCost"],
      GroupBy: [
        { Type: "DIMENSION", Key: "SERVICE" }
      ]
    });

    const response = await this.client.send(command);
    let totalCost = 0;
    const groups = [];

    if (response.ResultsByTime) {
      for (const result of response.ResultsByTime) {
        if (result.Total && result.Total["UnblendedCost"]) {
          totalCost += parseFloat(result.Total["UnblendedCost"].Amount || "0");
        }
        if (result.Groups) {
          for (const group of result.Groups) {
            const amount = parseFloat(
              group.Metrics?.UnblendedCost?.Amount ?? "0"
            );
            groups.push({ keys: group.Keys || [], amount });
          }
        }
      }
    }

    return {
      timePeriod: { start, end },
      totalCost,
      groups
    };
  }
} 
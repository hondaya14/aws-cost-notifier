export interface DateRange {
  start: string;
  end: string;
}

export interface CostGroup {
  keys: string[];
  amount: number;
}

export interface CostData {
  timePeriod: DateRange;
  totalCost: number;
  groups: CostGroup[];
}

export interface DiscordConfig {
  channelId: string;
  botToken: string;
}

export interface AwsConfig {
  region: string;
} 
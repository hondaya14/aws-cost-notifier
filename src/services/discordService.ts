import { CostData } from '../types';

export class DiscordService {
  private channelId: string;
  private botToken: string;

  constructor(channelId: string, botToken: string) {
    if (!channelId || !botToken) {
      throw new Error("DiscordのチャンネルIDまたはBotトークンが設定されていません。");
    }
    this.channelId = channelId;
    this.botToken = botToken;
  }

  private formatMessage(costData: CostData): string {
    let message = `:moneybag:**AWS Cost Report (${costData.timePeriod.start} ~ ${costData.timePeriod.end})**\n`;
    message += `総UnblendedCost: $${costData.totalCost.toFixed(2)}\n`;
    message += "【 Service: Cost[USD] 】\n";
    costData.groups.forEach(group => {
      message += `- ${group.keys[0]}: $${group.amount.toFixed(2)}\n`;
    });
    return message;
  }

  async sendMessage(message: string): Promise<void> {
    const url = `https://discord.com/api/channels/${this.channelId}/messages`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bot ${this.botToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content: message })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Discord通知失敗: ${response.status} ${errorText}`);
    }
  }

  async sendCostReport(costData: CostData): Promise<void> {
    const message = this.formatMessage(costData);
    await this.sendMessage(message);
  }
} 
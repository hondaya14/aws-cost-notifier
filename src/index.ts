import 'dotenv/config';
import { AwsCostService } from './services/awsCostService';
import { DiscordService } from './services/discordService';

async function main() {
  try {
    const awsRegion = process.env.AWS_REGION || "ap-northeast-1";
    const discordChannelId = process.env.DISCORD_CHANNEL_ID;
    const discordBotToken = process.env.DISCORD_BOT_TOKEN;

    if (!discordChannelId || !discordBotToken) {
      throw new Error("必要な環境変数が設定されていません。");
    }

    const awsCostService = new AwsCostService(awsRegion);
    const discordService = new DiscordService(discordChannelId, discordBotToken);

    console.log("AWSコスト取得中...");
    const costData = await awsCostService.getCost();
    
    console.log("Discordへ通知中...");
    await discordService.sendCostReport(costData);
    
    console.log("処理が正常に完了しました。");
  } catch (error) {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  }
}

main(); 
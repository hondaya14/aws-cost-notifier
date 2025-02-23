const { CostExplorerClient, GetCostAndUsageCommand } = require("@aws-sdk/client-cost-explorer");


function getCurrentMonthlyRange() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 9);
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  function formatDate(date) {
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }
  console.log({ start: formatDate(startDate), end: formatDate(endDate) });
  return { start: formatDate(startDate), end: formatDate(endDate) };
}

async function getAwsCost() {
  const { start, end } = getCurrentMonthlyRange();
  const client = new CostExplorerClient({ region: process.env.AWS_REGION || "ap-northeast-1" });
  const command = new GetCostAndUsageCommand({
    TimePeriod: { Start: start, End: end },
    Granularity: "MONTHLY",
    Metrics: ["UnblendedCost"],
    GroupBy: [
      { Type: "DIMENSION", Key: "SERVICE" }
    ]
  });
  const response = await client.send(command);
  let totalCost = 0;
  const groups = [];
  if (response.ResultsByTime) {
    for (const result of response.ResultsByTime) {
      console.log(result);
      if (result.Total && result.Total["UnblendedCost"]) {
        totalCost += parseFloat(result.Total["UnblendedCost"].Amount || "0");
      }
      if (result.Groups) {
        for (const group of result.Groups) {
          const amount = parseFloat(
            (group.Metrics && group.Metrics.UnblendedCost ? group.Metrics.UnblendedCost.Amount : "0")
          );
          groups.push({ keys: group.Keys || [], amount });
        }
      }
    }
  }
  return { timePeriod: { Start: start, End: end }, totalCost, groups };
}

async function notifyDiscord(message) {
  const channelId = process.env.DISCORD_CHANNEL_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!channelId || !botToken) {
    throw new Error("DiscordのチャンネルIDまたはBotトークンが環境変数に設定されていません。");
  }
  const url = `https://discord.com/api/channels/${channelId}/messages`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bot ${botToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ content: message })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Discord通知失敗: ${response.status} ${errorText}`);
  }
}

async function main() {
  try {
    const costData = await getAwsCost();
    let message = `:moneybag:**AWS Cost Report (${costData.timePeriod.Start} ~ ${costData.timePeriod.End})**\n`;
    message += `総UnblendedCost: $${costData.totalCost.toFixed(2)}\n`;
    message += "【 Service: Cont[USD] 】\n";
    costData.groups.forEach(group => {
      message += `- ${group.keys[0]}: $${group.amount.toFixed(2)}\n`;
    });
    console.log("Discordへ通知中...");
    await notifyDiscord(message);
    console.log("Discordへの通知に成功しました。");
  } catch (error) {
    console.error("エラー発生:", error);
    process.exit(1);
  }
}

main();

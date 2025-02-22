

# curl command

## How to get cost group by dimenstion service
```shell
aws ce get-cost-and-usage \                                                                                       
    --time-period Start=2025-01-01,End=2025-01-31 \
    --granularity MONTHLY \
    --metrics "UnblendedCost" --group-by Type=DIMENSION,Key=SERVICE Type=TAG,Key=Environment
```

## How to notify discord channel
```shell
curl -X POST "https://discord.com/api/channels/${DISCORD_CHANNEL_ID}/messages" \ 
-H "Authorization: Bot ${DISCORD_BOT_TOKEN}" \
-H "Content-Type: application/json" \
-d '{"content": "Hello world!!!"}'

```


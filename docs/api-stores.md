# API: `/stores`

**Method:** `GET`
**URL:** `https://white-tiger.play.eco/api/v1/plugins/EcoPriceCalculator/stores`
**JS helper:** `WhiteTigerAPI.fetchStores()`

## Response shape

```json
{
  "Stores": [
    {
      "Name":         "string",
      "Owner":        "string",
      "Enabled":      true,
      "CurrencyName": "Euro",
      "Balance":      1234.56,
      "AllOffers": [
        {
          "Buying":        false,
          "ItemName":      "string",
          "Price":         10.0,
          "Quantity":      50,
          "MaxNumWanted":  0,
          "MinDurability": -1
        }
      ]
    }
  ]
}
```

## Fields

| Field | Type | Notes |
|-------|------|-------|
| `Stores` | array | Top-level array of all stores. |
| `Name` | string | Store name (may contain Eco `<color>` tags). |
| `Owner` | string | Player who owns the store. |
| `Enabled` | boolean | `false` = store is closed; exclude from calculations. |
| `CurrencyName` | string | Currency used. Typically filter for `"Euro"`. |
| `Balance` | number | Cash the store can spend (limits how many units buyers can afford). |
| `AllOffers` | array | All active buy and sell offers. |
| `Buying` | boolean | `true` = store is buying (buy order); `false` = store is selling (sell order). |
| `ItemName` | string | Display name of the item. |
| `Price` | number | Price per unit in the store's currency. |
| `Quantity` | number | Units available (sell orders). Ignored for buy orders. |
| `MaxNumWanted` | number | Max units the store will buy (buy orders). Ignored for sell orders. |
| `MinDurability` | number | Minimum durability required. `-1` = no requirement. |

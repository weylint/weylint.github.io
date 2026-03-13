# API: `/allItems`

**Method:** `GET`
**URL:** `https://white-tiger.play.eco/api/v1/plugins/EcoPriceCalculator/allItems`
**JS helper:** `WhiteTigerAPI.fetchAllItems()`

## Response shape

```json
{
  "AllItems": {
    "<DisplayName>": {
      "Tags": ["string"],
      "Fuel": 0.0,
      "PropertyInfos": {
        "Weight":       { "Int32": "100" },
        "HasWeight":    { "Boolean": "True" },
        "MaxStackSize": { "Int32": "20" },
        "IsCarried":    { "Boolean": "False" },
        "DisplayName":  { "LocString": "string" },
        "Hidden":       { "Boolean": "False" }
      }
    }
  }
}
```

## Fields

| Field | Type | Notes |
|-------|------|-------|
| `AllItems` | object | Items keyed by display name. `PropertyInfos` values are typed wrappers — extract via the inner key (`Int32`, `Boolean`, `LocString`, etc.). |
| `PropertyInfos.Weight.Int32` | string→number | Item weight in **grams**. Convert to kg: `/ 1000`. |
| `PropertyInfos.HasWeight.Boolean` | string | `"False"` = weightless item; `Weight` will be `"0"`. |
| `PropertyInfos.MaxStackSize.Int32` | string→number | Max units per inventory slot. Always ≥ 1. |
| `PropertyInfos.IsCarried.Boolean` | string | `"True"` = item uses the player's hands slot (1 slot, no weight limit). `"False"` = goes in backpack or vehicle. |

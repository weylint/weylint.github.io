# API: `/craftingTables`

**Method:** `GET`
**URL:** `https://white-tiger.play.eco/api/v1/plugins/EcoPriceCalculator/craftingTables`
**JS helper:** `WhiteTigerAPI.fetchCraftingTables()`

## Response shape

```json
{
  "CraftingTables": [
    {
      "TableName":               "Workbench",
      "ResourceEfficiencyModule": null,
      "OwnerName":               "SomePlayer",
      "AllowedUpgrades":         ["Basic Upgrade"],
      "ModuleSkillType":         null,
      "ModuleLevel":             0,
      "GenericMultiplier":       1.0,
      "SkillMultiplier":         1.0
    },
    {
      "TableName":               "Rocker Box",
      "ResourceEfficiencyModule": "Mining Basic Upgrade",
      "OwnerName":               "SomePlayer",
      "AllowedUpgrades":         ["Mining Basic Upgrade", "Basic Upgrade"],
      "ModuleSkillType":         "Mining",
      "ModuleLevel":             2,
      "GenericMultiplier":       0.8,
      "SkillMultiplier":         0.75
    }
  ]
}
```

## Fields

| Field | Type | Notes |
|-------|------|-------|
| `CraftingTables` | array | Top-level array — one entry per crafting table instance in the world. |
| `TableName` | string | Display name of the crafting table (e.g. `"Workbench"`, `"Blast Furnace"`). Multiple entries with the same name are separate physical tables. |
| `ResourceEfficiencyModule` | string \| null | Installed upgrade module name. `null` when no module is installed (`SkillMultiplier === 1.0`). Generic names like `"Basic Upgrade 2"` for mid-tier tables; skill-specific names like `"Mining Basic Upgrade"` for max-tier (0.75) tables. |
| `OwnerName` | string \| null | Player or legal person who owns the table. May be `null` for unowned tables. |
| `AllowedUpgrades` | string[] | Upgrade modules compatible with this table. Always contains exactly one of `"Basic Upgrade"`, `"Advanced Upgrade"`, or `"Modern Upgrade"` — use this to determine upgrade tier when `ResourceEfficiencyModule` does not include the tier in its name. |
| `ModuleSkillType` | string \| null | Profession the installed module belongs to (e.g. `"Mining"`, `"Farming"`). Only populated when `SkillMultiplier === 0.75`; `null` otherwise. |
| `ModuleLevel` | number | Internal level of the module. `0` = no module; `2` = module installed. |
| `GenericMultiplier` | number | Base resource efficiency multiplier from the module tier alone (before skill bonus). |
| `SkillMultiplier` | number | Effective resource efficiency multiplier after skill bonus. Lower is better — `0.75` is the best achievable. Possible values: `1.0`, `0.95`, `0.90`, `0.85`, `0.80`, `0.75`. |

## Notes

- `SkillMultiplier` is the value that matters for crafting cost calculations. A table at `0.75` uses 25% fewer resources than one at `1.0`.
- `SkillMultiplier === 0.75` only occurs when a skill-specific module is installed **and** the owner has the matching profession skill — the skill bonus brings `GenericMultiplier` 0.80 down to 0.75.
- To classify upgrade tier when `ResourceEfficiencyModule` does not contain "Basic", "Advanced", or "Modern" in its name, check `AllowedUpgrades` for the generic tier string.

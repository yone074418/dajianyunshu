# Day34 GLB 导出与贴图压缩验收记录

> 任务：第34天：导出 GLB 并压缩贴图  
> 执行日期：2026-06-28  
> 执行范围：AR-001 至 AR-019 已有且允许处理资产的 GLB 导出、格式转换检查、贴图压缩检查和预算核对  
> 执行边界：本日不新增 G1 外资产类别，不补做 Day32 工具资产，不接入三维场景，不修改应用源码，不连接 Supabase，不安装新依赖，不创建 PR，不执行 Day35 或后续任务。  
> 资产声明：当前已发现 OBJ 与本日导出的 GLB 均为项目自制简单几何占位资产，不代表正式美术资产，不代表商业授权已经取得，也不代表最终浏览器加载资产已经验收。

## 1. 已检查文档

| 文档 | 检查目的 | Day34 采用结论 |
|---|---|---|
| `大件运输虚拟仿真实验教学系统_单人复刻126天计划.md` | 核对 Day34 任务目标和禁止提前执行 Day35 之后任务 | Day34 只处理已有资产的导出、贴图检查和记录，不做周资产审查 |
| `docs/G1资产需求基线.md` | 核对 AR-001 至 AR-019 冻结资产类别 | 覆盖 AR-001 至 AR-019，不新增 G1 外类别 |
| `docs/G1需求冻结评审记录.md` | 核对 G1 冻结范围和资产未冻结边界 | G1 不代表资产已取得、授权、制作或模型文件验收完成 |
| `docs/Day29资产采购制作与许可执行清单.md` | 核对目标格式、目标大小、面数预算、贴图预算、命名规范和许可口径 | 沿用 Day29 的正式 GLB 命名、大小预算、面数预算和贴图预算 |
| `docs/Day30货物牵引车挂车低模资产准备记录.md` | 核对 AR-001 至 AR-004 已有 OBJ 占位文件 | AR-001 至 AR-004 可在 Day34 导出为基础 GLB 占位资产 |
| `docs/Day31道路坡道弯道桥梁限高低模资产准备记录.md` | 核对 AR-006 至 AR-011 已有 OBJ 占位文件 | AR-006 至 AR-011 可在 Day34 导出为基础 GLB 占位资产 |
| `docs/Day33坐标比例原点材质命名统一检查记录.md` | 核对已有资产结构、坐标轴、比例、原点、材质和命名问题 | 继承 Day33 对 OBJ 基础结构、Y/Z 轴向风险、无材质声明和缺失资产的检查结果 |
| Day32 资产准备记录 | 查找工具资产准备记录 | 仓库中未发现 Day32 资产准备记录文件；本日不补做 AR-012 至 AR-017 工具资产 |
| `docs/范围排除清单与变更流程.md` | 核对版权、许可、范围变更和 CR 处理要求 | 未发现需要新增、删除或调整 G1 资产类别的情况；CR 列表为空 |

## 2. 已检查资产目录与导出方式

| 检查项 | 检查结果 |
|---|---|
| `heavy-transport-sim/public/models/day30` | 发现 AR-001 至 AR-004 的项目自制 OBJ 占位资产，共 8 个文件 |
| `heavy-transport-sim/public/models/day31` | 发现 AR-006 至 AR-011 的项目自制 OBJ 占位资产，共 9 个文件 |
| `heavy-transport-sim/public/models/day34` | 本日新建 17 个 GLB，占位导出结果均来自 Day30/Day31 已有 OBJ |
| `heavy-transport-sim/public/models` | 未发现 AR-005、AR-012 至 AR-019 的 OBJ/GLTF/GLB/Blend/FBX 源资产文件 |
| `heavy-transport-sim/src/assets` | 发现 `hero.png`、`react.svg`、`vite.svg`；未发现 AR-001 至 AR-019 命名贴图或教学示意资源 |
| 导出方式 | 使用本地 Node 运行时的临时内联转换脚本读取 OBJ 顶点/面并写出 glTF 2.0 GLB；未新增脚本文件，未安装新依赖 |
| 导出边界 | 仅转换几何网格、索引、节点和 mesh；不生成贴图、材质图集、动画、碰撞体或应用接入 |
| 贴图压缩结论 | 未实际压缩贴图。原因：未发现 AR 命名贴图文件，且本日不凭空创建贴图 |

## 3. 已导出 GLB 文件与预算核对

| AR | 源文件 | GLB 输出路径 | 源文件大小 | GLB 大小 | Day29 目标大小 | 大小预算结论 |
|---|---|---|---:|---:|---|---|
| AR-001 | `heavy-transport-sim/public/models/day30/asset_ar001_cargo_main_v001_placeholder.obj` | `heavy-transport-sim/public/models/day34/asset_ar001_cargo_main_v001.glb` | 1042 B | 1212 B | 2 MB 以内 | 符合 |
| AR-002 | `heavy-transport-sim/public/models/day30/asset_ar002_tractor_6x6_v001_placeholder.obj` | `heavy-transport-sim/public/models/day34/asset_ar002_tractor_6x6_v001.glb` | 1306 B | 1400 B | 每辆 3 MB 以内 | 符合 |
| AR-002 | `heavy-transport-sim/public/models/day30/asset_ar002_tractor_8x8_v001_placeholder.obj` | `heavy-transport-sim/public/models/day34/asset_ar002_tractor_8x8_v001.glb` | 1506 B | 1520 B | 每辆 3 MB 以内 | 符合 |
| AR-003 | `heavy-transport-sim/public/models/day30/asset_ar003_trailer_full_v001_placeholder.obj` | `heavy-transport-sim/public/models/day34/asset_ar003_trailer_full_v001.glb` | 895 B | 1156 B | 每类 2.5 MB 以内 | 符合 |
| AR-003 | `heavy-transport-sim/public/models/day30/asset_ar003_trailer_semi_v001_placeholder.obj` | `heavy-transport-sim/public/models/day34/asset_ar003_trailer_semi_v001.glb` | 805 B | 1096 B | 每类 2.5 MB 以内 | 符合 |
| AR-003 | `heavy-transport-sim/public/models/day30/asset_ar003_spmt_v001_placeholder.obj` | `heavy-transport-sim/public/models/day34/asset_ar003_spmt_v001.glb` | 1031 B | 1204 B | 每类 2.5 MB 以内 | 符合 |
| AR-004 | `heavy-transport-sim/public/models/day30/asset_ar004_modtrailer_unit_v001_placeholder.obj` | `heavy-transport-sim/public/models/day34/asset_ar004_modtrailer_unit_v001.glb` | 778 B | 1060 B | 模块单元 1.5 MB 以内 | 符合 |
| AR-004 | `heavy-transport-sim/public/models/day30/asset_ar004_coupler_v001_placeholder.obj` | `heavy-transport-sim/public/models/day34/asset_ar004_coupler_v001.glb` | 947 B | 1192 B | 模块单元 1.5 MB 以内 | 符合 |
| AR-006 | `heavy-transport-sim/public/models/day31/asset_ar006_height_limit_v001_placeholder.obj` | `heavy-transport-sim/public/models/day34/asset_ar006_height_limit_v001.glb` | 565 B | 992 B | 1 MB 以内 | 符合 |
| AR-007 | `heavy-transport-sim/public/models/day31/asset_ar007_arc_curve_v001_placeholder.obj` | `heavy-transport-sim/public/models/day34/asset_ar007_arc_curve_v001.glb` | 596 B | 1036 B | 2 MB 以内 | 符合 |
| AR-008 | `heavy-transport-sim/public/models/day31/asset_ar008_orthogonal_curve_v001_placeholder.obj` | `heavy-transport-sim/public/models/day34/asset_ar008_orthogonal_curve_v001.glb` | 518 B | 972 B | 2 MB 以内 | 符合 |
| AR-009 | `heavy-transport-sim/public/models/day31/asset_ar009_slope_v001_placeholder.obj` | `heavy-transport-sim/public/models/day34/asset_ar009_slope_v001.glb` | 436 B | 896 B | 1.5 MB 以内 | 符合 |
| AR-010 | `heavy-transport-sim/public/models/day31/asset_ar010_bridge_v001_placeholder.obj` | `heavy-transport-sim/public/models/day34/asset_ar010_bridge_v001.glb` | 648 B | 1088 B | 3 MB 以内 | 符合 |
| AR-010 | `heavy-transport-sim/public/models/day31/asset_ar010_load_sign_v001_placeholder.obj` | `heavy-transport-sim/public/models/day34/asset_ar010_load_sign_v001.glb` | 402 B | 868 B | 3 MB 以内或限载牌单独 512x512 贴图 | 符合 |
| AR-011 | `heavy-transport-sim/public/models/day31/asset_ar011_route_a_v001_placeholder.obj` | `heavy-transport-sim/public/models/day34/asset_ar011_route_a_v001.glb` | 622 B | 1044 B | 单路线 4 MB 以内 | 符合 |
| AR-011 | `heavy-transport-sim/public/models/day31/asset_ar011_route_b_v001_placeholder.obj` | `heavy-transport-sim/public/models/day34/asset_ar011_route_b_v001.glb` | 608 B | 1044 B | 单路线 4 MB 以内 | 符合 |
| AR-011 | `heavy-transport-sim/public/models/day31/asset_ar011_route_c_v001_placeholder.obj` | `heavy-transport-sim/public/models/day34/asset_ar011_route_c_v001.glb` | 604 B | 1040 B | 单路线 4 MB 以内 | 符合 |

## 4. AR-001 至 AR-019 导出与贴图压缩检查结果

| 资产编号 | 资产名称 | 源文件路径 | 源文件格式 | 目标 GLB 命名 | 是否执行导出 | GLB 输出路径 | 文件大小与预算符合情况 | 面数/结构检查结果 | 贴图/压缩检查结果 | 是否需要修改文件 | 当前状态 | 验收标准 | 风险与后续处理 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| AR-001 | 大件货物模型 | `heavy-transport-sim/public/models/day30/asset_ar001_cargo_main_v001_placeholder.obj` | OBJ 占位 | `asset_ar001_cargo_main_v001.glb` | 是 | `heavy-transport-sim/public/models/day34/asset_ar001_cargo_main_v001.glb` | GLB 1212 B，符合 2 MB 以内 | 顶点 28，三角面 30，GLB 可读；源 OBJ 结构可识别 | 未发现贴图，无贴图压缩对象；正式贴图预算 1024x1024 | 是，新建 GLB 输出文件 | 已导出基础 GLB 占位 | 文件非空、可读、命名符合 Day29，保留货物几何占位结构 | 占位资产不代表正式美术资产；后续需正式材质、原点和浏览器加载验收 |
| AR-002 | 6x6 与 8x8 牵引车 | `asset_ar002_tractor_6x6_v001_placeholder.obj`；`asset_ar002_tractor_8x8_v001_placeholder.obj` | OBJ 占位 | `asset_ar002_tractor_6x6_v001.glb`；`asset_ar002_tractor_8x8_v001.glb` | 是 | `heavy-transport-sim/public/models/day34/asset_ar002_tractor_6x6_v001.glb`；`asset_ar002_tractor_8x8_v001.glb` | GLB 1400 B、1520 B，符合每辆 3 MB 以内 | 顶点 40/48，三角面 36/40，GLB 可读；6x6 与 8x8 结构可识别 | 未发现贴图，无贴图压缩对象；正式贴图预算每车 1024x1024 | 是，新建 2 个 GLB | 已导出基础 GLB 占位 | 文件非空、可读、命名符合 Day29，6x6 与 8x8 可独立识别 | 第三方车辆模型仍有授权风险；当前占位不代表正式美术资产 |
| AR-003 | 全挂车、半挂车、自行式模块运输车 | `asset_ar003_trailer_full_v001_placeholder.obj`；`asset_ar003_trailer_semi_v001_placeholder.obj`；`asset_ar003_spmt_v001_placeholder.obj` | OBJ 占位 | `asset_ar003_trailer_full_v001.glb`；`asset_ar003_trailer_semi_v001.glb`；`asset_ar003_spmt_v001.glb` | 是 | `heavy-transport-sim/public/models/day34/asset_ar003_trailer_full_v001.glb`；`asset_ar003_trailer_semi_v001.glb`；`asset_ar003_spmt_v001.glb` | GLB 1156 B、1096 B、1204 B，符合每类 2.5 MB 以内 | 顶点 24/20/28，三角面 28/26/30，GLB 可读；三类挂车结构可识别 | 未发现贴图，无贴图压缩对象；正式贴图预算 1024x1024 共用图集 | 是，新建 3 个 GLB | 已导出基础 GLB 占位 | 文件非空、可读、命名符合 Day29，三类运输组合可独立识别 | 外部挂车模型存在授权风险；当前占位不代表正式美术资产 |
| AR-004 | 模块挂车与拼接部件 | `asset_ar004_modtrailer_unit_v001_placeholder.obj`；`asset_ar004_coupler_v001_placeholder.obj` | OBJ 占位 | `asset_ar004_modtrailer_unit_v001.glb`；`asset_ar004_coupler_v001.glb` | 是 | `heavy-transport-sim/public/models/day34/asset_ar004_modtrailer_unit_v001.glb`；`asset_ar004_coupler_v001.glb` | GLB 1060 B、1192 B，符合 1.5 MB 以内 | 顶点 20/24，三角面 18/36，GLB 可读；模块和连接件结构可识别 | 未发现贴图，无贴图压缩对象；正式贴图预算 512x512 或共用图集 | 是，新建 2 个 GLB | 已导出基础 GLB 占位 | 文件非空、可读、命名符合 Day29，纵列、轴线和拼接关系可辨认 | 不得新增 G1 外拼接部件类别；当前占位不代表正式美术资产 |
| AR-005 | 液压支承点与阀门示意 | 未发现源文件 | 未发现 | `asset_ar005_hydraulic_support_v001.glb` | 否 | 未生成 | 未发现源文件，无法核对 GLB 体积；目标为 1 MB 以内 | 未发现可检查结构 | 未发现贴图，无压缩对象；预算 512x512 或纯材质色 | 否，本日不补做缺失资产 | 缺失 | 支承点、控制阀和状态反馈在教学尺度下可区分 | 按后续资产制作流程处理；不得在 Day34 补做 |
| AR-006 | 限高障碍 | `heavy-transport-sim/public/models/day31/asset_ar006_height_limit_v001_placeholder.obj` | OBJ 占位 | `asset_ar006_height_limit_v001.glb` | 是 | `heavy-transport-sim/public/models/day34/asset_ar006_height_limit_v001.glb` | GLB 992 B，符合 1 MB 以内 | 顶点 20，三角面 10，GLB 可读；源资产高度疑似沿 Y 轴表达 | 未发现贴图，无压缩对象；正式标识贴图预算 512x512 | 是，新建 GLB 输出文件 | 已导出基础 GLB 占位 | 文件非空、可读、命名符合 Day29，净空关系可观察 | 后续需统一轴向；真实标识或第三方图标存在权利风险 |
| AR-007 | 圆弧弯道 | `heavy-transport-sim/public/models/day31/asset_ar007_arc_curve_v001_placeholder.obj` | OBJ 占位 | `asset_ar007_arc_curve_v001.glb` | 是 | `heavy-transport-sim/public/models/day34/asset_ar007_arc_curve_v001.glb` | GLB 1036 B，符合 2 MB 以内 | 顶点 21，三角面 17，GLB 可读；路面厚度沿 Z 表达 | 未发现贴图，无压缩对象；正式道路材质预算 1024x1024 | 是，新建 GLB 输出文件 | 已导出基础 GLB 占位 | 文件非空、可读、命名符合 Day29，内外边界和测量参照可辨识 | 第三方道路材质、真实地图或航拍图存在授权风险 |
| AR-008 | 直角弯道 | `heavy-transport-sim/public/models/day31/asset_ar008_orthogonal_curve_v001_placeholder.obj` | OBJ 占位 | `asset_ar008_orthogonal_curve_v001.glb` | 是 | `heavy-transport-sim/public/models/day34/asset_ar008_orthogonal_curve_v001.glb` | GLB 972 B，符合 2 MB 以内 | 顶点 18，三角面 10，GLB 可读；路面厚度沿 Z 表达 | 未发现贴图，无压缩对象；正式道路材质预算 1024x1024 | 是，新建 GLB 输出文件 | 已导出基础 GLB 占位 | 文件非空、可读、命名符合 Day29，直角边界和测量参照可辨识 | 真实路口照片、地图数据或第三方材质存在授权风险 |
| AR-009 | 坡道 | `heavy-transport-sim/public/models/day31/asset_ar009_slope_v001_placeholder.obj` | OBJ 占位 | `asset_ar009_slope_v001.glb` | 是 | `heavy-transport-sim/public/models/day34/asset_ar009_slope_v001.glb` | GLB 896 B，符合 1.5 MB 以内 | 顶点 15，三角面 7，GLB 可读；坡高沿 Z 表达 | 未发现贴图，无压缩对象；正式坡面贴图预算 1024x1024 | 是，新建 GLB 输出文件 | 已导出基础 GLB 占位 | 文件非空、可读、命名符合 Day29，坡面、坡向和测量参照可辨识 | 未发布案例坡度数值不得写入模型；第三方坡面材质存在授权风险 |
| AR-010 | 桥梁及限载标志 | `asset_ar010_bridge_v001_placeholder.obj`；`asset_ar010_load_sign_v001_placeholder.obj` | OBJ 占位 | `asset_ar010_bridge_v001.glb`；`asset_ar010_load_sign_v001.glb` | 是 | `heavy-transport-sim/public/models/day34/asset_ar010_bridge_v001.glb`；`asset_ar010_load_sign_v001.glb` | GLB 1088 B、868 B，符合 3 MB 以内 | 顶点 24/12，三角面 20/6，GLB 可读；限载标志高度疑似沿 Y 轴表达 | 未发现贴图，无压缩对象；正式桥梁图集 1024x1024，限载牌可单独 512x512 | 是，新建 2 个 GLB | 已导出基础 GLB 占位 | 文件非空、可读、命名符合 Day29，桥梁和限载信息可辨识 | 后续需统一标志轴向；复制真实限载标志或桥梁外观存在权利风险 |
| AR-011 | 三条候选路线与基础场景 | `asset_ar011_route_a_v001_placeholder.obj`；`asset_ar011_route_b_v001_placeholder.obj`；`asset_ar011_route_c_v001_placeholder.obj` | OBJ 占位 | `asset_ar011_route_a_v001.glb`；`asset_ar011_route_b_v001.glb`；`asset_ar011_route_c_v001.glb` | 是 | `heavy-transport-sim/public/models/day34/asset_ar011_route_a_v001.glb`；`asset_ar011_route_b_v001.glb`；`asset_ar011_route_c_v001.glb` | GLB 1044 B、1044 B、1040 B，符合单路线 4 MB 以内 | 各 24 顶点、12 三角面，GLB 可读；路面厚度沿 Z 表达 | 未发现贴图，无压缩对象；正式道路图集 1024x1024、标识图 512x512 | 是，新建 3 个 GLB | 已导出基础 GLB 占位 | 文件非空、可读、命名符合 Day29，三条路线身份和障碍位置可区分 | 不得扩展为开放世界或真实地理场景；真实地图和第三方地形存在授权风险 |
| AR-012 | 橡胶垫 | 未发现源文件 | 未发现 | `asset_ar012_rubber_pad_v001.glb` | 否 | 未生成 | 未发现源文件，无法核对 GLB 体积；目标为 512 KB 以内 | 未发现可检查结构 | 未发现贴图，无压缩对象；预算 256x256 或纯材质色 | 否，本日不补做 Day32 工具资产 | 缺失 | 工具外观、名称和可用位置可独立识别 | 后续按工具资产制作流程处理；不得在 Day34 补做 |
| AR-013 | 梯子 | 未发现源文件 | 未发现 | `asset_ar013_ladder_v001.glb` | 否 | 未生成 | 未发现源文件，无法核对 GLB 体积；目标为 800 KB 以内 | 未发现可检查结构 | 未发现贴图，无压缩对象；预算 512x512 或纯材质色 | 否，本日不补做 Day32 工具资产 | 缺失 | 与其他工具可独立识别和命名 | 第三方梯子模型存在授权风险；后续需自制或补齐授权 |
| AR-014 | 安全带 | 未发现源文件 | 未发现 | `asset_ar014_safety_belt_v001.glb` | 否 | 未生成 | 未发现源文件，无法核对 GLB 体积；目标为 800 KB 以内 | 未发现可检查结构 | 未发现贴图，无压缩对象；预算 512x512 或纯材质色 | 否，本日不补做 Day32 工具资产 | 缺失 | 与钢丝绳、葫芦、衬垫可区分 | 第三方安全带模型存在授权风险；后续需自制或补齐授权 |
| AR-015 | 钢丝绳 | 未发现源文件 | 未发现 | `asset_ar015_wire_rope_v001.glb` | 否 | 未生成 | 未发现源文件，无法核对 GLB 体积；目标为单根 512 KB 以内 | 未发现可检查结构 | 未发现贴图，无压缩对象；预算 256x256 或程序材质 | 否，本日不补做 Day32 工具资产 | 缺失 | 绳索、连接点和布置方向可辨识 | 后续需自制参数化绳索或补齐授权；长度和角度由交互数据驱动 |
| AR-016 | 手拉葫芦/紧固葫芦 | 未发现源文件 | 未发现 | `asset_ar016_chain_block_v001.glb` | 否 | 未生成 | 未发现源文件，无法核对 GLB 体积；目标为 1 MB 以内 | 未发现可检查结构 | 未发现贴图，无压缩对象；预算 512x512 或纯材质色 | 否，本日不补做 Day32 工具资产 | 缺失 | 工具可识别、命名并与钢丝绳区分 | 第三方工业工具模型授权风险较高；后续需自制或补齐授权 |
| AR-017 | 防磨衬垫 | 未发现源文件 | 未发现 | `asset_ar017_anti_wear_pad_v001.glb` | 否 | 未生成 | 未发现源文件，无法核对 GLB 体积；目标为 512 KB 以内 | 未发现可检查结构 | 未发现贴图，无压缩对象；预算 256x256 或纯材质色 | 否，本日不补做 Day32 工具资产 | 缺失 | 防磨衬垫与橡胶垫、绳索可区分 | 后续按工具资产制作流程处理；不得混用 AR-012 命名 |
| AR-018 | 正确/错误运输反馈动画资产 | 未发现源文件 | 未发现 | `asset_ar018_transport_feedback_success_v001.glb`；`asset_ar018_transport_feedback_fail_v001.glb` | 否 | 未生成 | 未发现源文件，无法核对 GLB 体积；目标为单动画资源 3 MB 以内 | 未发现可检查结构 | 未发现贴图，无压缩对象；预算为反馈标识 512x512、路径线程序材质 | 否，本日不提前制作运输动画资产 | 缺失 | 正确与错误结果可辨识；加载失败归技术异常，不改变规则判断 | 不提前执行 Day94/Day95 动画制作；不得新增真实运输场景类别 |
| AR-019 | 教学示意图与参数卡 | 未发现 AR-019 命名源文件 | 未发现 | 不适用；Day29 目标为 `asset_ar019_icon_[name]_v001.svg`、`asset_ar019_diagram_[name]_v001.png` | 否 | 不适用 | 未发现 AR-019 命名文件；无法核对图标 50 KB 或示意图 300 KB 预算 | 不适用三维面数；若后续有 3D 示意不超过 1k 面 | 未发现 AR-019 命名 PNG/WebP/SVG，无压缩对象 | 否，本日不补做教学资源 | 缺失 | 关键对象、名称、单位和来源可读；未确认值不得写入正式示意图 | 不复制第三方图标、真实标牌或未授权示意图 |

## 5. GLB 导出结果汇总

| 项目 | Day34 结果 |
|---|---|
| 已实际导出 GLB | 是 |
| 导出文件数量 | 17 个 |
| 输出目录 | `heavy-transport-sim/public/models/day34` |
| 已导出范围 | AR-001 至 AR-004、AR-006 至 AR-011 的已有 OBJ 占位资产 |
| 未导出范围 | AR-005、AR-012 至 AR-019 未发现源文件 |
| 命名结果 | 所有 GLB 使用 Day29 正式命名，未带 `_placeholder` 后缀 |
| 结构验证 | 17 个 GLB 均非空、可读，GLB magic/version/chunk 基础结构可解析 |
| 后续处理 | 后续正式资产仍需 DCC 工具或正式资产管线检查材质、法线、原点、坐标轴、浏览器加载与视觉效果 |

## 6. 贴图压缩与预算检查结果汇总

| 项目 | Day34 结果 |
|---|---|
| 已实际压缩贴图 | 否 |
| 未压缩原因 | 未发现 AR-001 至 AR-019 命名贴图文件；本日不凭空创建贴图 |
| 已检查贴图目录 | `heavy-transport-sim/public/models`、`heavy-transport-sim/src/assets` |
| 可处理贴图对象 | 未发现 |
| 不作为 Day34 资产贴图处理的文件 | `heavy-transport-sim/src/assets/hero.png`、`react.svg`、`vite.svg` 属应用图片或模板资源，未按 AR-001 至 AR-019 命名，不纳入本日压缩对象 |
| 预算核对 | Day29 已为 AR-001 至 AR-018 规定 256x256、512x512 或 1024x1024 贴图预算；AR-019 图标 50 KB 以内、示意图 300 KB 以内。本日因无贴图文件，只记录预算口径，不做压缩验收 |
| 后续处理 | 正式贴图必须项目自制或授权明确，按 `tex_ar###_[semantic]_[type]_v001` 命名，压缩后记录源文件、输出文件、尺寸、大小、许可和是否符合预算 |

## 7. 版权、许可风险与 CR

| 项目 | Day34 结论 |
|---|---|
| 当前已发现 OBJ 与导出 GLB 版权状态 | 继承 Day30、Day31、Day33 声明：已发现 OBJ 为项目自制简单几何占位资产；本日 GLB 由这些 OBJ 转换生成，未引入外部模型或贴图 |
| 商业授权声明 | 本日不声明已取得任何第三方商业授权；占位文件不代表正式美术资产或最终授权资产 |
| 主要版权风险 | 第三方车辆、挂车、工业工具、道路材质、真实标识、地图数据、桥梁外观、教学图标或示意图在授权证据不完整时不得作为正式资产 |
| 贴图风险 | 未发现 AR 命名贴图；未来若使用免费材质、道路图集、标识贴图或 UI 图标，必须保留来源、许可、署名和可商用可修改证据 |
| CR | 未发现必须新增、删除或调整 G1 资产类别的情况，CR 列表为空 |
| G1 外资产 | 未新增 G1 外资产类别；未补做 Day32 工具资产；未制作运输反馈动画或教学图标 |

## 8. Day34 验证记录

| 验证项 | 结果 | 证据 |
|---|---|---|
| 检查了哪些文档 | 已检查 | 126天计划、G1资产需求基线、G1需求冻结评审记录、Day29清单、Day30记录、Day31记录、Day33记录、范围排除清单与变更流程；未发现 Day32 记录文件 |
| 覆盖了哪些 AR 条目 | 已覆盖 | AR-001 至 AR-019 均在第4节逐项记录；已有资产和缺失资产均有导出与贴图检查状态 |
| 检查了哪些资产目录 | 已检查 | `heavy-transport-sim/public/models/day30`、`heavy-transport-sim/public/models/day31`、`heavy-transport-sim/public/models/day34`、`heavy-transport-sim/public/models`、`heavy-transport-sim/src/assets` |
| 是否实际导出 GLB | 是 | AR-001 至 AR-004、AR-006 至 AR-011 共 17 个 GLB 已导出到 `heavy-transport-sim/public/models/day34` |
| 是否实际压缩贴图 | 否 | 未发现 AR 命名贴图文件，未生成压缩贴图 |
| 是否存在版权风险 | 存在潜在外部素材风险 | 当前 OBJ 与 GLB 未引入外部素材；正式资产若采购或复用第三方素材，需授权文件、许可记录和署名要求 |
| 是否存在 CR | 不存在 | 未新增、删除或调整 G1 冻结资产类别 |
| 是否修改资产文件 | 是 | 新建 17 个 GLB；未修改既有 OBJ/GLTF/贴图文件 |
| 是否修改应用源码 | 否 | 未修改 `heavy-transport-sim/src` 下源码文件 |
| 是否引入依赖 | 否 | 未修改依赖配置，未执行安装命令 |
| 是否连接 Supabase | 否 | 未执行 Supabase 连接、迁移、查询或远程命令 |
| 是否创建 PR | 否 | 未执行 PR 创建命令 |
| 是否执行 Day35 或后续任务 | 否 | 未执行周资产审查、浏览器性能优化、三维场景接入、运输动画制作或后续开发任务 |

## 9. Day34 结论

Day34 已完成 AR-001 至 AR-019 的 GLB 导出、已有资产格式转换检查、贴图压缩检查和预算核对。当前实际导出的范围为 AR-001 至 AR-004、AR-006 至 AR-011，共 17 个由项目自制 OBJ 占位资产转换得到的基础 GLB；AR-005、AR-012 至 AR-019 未发现源文件，未补做缺失资产。

本日未实际压缩贴图，原因是未发现 AR-001 至 AR-019 命名贴图文件。本日新建 GLB 均为自制占位资产转换结果，不代表正式美术资产，不代表商业授权已经取得，也不代表最终浏览器加载资产已经验收。

本日未修改应用源码，未连接 Supabase，未引入依赖，未创建 PR，未执行 Day35 或后续任务。

## 10. Day32 工具资产追加导出记录

> 追加日期：2026-06-28  
> 追加原因：Day32 已追补 AR-012 至 AR-017 工具类 OBJ 占位资产。为保持 Day34 导出记录完整，本节追加导出这 6 个工具资产 GLB。前文中 AR-012 至 AR-017 的“未发现源文件/未生成”属于 Day32 追补前状态；本节为追补后的最新导出结果。

### 10.1 追加导出文件与预算核对

| AR | 源文件 | GLB 输出路径 | 源文件大小 | GLB 大小 | Day29 目标大小 | 大小预算结论 |
|---|---|---|---:|---:|---|---|
| AR-012 | `heavy-transport-sim/public/models/day32/asset_ar012_rubber_pad_v001_placeholder.obj` | `heavy-transport-sim/public/models/day34/asset_ar012_rubber_pad_v001.glb` | 572 B | 984 B | 512 KB 以内 | 符合 |
| AR-013 | `heavy-transport-sim/public/models/day32/asset_ar013_ladder_v001_placeholder.obj` | `heavy-transport-sim/public/models/day34/asset_ar013_ladder_v001.glb` | 779 B | 1108 B | 800 KB 以内 | 符合 |
| AR-014 | `heavy-transport-sim/public/models/day32/asset_ar014_safety_belt_v001_placeholder.obj` | `heavy-transport-sim/public/models/day34/asset_ar014_safety_belt_v001.glb` | 513 B | 936 B | 800 KB 以内 | 符合 |
| AR-015 | `heavy-transport-sim/public/models/day32/asset_ar015_wire_rope_v001_placeholder.obj` | `heavy-transport-sim/public/models/day34/asset_ar015_wire_rope_v001.glb` | 607 B | 996 B | 单根 512 KB 以内 | 符合 |
| AR-016 | `heavy-transport-sim/public/models/day32/asset_ar016_chain_block_v001_placeholder.obj` | `heavy-transport-sim/public/models/day34/asset_ar016_chain_block_v001.glb` | 657 B | 1048 B | 1 MB 以内 | 符合 |
| AR-017 | `heavy-transport-sim/public/models/day32/asset_ar017_anti_wear_pad_v001_placeholder.obj` | `heavy-transport-sim/public/models/day34/asset_ar017_anti_wear_pad_v001.glb` | 502 B | 932 B | 512 KB 以内 | 符合 |

### 10.2 AR-012 至 AR-017 追加导出检查结果

| 资产编号 | 资产名称 | 源文件路径 | 源文件格式 | 目标 GLB 命名 | 是否执行导出 | GLB 输出路径 | 文件大小与预算符合情况 | 面数/结构检查结果 | 贴图/压缩检查结果 | 是否需要修改文件 | 当前状态 | 验收标准 | 风险与后续处理 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| AR-012 | 橡胶垫 | `heavy-transport-sim/public/models/day32/asset_ar012_rubber_pad_v001_placeholder.obj` | OBJ 占位 | `asset_ar012_rubber_pad_v001.glb` | 是 | `heavy-transport-sim/public/models/day34/asset_ar012_rubber_pad_v001.glb` | GLB 984 B，符合 512 KB 以内 | 顶点 16，三角面 16，GLB 可读；橡胶垫结构可识别 | 未发现贴图，无压缩对象；正式预算为 256x256 或纯材质色 | 是，新建 GLB 输出文件 | 已导出基础 GLB 占位 | 文件非空、可读、命名符合 Day29，工具外观和可用位置可识别 | 占位资产不代表正式美术资产；后续需正式材质和浏览器加载验收 |
| AR-013 | 梯子 | `heavy-transport-sim/public/models/day32/asset_ar013_ladder_v001_placeholder.obj` | OBJ 占位 | `asset_ar013_ladder_v001.glb` | 是 | `heavy-transport-sim/public/models/day34/asset_ar013_ladder_v001.glb` | GLB 1108 B，符合 800 KB 以内 | 顶点 28，三角面 14，GLB 可读；梯框和横档结构可识别 | 未发现贴图，无压缩对象；正式预算为 512x512 或纯材质色 | 是，新建 GLB 输出文件 | 已导出基础 GLB 占位 | 文件非空、可读、命名符合 Day29，与其他工具可独立识别 | 第三方梯子模型存在授权风险；当前占位不代表正式美术资产 |
| AR-014 | 安全带 | `heavy-transport-sim/public/models/day32/asset_ar014_safety_belt_v001_placeholder.obj` | OBJ 占位 | `asset_ar014_safety_belt_v001.glb` | 是 | `heavy-transport-sim/public/models/day34/asset_ar014_safety_belt_v001.glb` | GLB 936 B，符合 800 KB 以内 | 顶点 16，三角面 8，GLB 可读；带体和扣具结构可识别 | 未发现贴图，无压缩对象；正式预算为 512x512 或纯材质色 | 是，新建 GLB 输出文件 | 已导出基础 GLB 占位 | 文件非空、可读、命名符合 Day29，与钢丝绳、葫芦、衬垫可区分 | 第三方安全带模型存在授权风险；当前占位不代表正式美术资产 |
| AR-015 | 钢丝绳 | `heavy-transport-sim/public/models/day32/asset_ar015_wire_rope_v001_placeholder.obj` | OBJ 占位 | `asset_ar015_wire_rope_v001.glb` | 是 | `heavy-transport-sim/public/models/day34/asset_ar015_wire_rope_v001.glb` | GLB 996 B，符合单根 512 KB 以内 | 顶点 20，三角面 10，GLB 可读；绳段和端点连接片可识别 | 未发现贴图，无压缩对象；正式预算为 256x256 或程序材质 | 是，新建 GLB 输出文件 | 已导出基础 GLB 占位 | 文件非空、可读、命名符合 Day29，绳索、连接点和方向可辨识 | 后续正式交互需支持动态长度和角度；当前占位不代表正式美术资产 |
| AR-016 | 手拉葫芦/紧固葫芦 | `heavy-transport-sim/public/models/day32/asset_ar016_chain_block_v001_placeholder.obj` | OBJ 占位 | `asset_ar016_chain_block_v001.glb` | 是 | `heavy-transport-sim/public/models/day34/asset_ar016_chain_block_v001.glb` | GLB 1048 B，符合 1 MB 以内 | 顶点 20，三角面 18，GLB 可读；主体、吊钩和链条示意可识别 | 未发现贴图，无压缩对象；正式预算为 512x512 或纯材质色 | 是，新建 GLB 输出文件 | 已导出基础 GLB 占位 | 文件非空、可读、命名符合 Day29，工具可识别并与钢丝绳区分 | 第三方工业工具模型授权风险较高；当前占位不代表正式美术资产 |
| AR-017 | 防磨衬垫 | `heavy-transport-sim/public/models/day32/asset_ar017_anti_wear_pad_v001_placeholder.obj` | OBJ 占位 | `asset_ar017_anti_wear_pad_v001.glb` | 是 | `heavy-transport-sim/public/models/day34/asset_ar017_anti_wear_pad_v001.glb` | GLB 932 B，符合 512 KB 以内 | 顶点 12，三角面 14，GLB 可读；防磨衬垫和接触标记可识别 | 未发现贴图，无压缩对象；正式预算为 256x256 或纯材质色 | 是，新建 GLB 输出文件 | 已导出基础 GLB 占位 | 文件非空、可读、命名符合 Day29，防磨衬垫与橡胶垫、绳索可区分 | 不得混用 AR-012 命名；当前占位不代表正式美术资产 |

### 10.3 追加导出后汇总

| 项目 | 最新 Day34 结果 |
|---|---|
| 已实际导出 GLB | 是 |
| 导出文件总数 | 23 个 |
| 追加导出数量 | 6 个 |
| 最新已导出范围 | AR-001 至 AR-004、AR-006 至 AR-017 的已有 OBJ 占位资产 |
| 最新未导出范围 | AR-005、AR-018、AR-019 未发现源文件 |
| 贴图压缩 | 仍未执行；未发现 AR 命名贴图文件 |
| 结构验证 | 追加 6 个 GLB 均非空、可读，GLB magic/version/chunk 基础结构可解析 |
| 是否执行 Day35 或后续任务 | 否；本节只追加 Day32 工具资产的 Day34 导出记录 |

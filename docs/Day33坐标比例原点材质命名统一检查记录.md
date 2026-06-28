# Day33 坐标、比例、原点、材质和命名统一检查记录

> 任务：第33天：统一坐标、比例、原点、材质和命名  
> 执行日期：2026-06-28  
> 执行范围：AR-001 至 AR-019 已有低模/占位资产的结构检查与统一规范记录  
> 执行边界：本日只做坐标、比例、原点、材质和命名规范检查与统一规划；未修改 OBJ/GLTF/GLB/Blend/FBX 等资产文件，未导出 GLB，未压缩贴图，未接入三维场景，未修改应用源码，未连接 Supabase，未安装依赖，未创建 PR。  
> 资产声明：当前已发现 OBJ 均为项目自制简单几何占位资产，不代表正式美术资产，不代表商业授权已经取得，也不代表最终浏览器加载资产已经验收。

## 1. 已检查文档

| 文档 | 检查目的 | Day33 采用结论 |
|---|---|---|
| `大件运输虚拟仿真实验教学系统_单人复刻126天计划.md` | 核对第33天任务边界、第34天禁止提前执行项和三维资产管线顺序 | 第33天只做统一规范检查与记录，不执行 GLB 导出、贴图压缩、性能优化或场景接入 |
| `docs/G1资产需求基线.md` | 核对 AR-001 至 AR-019 的冻结资产类别、教学用途和最低可辨识标准 | 覆盖 AR-001 至 AR-019，不新增 G1 外资产类别 |
| `docs/G1需求冻结评审记录.md` | 核对 G1 冻结范围和未冻结内容 | G1 只冻结资产需求，不代表资产已取得、授权、制作或模型文件验收完成 |
| `docs/Day29资产采购制作与许可执行清单.md` | 核对命名规范、目标格式、目标大小、面数预算、贴图预算和许可口径 | 沿用 Day29 的 `asset_ar###_[name]_v001` 命名、目标 GLB/PNG/SVG 口径和预算；当前 OBJ 不按最终 GLB 验收 |
| `docs/Day30货物牵引车挂车低模资产准备记录.md` | 核对 AR-001 至 AR-004 占位资产文件、声明和风险 | 继承自制 OBJ 占位、不代表正式美术资产的声明 |
| `docs/Day31道路坡道弯道桥梁限高低模资产准备记录.md` | 核对 AR-006 至 AR-011 占位资产文件、声明和风险 | 继承自制 OBJ 占位、不代表正式美术资产的声明 |
| Day32 资产准备记录 | 查找是否存在工具资产准备记录 | 仓库中未发现 Day32 资产准备记录文件；不补做 Day32 工具资产 |
| `docs/范围排除清单与变更流程.md` | 核对版权、范围调整、CR 和禁止擅自实现要求 | 未新增资产类别；未发现需要提交 CR 的 G1 范围变化 |

## 2. 已检查资产目录

| 目录 | 检查结果 |
|---|---|
| `heavy-transport-sim/public/models/day30` | 发现 AR-001 至 AR-004 的项目自制 OBJ 占位资产，共 8 个文件 |
| `heavy-transport-sim/public/models/day31` | 发现 AR-006 至 AR-011 的项目自制 OBJ 占位资产，共 9 个文件 |
| `heavy-transport-sim/public/models` | 未发现 AR-005、AR-012 至 AR-019 的 OBJ/GLTF/GLB/Blend/FBX 资产文件 |
| `heavy-transport-sim/src/assets` | 发现应用图片资源，不属于 Day33 可处理的 AR-001 至 AR-019 模型规范统一范围 |
| `figures`、`word_pdf_pages`、根目录图片 | 属论文/文档渲染或资料图片，不作为 Day33 三维资产文件验收 |

## 3. Day33 统一规范

| 规范项 | 统一建议 |
|---|---|
| 命名 | 文件名沿用 Day29：`asset_ar###_[asset_name]_v001.[ext]`；占位 OBJ 可保留 `_placeholder` 后缀，正式 GLB 文件不得带 `_placeholder`。对象名、组名、材质名建议与文件基名保持同源，例如 `mat_ar001_cargo_body_v001`。 |
| 坐标轴 | 建议统一为右手坐标；X 表示宽向或横向，Y 表示前进/路线方向，Z 表示竖直向上。当前 OBJ 中部分 Day30 文件以 Z 为高度，部分 Day31 文件以 Y 为高度，需在 Day33 记录中标记，实际旋转或重写资产需另行确认引用影响。 |
| 比例/单位 | 建议统一 1 单位 = 1 米；所有模型导入时保持 `scale = 1`，不依赖应用层临时缩放修正比例。占位资产可按教学可辨识比例表达，不代表真实工程尺寸。 |
| 原点 | 车辆、挂车、货物和工具建议原点位于底部中心或教学操作中心；道路/路线/桥梁/坡道建议原点位于路段中心或起点基准；限高/标志类建议原点位于地面投影中心。 |
| 材质 | 建议使用项目自制纯色或程序材质。材质命名使用 `mat_ar###_[semantic]_v001`；贴图命名使用 `tex_ar###_[semantic]_[type]_v001`。当前 OBJ 均未声明 `mtllib` 或 `usemtl`，应记录为“材质待统一命名”，不在 Day33 直接补写材质文件。 |
| 版权 | 当前已发现 OBJ 为项目自制简单几何占位资产，未引入外部素材；任何第三方模型、贴图、标识、地图或真实道路素材在授权证据齐全前不得作为正式资产。 |
| Day34 边界 | GLB 导出、贴图压缩、最终体积验收和浏览器加载验收均留给 Day34 或后续对应任务，本日不执行。 |

## 4. 已发现 OBJ 基础结构摘要

| AR | 文件 | 顶点数 | 面数 | 对象/组 | 材质声明 | 包围盒摘要 | 结构结论 |
|---|---|---:|---:|---|---|---|---|
| AR-001 | `asset_ar001_cargo_main_v001_placeholder.obj` | 28 | 15 | 对象名含 AR；组含 `cargo_body`、重心和方向标记 | 无 `mtllib`/`usemtl` | x[-3.2,3.2] y[-1.1,1] z[-0.82,1.2] | 文件非空、可读，OBJ 基础结构可识别 |
| AR-002 | `asset_ar002_tractor_6x6_v001_placeholder.obj` | 40 | 18 | 对象名含 AR；组含车架、驾驶室和 6x6 轮位 | 无 `mtllib`/`usemtl` | x[-1.8,1.8] y[-0.62,0.62] z[-0.05,1.15] | 文件非空、可读，OBJ 基础结构可识别 |
| AR-002 | `asset_ar002_tractor_8x8_v001_placeholder.obj` | 48 | 20 | 对象名含 AR；组含车架、驾驶室和 8x8 轮位 | 无 `mtllib`/`usemtl` | x[-2.1,2.1] y[-0.68,0.68] z[-0.05,1.15] | 文件非空、可读，OBJ 基础结构可识别 |
| AR-003 | `asset_ar003_trailer_full_v001_placeholder.obj` | 24 | 14 | 对象名含 AR；组含平台、牵引杆和轴线标记 | 无 `mtllib`/`usemtl` | x[-3.7,2.8] y[-0.8,0.8] z[-0.05,0.25] | 文件非空、可读，OBJ 基础结构可识别 |
| AR-003 | `asset_ar003_trailer_semi_v001_placeholder.obj` | 20 | 13 | 对象名含 AR；组含平台、鞍座板和后轴标记 | 无 `mtllib`/`usemtl` | x[-3.1,3] y[-0.8,0.8] z[-0.1,0.25] | 文件非空、可读，OBJ 基础结构可识别 |
| AR-003 | `asset_ar003_spmt_v001_placeholder.obj` | 28 | 15 | 对象名含 AR；组含模块平台、动力单元和轴线标记 | 无 `mtllib`/`usemtl` | x[-2.4,2.4] y[-0.95,0.95] z[-0.05,0.7] | 文件非空、可读，OBJ 基础结构可识别 |
| AR-004 | `asset_ar004_modtrailer_unit_v001_placeholder.obj` | 20 | 9 | 对象名含 AR；组含模块平台、可选轴线和连接孔 | 无 `mtllib`/`usemtl` | x[-1.35,1.35] y[-0.95,0.95] z[-0.05,0.22] | 文件非空、可读，OBJ 基础结构可识别 |
| AR-004 | `asset_ar004_coupler_v001_placeholder.obj` | 24 | 18 | 对象名含 AR；组含连接杆和左右销 | 无 `mtllib`/`usemtl` | x[-0.8,0.8] y[-0.18,0.18] z[0,0.3] | 文件非空、可读，OBJ 基础结构可识别 |
| AR-006 | `asset_ar006_height_limit_v001_placeholder.obj` | 20 | 5 | 对象名含 AR；无分组 | 无 `mtllib`/`usemtl` | x[-3,3] y[0,4.65] z[-0.18,0] | 文件非空、可读；高度疑似沿 Y 轴表达 |
| AR-007 | `asset_ar007_arc_curve_v001_placeholder.obj` | 21 | 8 | 对象名含 AR；无分组 | 无 `mtllib`/`usemtl` | x[0,4] y[0,4] z[0,0.04] | 文件非空、可读，路面厚度沿 Z 轴表达 |
| AR-008 | `asset_ar008_orthogonal_curve_v001_placeholder.obj` | 18 | 4 | 对象名含 AR；无分组 | 无 `mtllib`/`usemtl` | x[-4,1] y[-1,4] z[0,0.06] | 文件非空、可读，路面厚度沿 Z 轴表达 |
| AR-009 | `asset_ar009_slope_v001_placeholder.obj` | 15 | 4 | 对象名含 AR；无分组 | 无 `mtllib`/`usemtl` | x[-3,3] y[-4,2] z[0,0.8] | 文件非空、可读，坡高沿 Z 轴表达 |
| AR-010 | `asset_ar010_bridge_v001_placeholder.obj` | 24 | 10 | 对象名含 AR；无分组 | 无 `mtllib`/`usemtl` | x[-4,4] y[-1.6,1.6] z[0,1.65] | 文件非空、可读，桥体高度沿 Z 轴表达 |
| AR-010 | `asset_ar010_load_sign_v001_placeholder.obj` | 12 | 3 | 对象名含 AR；无分组 | 无 `mtllib`/`usemtl` | x[-0.9,0.9] y[0,2.5] z[-0.08,0] | 文件非空、可读；标志高度疑似沿 Y 轴表达 |
| AR-011 | `asset_ar011_route_a_v001_placeholder.obj` | 24 | 6 | 对象名含 AR；无分组 | 无 `mtllib`/`usemtl` | x[-5,5] y[-1.3,1.3] z[0,0.05] | 文件非空、可读，路面厚度沿 Z 轴表达 |
| AR-011 | `asset_ar011_route_b_v001_placeholder.obj` | 24 | 6 | 对象名含 AR；无分组 | 无 `mtllib`/`usemtl` | x[-5,4.6] y[-1,4.2] z[0,0.05] | 文件非空、可读，路面厚度沿 Z 轴表达 |
| AR-011 | `asset_ar011_route_c_v001_placeholder.obj` | 24 | 6 | 对象名含 AR；无分组 | 无 `mtllib`/`usemtl` | x[-5,5] y[-1,3.2] z[0,0.05] | 文件非空、可读，路面厚度沿 Z 轴表达 |

## 5. AR-001 至 AR-019 统一检查结果

| 资产编号 | 资产名称 | 已发现文件路径 | 当前文件格式 | 命名规范符合情况 | 坐标轴规范建议 | 比例/单位规范建议 | 原点规范建议 | 材质/贴图命名规范建议 | 是否需要修改文件 | 当前状态 | 验收标准 | 风险与后续处理 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| AR-001 | 大件货物模型 | `heavy-transport-sim/public/models/day30/asset_ar001_cargo_main_v001_placeholder.obj` | OBJ 占位 | 文件名符合 Day29 基名并明确 `_placeholder`；正式目标名为 `asset_ar001_cargo_main_v001.glb` | 建议 X=宽向、Y=前进/长向、Z=竖直向上；当前包围盒显示高度已主要沿 Z 表达 | 统一 1 单位=1 米；保持 `scale=1`；占位尺寸只表达教学比例 | 建议原点在货物底部中心或重心投影点，便于装车与重心教学 | 建议 `mat_ar001_cargo_body_v001`、`mat_ar001_cog_marker_v001`、`mat_ar001_dimension_marker_v001`；贴图如需使用 `tex_ar001_cargo_markings_basecolor_v001` | Day33 不修改；后续正式资产需统一材质并确认原点 | 已发现自制 OBJ 占位；非正式美术资产 | 导入后不漂浮、不反向；货物整体、长宽高和重心/吊装教学标记可辨识 | 当前无材质声明；OBJ 不是目标 GLB；后续 Day34 才可导出 GLB |
| AR-002 | 6x6 与 8x8 牵引车 | `heavy-transport-sim/public/models/day30/asset_ar002_tractor_6x6_v001_placeholder.obj`；`heavy-transport-sim/public/models/day30/asset_ar002_tractor_8x8_v001_placeholder.obj` | OBJ 占位 | 文件名符合 Day29 基名并明确 `_placeholder`；正式目标名为 `asset_ar002_tractor_6x6_v001.glb`、`asset_ar002_tractor_8x8_v001.glb` | 建议 X=车宽、Y=车长/前进方向、Z=高度；当前高度沿 Z 表达 | 统一 1 单位=1 米；6x6 与 8x8 保持相同单位和轮位比例 | 建议原点在车辆底盘中心地面投影，朝向统一为 +Y | 建议 `mat_ar002_body_v001`、`mat_ar002_wheel_v001`、`mat_ar002_cab_v001`；6x6/8x8 可共用材质 | Day33 不修改；后续需确认朝向和原点后再改资产 | 已发现 2 个自制 OBJ 占位；非正式美术资产 | 6x6 与 8x8 可独立识别，轮组/轴数差异清楚，不使用版权不明车辆模型 | 第三方车辆采购路径仍有授权风险；当前无材质声明；后续 Day34 才可导出 GLB |
| AR-003 | 全挂车、半挂车、自行式模块运输车 | `heavy-transport-sim/public/models/day30/asset_ar003_trailer_full_v001_placeholder.obj`；`heavy-transport-sim/public/models/day30/asset_ar003_trailer_semi_v001_placeholder.obj`；`heavy-transport-sim/public/models/day30/asset_ar003_spmt_v001_placeholder.obj` | OBJ 占位 | 文件名符合 Day29 基名并明确 `_placeholder`；正式目标名分别去除 `_placeholder` 并使用 `.glb` | 建议 X=车宽、Y=车长/前进方向、Z=高度；当前高度沿 Z 表达 | 统一 1 单位=1 米；三类挂车保持相同平台高度口径 | 建议原点在平台中心地面投影；连接件朝向与牵引车 +Y 方向一致 | 建议 `mat_ar003_deck_v001`、`mat_ar003_axle_marker_v001`、`mat_ar003_connector_v001`；三类共享材质图集 | Day33 不修改；后续需统一三类挂车朝向、原点和连接点 | 已发现 3 个自制 OBJ 占位；非正式美术资产 | 三类运输组合外形和连接关系可独立识别，未扩展新车型类别 | 外部工业挂车模型存在授权风险；当前无材质声明；OBJ 不是最终 GLB |
| AR-004 | 模块挂车与拼接部件 | `heavy-transport-sim/public/models/day30/asset_ar004_modtrailer_unit_v001_placeholder.obj`；`heavy-transport-sim/public/models/day30/asset_ar004_coupler_v001_placeholder.obj` | OBJ 占位 | 文件名符合 Day29 基名并明确 `_placeholder`；正式目标名分别去除 `_placeholder` 并使用 `.glb` | 建议 X=模块宽、Y=拼接纵向、Z=高度；当前高度沿 Z 表达 | 统一 1 单位=1 米；模块单元和连接件使用同一拼接网格尺度 | 模块原点建议在单元中心地面投影；连接件原点建议在中点，便于吸附拼接 | 建议 `mat_ar004_module_deck_v001`、`mat_ar004_coupler_v001`、`mat_ar004_socket_marker_v001` | Day33 不修改；实际重命名或调原点前需确认是否已有引用 | 已发现 2 个自制 OBJ 占位；非正式美术资产 | 纵列、轴线和拼接关系可辨认并可选中 | 若新增拼接部件类型可能突破 G1 类别；当前无材质声明；后续仅按计划处理 |
| AR-005 | 液压支承点与阀门示意 | 未发现文件 | 未发现 | Day29 目标名为 `asset_ar005_hydraulic_support_v001.glb`；当前无文件可检查 | 建议 X/Y 为车组平面坐标，Z 为高度；状态显示不改变坐标轴 | 统一 1 单位=1 米；支承点和阀门按教学尺度表达 | 支承点原点建议位于接触点中心；阀门原点建议位于可点击中心 | 建议 `mat_ar005_support_v001`、`mat_ar005_valve_open_v001`、`mat_ar005_valve_closed_v001`、`mat_ar005_state_warning_v001` | Day33 不修改；未发现文件 | 缺失；未发现 Day30-Day32 已准备文件 | 支承点、控制阀和状态反馈在教学尺度可区分 | 只记录缺失和风险，不补做资产；后续按对应计划日制作或记录授权 |
| AR-006 | 限高障碍 | `heavy-transport-sim/public/models/day31/asset_ar006_height_limit_v001_placeholder.obj` | OBJ 占位 | 文件名符合 Day29 基名并明确 `_placeholder`；对象名 `ar006_height_limit_placeholder` 可读但建议后续与文件基名一致 | 建议 X=门架横向、Y=前进方向、Z=高度；当前包围盒显示高度疑似沿 Y 表达，需要后续统一为 Z 向上 | 统一 1 单位=1 米；净空高度不写死未发布案例参数 | 原点建议在门架地面投影中心，底部贴地 | 建议 `mat_ar006_frame_v001`、`mat_ar006_clearance_marker_v001`、`mat_ar006_height_sign_v001`；标识贴图必须项目自制 | Day33 不修改；后续需统一轴向或导入变换 | 已发现自制 OBJ 占位；非正式美术资产 | 障碍净空与车辆/货物高度关系可观察，不复制真实道路标识 | 当前可能存在 Y/Z 轴向不一致；无材质声明；Day34 才处理导出 |
| AR-007 | 圆弧弯道 | `heavy-transport-sim/public/models/day31/asset_ar007_arc_curve_v001_placeholder.obj` | OBJ 占位 | 文件名符合 Day29 基名并明确 `_placeholder`；对象名可读但建议后续与文件基名一致 | 建议 X/Y 为水平道路平面，Z 为高度；当前路面厚度沿 Z 表达，符合统一建议 | 统一 1 单位=1 米；半径和边界宽度由案例/规则配置绑定 | 原点建议在圆弧中心或路段测量基准点，并在元数据中注明 | 建议 `mat_ar007_road_v001`、`mat_ar007_inner_edge_v001`、`mat_ar007_outer_edge_v001`、`mat_ar007_measure_marker_v001` | Day33 不修改；后续可补充分组和材质 | 已发现自制 OBJ 占位；非正式美术资产 | 内外边界、转弯路径和测量参照可辨识 | 使用真实地图或第三方道路材质会产生版权风险；当前无材质声明 |
| AR-008 | 直角弯道 | `heavy-transport-sim/public/models/day31/asset_ar008_orthogonal_curve_v001_placeholder.obj` | OBJ 占位 | 文件名符合 Day29 基名并明确 `_placeholder`；对象名可读但建议后续与文件基名一致 | 建议 X/Y 为水平道路平面，Z 为高度；当前路面厚度沿 Z 表达，符合统一建议 | 统一 1 单位=1 米；入口/出口宽度由案例/规则配置绑定 | 原点建议在直角交点或测量基准点，并在元数据中注明 | 建议 `mat_ar008_road_v001`、`mat_ar008_corner_edge_v001`、`mat_ar008_path_marker_v001` | Day33 不修改；后续可补充分组和材质 | 已发现自制 OBJ 占位；非正式美术资产 | 直角边界、路径和测量参照可辨识 | 使用真实路口照片、地图数据或第三方材质存在版权风险；当前无材质声明 |
| AR-009 | 坡道 | `heavy-transport-sim/public/models/day31/asset_ar009_slope_v001_placeholder.obj` | OBJ 占位 | 文件名符合 Day29 基名并明确 `_placeholder`；对象名可读但建议后续与文件基名一致 | 建议 X=坡宽、Y=坡向、Z=高度；当前坡高沿 Z 表达，符合统一建议 | 统一 1 单位=1 米；坡度数值不得写死在模型中 | 原点建议在坡道下端中心或坡道几何中心，供测量工具引用 | 建议 `mat_ar009_slope_surface_v001`、`mat_ar009_direction_arrow_v001`、`mat_ar009_measure_ruler_v001` | Day33 不修改；后续可补充分组和材质 | 已发现自制 OBJ 占位；非正式美术资产 | 坡面、坡向和测量参照可辨识 | 未发布案例参数不得写入模型；当前无材质声明 |
| AR-010 | 桥梁及限载标志 | `heavy-transport-sim/public/models/day31/asset_ar010_bridge_v001_placeholder.obj`；`heavy-transport-sim/public/models/day31/asset_ar010_load_sign_v001_placeholder.obj` | OBJ 占位 | 文件名符合 Day29 基名并明确 `_placeholder`；对象名可读但建议后续与文件基名一致 | 桥梁建议 X=桥宽、Y=通行方向、Z=高度；桥梁高度沿 Z 表达。限载标志高度疑似沿 Y 表达，需后续统一为 Z 向上 | 统一 1 单位=1 米；限载值由案例/规则配置绑定，不写死未确认数值 | 桥梁原点建议在桥面中心地面投影；标志原点建议在杆底地面中心 | 建议 `mat_ar010_bridge_deck_v001`、`mat_ar010_pier_v001`、`mat_ar010_load_sign_v001`；标志贴图必须项目自制 | Day33 不修改；后续需统一标志轴向或导入变换 | 已发现 2 个自制 OBJ 占位；非正式美术资产 | 桥梁、通行区域、限载信息和路线复验关系可辨识；不表示真实桥梁结构验算 | 标志可能 Y/Z 轴向不一致；复制真实限载标志或桥梁外观存在权利风险 |
| AR-011 | 三条候选路线与基础场景 | `heavy-transport-sim/public/models/day31/asset_ar011_route_a_v001_placeholder.obj`；`heavy-transport-sim/public/models/day31/asset_ar011_route_b_v001_placeholder.obj`；`heavy-transport-sim/public/models/day31/asset_ar011_route_c_v001_placeholder.obj` | OBJ 占位 | 文件名符合 Day29 基名并明确 `_placeholder`；对象名可读但建议后续与文件基名一致 | 建议 X/Y 为水平路线平面，Z 为高度；当前路面厚度沿 Z 表达，符合统一建议 | 统一 1 单位=1 米；路线长度和障碍点由案例配置绑定 | 路线原点建议为起点基准或路线中心；三条路线必须采用同一基准口径 | 建议 `mat_ar011_route_a_v001`、`mat_ar011_route_b_v001`、`mat_ar011_route_c_v001`、`mat_ar011_start_end_marker_v001` | Day33 不修改；后续可补充分组、材质和路线元数据 | 已发现 3 个自制 OBJ 占位；非正式美术资产 | 三条路线身份、五类障碍位置、起点、终点和路线差异可区分 | 不得扩展为开放世界或真实地理场景；当前无材质声明 |
| AR-012 | 橡胶垫 | 未发现文件 | 未发现 | Day29 目标名为 `asset_ar012_rubber_pad_v001.glb`；当前无文件可检查 | 建议 X/Y 为垫片平面，Z 为厚度 | 统一 1 单位=1 米；工具以教学可辨识比例表达 | 原点建议在垫片中心底面，便于放置吸附 | 建议 `mat_ar012_rubber_pad_v001`；如有贴图使用 `tex_ar012_rubber_pad_basecolor_v001` | Day33 不修改；未发现文件 | 缺失；未发现 Day32 已准备文件 | 工具外观、名称和可用位置可独立识别 | 不补做 Day32 工具资产；不得使用第三方材质贴图，除非授权明确 |
| AR-013 | 梯子 | 未发现文件 | 未发现 | Day29 目标名为 `asset_ar013_ladder_v001.glb`；当前无文件可检查 | 建议 X=宽、Y=长、Z=高度/厚度，放置时保持 Z 向上 | 统一 1 单位=1 米；梯框与横档按教学可辨识比例表达 | 原点建议在梯子中心或底部中心，便于拾取和放置 | 建议 `mat_ar013_ladder_frame_v001`、`mat_ar013_ladder_step_v001` | Day33 不修改；未发现文件 | 缺失；未发现 Day32 已准备文件 | 与其他工具可独立识别和命名 | 第三方通用梯子模型存在授权风险；不补做 Day32 |
| AR-014 | 安全带 | 未发现文件 | 未发现 | Day29 目标名为 `asset_ar014_safety_belt_v001.glb`；当前无文件可检查 | 建议 X/Y 为展开平面，Z 为厚度；绑定姿态由交互控制 | 统一 1 单位=1 米；安全带形态以教学识别为主 | 原点建议在工具拾取中心或带体中心 | 建议 `mat_ar014_safety_belt_v001`、`mat_ar014_buckle_v001` | Day33 不修改；未发现文件 | 缺失；未发现 Day32 已准备文件 | 与钢丝绳、葫芦、衬垫可区分 | 第三方安全带模型存在授权风险；不补做 Day32 |
| AR-015 | 钢丝绳 | 未发现文件 | 未发现 | Day29 目标名为 `asset_ar015_wire_rope_v001.glb`；当前无文件可检查 | 建议曲线端点使用 X/Y/Z 世界坐标，Z 向上；绳索方向由端点决定 | 统一 1 单位=1 米；长度和角度由交互数据驱动 | 原点建议在绳索中点或局部端点，需与交互端点规范一致 | 建议 `mat_ar015_wire_rope_v001`、`mat_ar015_connector_v001`；程序材质优先 | Day33 不修改；未发现文件 | 缺失；未发现 Day32 已准备文件 | 绳索、连接点和布置方向可辨识 | 不补做 Day32；后续不能使用授权不明绳索模型或贴图 |
| AR-016 | 手拉葫芦/紧固葫芦 | 未发现文件 | 未发现 | Day29 目标名为 `asset_ar016_chain_block_v001.glb`；当前无文件可检查 | 建议 X=宽、Y=操作方向、Z=高度；链条可简化但需 Z 向下垂挂 | 统一 1 单位=1 米；按教学可辨识比例表达 | 原点建议在吊点或工具中心，需利于与钢丝绳连接 | 建议 `mat_ar016_chain_block_body_v001`、`mat_ar016_chain_v001`、`mat_ar016_hook_v001` | Day33 不修改；未发现文件 | 缺失；未发现 Day32 已准备文件 | 工具可识别、命名并与钢丝绳区分 | 第三方工业工具模型授权风险较高；不补做 Day32 |
| AR-017 | 防磨衬垫 | 未发现文件 | 未发现 | Day29 目标名为 `asset_ar017_anti_wear_pad_v001.glb`；当前无文件可检查 | 建议 X/Y 为衬垫平面，Z 为厚度 | 统一 1 单位=1 米；与 AR-012 保持垫类尺度口径但名称区分 | 原点建议在衬垫中心底面，便于贴附到接触位置 | 建议 `mat_ar017_anti_wear_pad_v001`；如有贴图使用 `tex_ar017_anti_wear_pad_basecolor_v001` | Day33 不修改；未发现文件 | 缺失；未发现 Day32 已准备文件 | 防磨衬垫与橡胶垫、绳索可区分 | 不补做 Day32；不得混用 AR-012 命名 |
| AR-018 | 正确/错误运输反馈动画资产 | 未发现文件 | 未发现 | Day29 目标名为 `asset_ar018_transport_feedback_success_v001.glb`、`asset_ar018_transport_feedback_fail_v001.glb`；当前无文件可检查 | 建议路径线和反馈标识使用 X/Y 水平平面、Z 高度；动画节点朝向与路线 +Y 口径一致 | 统一 1 单位=1 米；动画路径不替代规则判断 | 原点建议在路线起点或动画路径局部中心，并记录与 AR-011 的基准关系 | 建议 `mat_ar018_success_marker_v001`、`mat_ar018_fail_marker_v001`、`mat_ar018_path_line_v001` | Day33 不修改；未发现文件 | 缺失；当前未制作运输反馈动画资产 | 正确与错误结果可辨识；加载失败归技术异常，不改变规则判断 | 不提前制作 Day94/Day95 动画；不执行 Day34 导出；不新增真实运输场景类别 |
| AR-019 | 教学示意图与参数卡 | 未发现对应 AR-019 资源文件 | 未发现 | Day29 目标名为 `asset_ar019_icon_[name]_v001.svg`、`asset_ar019_diagram_[name]_v001.png`；当前未发现 AR-019 命名文件 | 若涉及 3D 示意，建议 X/Y/Z 与对应资产保持一致；二维图标无需三维坐标 | 位图按 Day29 预算；示意图单位和数值必须来自已确认来源 | 二维资源不适用三维原点；若为 3D 示意，原点按对象中心或教学锚点 | 建议 `mat_ar019_[semantic]_v001` 或 `tex_ar019_diagram_[semantic]_v001`；SVG 内部 id 不使用第三方品牌命名 | Day33 不修改；未发现文件 | 缺失；未发现 AR-019 命名示意图或参数卡资源 | 关键对象、名称、单位和来源可读；未确认值不得写入正式示意图 | 不复制第三方图标、真实标牌或未授权示意图；不提前补做教学资源 |

## 6. 命名、坐标、比例、原点、材质问题汇总

| 问题编号 | 涉及条目 | 问题 | Day33 处理 | 后续处理 |
|---|---|---|---|---|
| D33-NAME-001 | AR-001 至 AR-004、AR-006 至 AR-011 | 文件名符合占位命名，但正式目标应为 `.glb` 且去除 `_placeholder` | 记录为符合占位规范，不执行重命名 | Day34 导出 GLB 时按 Day29 正式命名生成 |
| D33-NAME-002 | AR-006 至 AR-011 | 部分 OBJ 对象名未完全使用文件基名形式，例如 `ar006_height_limit_placeholder` | 记录命名建议，不改文件 | 后续重建或导出时统一对象名、节点名和文件基名 |
| D33-AXIS-001 | AR-006、AR-010 load sign | 包围盒显示限高门架和限载标志高度疑似沿 Y 轴表达，与建议 Z 向上不一致 | 标记为需后续轴向统一，不改 OBJ | 后续在建模源文件或导入转换中统一 Z 向上 |
| D33-AXIS-002 | AR-001 至 AR-004、AR-007 至 AR-011 | 多数文件已体现 Z 高度或路面厚度，但尚无统一元数据声明 | 记录统一坐标建议 | 后续资产元数据或导出流程记录坐标系 |
| D33-SCALE-001 | 已发现全部 OBJ | 当前为教学占位几何，未声明真实米制单位 | 记录 1 单位=1 米建议 | 后续正式资产和导出流程统一 `scale=1` |
| D33-ORIGIN-001 | 已发现全部 OBJ | OBJ 无明确原点验收记录；只能从顶点包围盒推断 | 记录各类原点建议，不改文件 | 后续在建模工具中设置原点并记录验收截图或导入检查 |
| D33-MAT-001 | 已发现全部 OBJ | 未发现 `mtllib` 或 `usemtl` 声明 | 记录材质命名建议，不新增 MTL 或贴图 | 后续正式资产使用项目自制纯色/程序材质并按命名规范导出 |
| D33-MISSING-001 | AR-005、AR-012 至 AR-019 | 未发现资产文件；Day32 记录也未发现 | 只记录缺失，不补做对应天数任务 | 后续按对应计划日或资产审查处理 |

## 7. 版权、许可与 CR

| 项目 | Day33 结论 |
|---|---|
| 版权风险 | 已发现 OBJ 均为前序记录声明的项目自制简单几何占位资产，未发现外部模型、贴图、地图或标识文件进入 Day33 检查范围。第三方车辆、挂车、工业工具、道路材质、真实标志、地图数据、桥梁外观和教学图标仍存在潜在授权风险，未取得明确授权证据前不得作为正式资产。 |
| 商业授权声明 | 本日不声明已取得任何第三方商业授权；当前占位文件不代表正式美术资产或最终授权资产。 |
| CR | 未发现必须新增、删除或调整 G1 资产类别的情况，CR 列表为空。 |
| G1 外资产 | 未新增 G1 外资产类别；未补做 Day32 工具资产；未制作运输反馈动画或教学图标。 |

## 8. Day33 验证记录

| 验证项 | 结果 | 证据 |
|---|---|---|
| 检查了哪些文档 | 已检查 | 126天计划、G1资产需求基线、G1需求冻结评审记录、Day29清单、Day30记录、Day31记录、范围排除清单与变更流程；未发现 Day32 记录文件 |
| 覆盖了哪些 AR 条目 | 已覆盖 | AR-001 至 AR-019 均在第5节逐项记录；已有资产和缺失资产均有状态 |
| 检查了哪些资产目录 | 已检查 | `heavy-transport-sim/public/models/day30`、`heavy-transport-sim/public/models/day31`、`heavy-transport-sim/public/models`、`heavy-transport-sim/src/assets`、`figures`、`word_pdf_pages` |
| 是否存在版权风险 | 存在潜在外部素材风险 | 当前已发现 OBJ 未引入外部素材；正式资产若采购或复用第三方素材，需授权文件、许可记录和署名要求 |
| 是否存在 CR | 不存在 | 未新增、删除或调整 G1 冻结资产类别 |
| 是否修改资产文件 | 否 | 本日只创建 Day33 Markdown 记录，未修改 OBJ/GLTF/GLB/Blend/FBX/贴图文件 |
| 是否留待 Day34 处理 | 是 | GLB 导出、贴图压缩、正式体积验收、浏览器加载验收均留给 Day34 或后续对应任务 |
| 是否执行 Day34 或后续任务 | 否 | 未导出 GLB、未压缩贴图、未做浏览器性能优化、未接入三维场景 |
| 是否修改应用源码 | 否 | 未修改 `heavy-transport-sim/src` 文件 |
| 是否引入依赖 | 否 | 未修改依赖配置，未执行安装命令 |
| 是否连接 Supabase | 否 | 未执行 Supabase 连接、迁移、查询或远程命令 |
| 是否创建 PR | 否 | 未执行 PR 创建命令 |

## 9. Day33 结论

Day33 已完成 AR-001 至 AR-019 的坐标、比例、原点、材质和命名规范检查记录。当前已有资产覆盖 AR-001 至 AR-004、AR-006 至 AR-011；AR-005、AR-012 至 AR-019 未发现资产文件。已发现 OBJ 文件均非空、可读，基础 OBJ 结构可识别，但仍是自制占位资产，不代表正式美术资产。  

本日不修改模型文件，不执行 Day34 GLB 导出或贴图压缩，不做浏览器性能优化，不接入三维场景，不连接 Supabase，不修改应用源码，不引入依赖，不创建 PR。

## 10. Day32 追补后的追加检查记录

> 追加日期：2026-06-28  
> 追加原因：Day32 已追补 AR-012 至 AR-017 工具类 OBJ 占位资产。为保持 Day33 坐标、比例、原点、材质和命名检查链路完整，本节追加检查 Day32 工具资产。前文中 AR-012 至 AR-017 的“未发现文件”属于 Day32 追补前状态；本节为追补后的最新检查结果。

### 10.1 追加检查资产目录

| 目录 | 追加检查结果 |
|---|---|
| `heavy-transport-sim/public/models/day32` | 发现 AR-012 至 AR-017 的项目自制 OBJ 占位资产，共 6 个文件 |

### 10.2 追加 OBJ 基础结构摘要

| AR | 文件 | 顶点数 | 面数 | 对象/组 | 材质声明 | 包围盒摘要 | 结构结论 |
|---|---|---:|---:|---|---|---|---|
| AR-012 | `asset_ar012_rubber_pad_v001_placeholder.obj` | 16 | 8 | 对象名含 AR；组含橡胶垫主体和放置十字标记 | 无 `mtllib`/`usemtl` | x[-0.8,0.8] y[-0.45,0.45] z[0,0.11] | 文件非空、可读，OBJ 基础结构可识别 |
| AR-013 | `asset_ar013_ladder_v001_placeholder.obj` | 28 | 7 | 对象名含 AR；组含梯框和横档 | 无 `mtllib`/`usemtl` | x[-0.35,0.35] y[-1.6,1.6] z[0,0.04] | 文件非空、可读，OBJ 基础结构可识别 |
| AR-014 | `asset_ar014_safety_belt_v001_placeholder.obj` | 16 | 4 | 对象名含 AR；组含带体和扣具 | 无 `mtllib`/`usemtl` | x[-0.95,1.05] y[-0.2,0.46] z[0,0.04] | 文件非空、可读，OBJ 基础结构可识别 |
| AR-015 | `asset_ar015_wire_rope_v001_placeholder.obj` | 20 | 5 | 对象名含 AR；组含绳段和端点连接片 | 无 `mtllib`/`usemtl` | x[-1.35,1.35] y[-0.16,0.56] z[0,0.02] | 文件非空、可读，OBJ 基础结构可识别 |
| AR-016 | `asset_ar016_chain_block_v001_placeholder.obj` | 20 | 9 | 对象名含 AR；组含葫芦主体、吊钩和链条示意 | 无 `mtllib`/`usemtl` | x[-0.28,0.48] y[-0.2,0.2] z[-0.28,0.82] | 文件非空、可读，OBJ 基础结构可识别 |
| AR-017 | `asset_ar017_anti_wear_pad_v001_placeholder.obj` | 12 | 7 | 对象名含 AR；组含防磨衬垫板和接触标记 | 无 `mtllib`/`usemtl` | x[-0.55,0.55] y[-0.34,0.34] z[0,0.12] | 文件非空、可读，OBJ 基础结构可识别 |

### 10.3 AR-012 至 AR-017 追加统一检查结果

| 资产编号 | 资产名称 | 已发现文件路径 | 当前文件格式 | 命名规范符合情况 | 坐标轴规范建议 | 比例/单位规范建议 | 原点规范建议 | 材质/贴图命名规范建议 | 是否需要修改文件 | 当前状态 | 验收标准 | 风险与后续处理 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| AR-012 | 橡胶垫 | `heavy-transport-sim/public/models/day32/asset_ar012_rubber_pad_v001_placeholder.obj` | OBJ 占位 | 文件名符合 Day29 基名并明确 `_placeholder`；正式目标名为 `asset_ar012_rubber_pad_v001.glb` | 建议 X/Y 为垫片平面，Z 为厚度；当前厚度沿 Z 表达 | 统一 1 单位=1 米；占位尺寸只表达教学可辨识比例 | 原点建议在垫片中心底面，便于放置吸附 | 建议 `mat_ar012_rubber_pad_v001`；如有贴图使用 `tex_ar012_rubber_pad_basecolor_v001` | Day33 追加检查不修改文件 | 已发现自制 OBJ 占位；非正式美术资产 | 工具外观、名称和可用位置可独立识别 | 当前无材质声明；后续 Day34 追加导出 GLB |
| AR-013 | 梯子 | `heavy-transport-sim/public/models/day32/asset_ar013_ladder_v001_placeholder.obj` | OBJ 占位 | 文件名符合 Day29 基名并明确 `_placeholder`；正式目标名为 `asset_ar013_ladder_v001.glb` | 建议 X=宽、Y=长、Z=厚度/高度；当前长向沿 Y，厚度沿 Z 表达 | 统一 1 单位=1 米；梯框与横档按教学可辨识比例表达 | 原点建议在梯子中心或底部中心，便于拾取和放置 | 建议 `mat_ar013_ladder_frame_v001`、`mat_ar013_ladder_step_v001` | Day33 追加检查不修改文件 | 已发现自制 OBJ 占位；非正式美术资产 | 与其他工具可独立识别和命名 | 第三方通用梯子模型存在授权风险；当前无材质声明 |
| AR-014 | 安全带 | `heavy-transport-sim/public/models/day32/asset_ar014_safety_belt_v001_placeholder.obj` | OBJ 占位 | 文件名符合 Day29 基名并明确 `_placeholder`；正式目标名为 `asset_ar014_safety_belt_v001.glb` | 建议 X/Y 为展开平面，Z 为厚度；当前厚度沿 Z 表达 | 统一 1 单位=1 米；安全带形态以教学识别为主 | 原点建议在工具拾取中心或带体中心 | 建议 `mat_ar014_safety_belt_v001`、`mat_ar014_buckle_v001` | Day33 追加检查不修改文件 | 已发现自制 OBJ 占位；非正式美术资产 | 与钢丝绳、葫芦、衬垫可区分 | 第三方安全带模型存在授权风险；当前无材质声明 |
| AR-015 | 钢丝绳 | `heavy-transport-sim/public/models/day32/asset_ar015_wire_rope_v001_placeholder.obj` | OBJ 占位 | 文件名符合 Day29 基名并明确 `_placeholder`；正式目标名为 `asset_ar015_wire_rope_v001.glb` | 建议曲线端点使用 X/Y/Z 世界坐标，Z 向上；当前绳段在 X/Y 平面展开 | 统一 1 单位=1 米；长度和角度由后续交互数据驱动 | 原点建议在绳索中点或局部端点，需与交互端点规范一致 | 建议 `mat_ar015_wire_rope_v001`、`mat_ar015_connector_v001`；程序材质优先 | Day33 追加检查不修改文件 | 已发现自制 OBJ 占位；非正式美术资产 | 绳索、连接点和布置方向可辨识 | 后续正式交互中需支持动态长度和角度；当前无材质声明 |
| AR-016 | 手拉葫芦/紧固葫芦 | `heavy-transport-sim/public/models/day32/asset_ar016_chain_block_v001_placeholder.obj` | OBJ 占位 | 文件名符合 Day29 基名并明确 `_placeholder`；正式目标名为 `asset_ar016_chain_block_v001.glb` | 建议 X=宽、Y=操作方向、Z=高度；当前主体和链条高度沿 Z 表达 | 统一 1 单位=1 米；按教学可辨识比例表达 | 原点建议在吊点或工具中心，需利于与钢丝绳连接 | 建议 `mat_ar016_chain_block_body_v001`、`mat_ar016_chain_v001`、`mat_ar016_hook_v001` | Day33 追加检查不修改文件 | 已发现自制 OBJ 占位；非正式美术资产 | 工具可识别、命名并与钢丝绳区分 | 第三方工业工具模型授权风险较高；当前无材质声明 |
| AR-017 | 防磨衬垫 | `heavy-transport-sim/public/models/day32/asset_ar017_anti_wear_pad_v001_placeholder.obj` | OBJ 占位 | 文件名符合 Day29 基名并明确 `_placeholder`；正式目标名为 `asset_ar017_anti_wear_pad_v001.glb` | 建议 X/Y 为衬垫平面，Z 为厚度；当前厚度沿 Z 表达 | 统一 1 单位=1 米；与 AR-012 保持垫类尺度口径但名称区分 | 原点建议在衬垫中心底面，便于贴附到接触位置 | 建议 `mat_ar017_anti_wear_pad_v001`；如有贴图使用 `tex_ar017_anti_wear_pad_basecolor_v001` | Day33 追加检查不修改文件 | 已发现自制 OBJ 占位；非正式美术资产 | 防磨衬垫与橡胶垫、绳索可区分 | 不得混用 AR-012 命名；当前无材质声明 |

### 10.4 追加验证结论

| 验证项 | 结果 | 证据 |
|---|---|---|
| 追加覆盖条目 | 已覆盖 | AR-012 至 AR-017 均有 Day32 OBJ 占位资产和 Day33 追加检查记录 |
| 追加检查资产目录 | 已检查 | `heavy-transport-sim/public/models/day32` |
| 是否修改资产文件 | 否 | 本节只更新 Day33 Markdown 记录，未修改 OBJ/GLB/贴图资产文件 |
| 是否执行 Day34 或后续任务 | 否 | 本节仅为 Day33 追补检查记录；GLB 导出记录由 Day34 追加记录管理 |

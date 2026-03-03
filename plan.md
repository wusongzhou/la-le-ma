# 拉了吗 - 开发计划

> 一款记录排便时长和频率的轻量级移动应用

## 项目概述

- **应用名称**: 拉了吗
- **技术栈**: Expo (React Native) + TypeScript + SQLite
- **目标平台**: iOS / Android
- **数据存储**: 仅本地存储

---

## 功能需求

### 核心功能

- [x] 开始/结束计时记录
- [ ] 历史记录查看
- [ ] 统计分析（频率、平均时长、趋势图）
- [ ] 每日提醒（可选）

### 功能详情

| 功能 | 描述 | 状态 | 优先级 |
|------|------|------|--------|
| 计时器 | 一键开始/结束记录排便时长 | ⬜ 未开始 | P0 |
| 记录列表 | 按时间倒序显示历史记录 | ⬜ 未开始 | P0 |
| 统计面板 | 展示总次数、平均时长、周/月趋势 | ⬜ 未开始 | P1 |
| 备注功能 | 为单次记录添加备注 | ⬜ 未开始 | P2 |
| 数据导出 | 导出CSV/JSON格式数据 | ⬜ 未开始 | P3 |
| 提醒功能 | 定时提醒记录 | ⬜ 未开始 | P3 |

---

## 技术架构

```
la-le-ma/
├── app/                    # 页面路由 (Expo Router)
│   ├── index.tsx          # 首页 - 计时入口
│   ├── history.tsx        # 历史记录页
│   └── stats.tsx          # 统计分析页
├── components/            # 公共组件
├── db/                     # 数据库层
│   ├── database.ts        # 数据库初始化
│   └── repository.ts      # CRUD操作
├── hooks/                  # 自定义hooks
├── store/                  # Zustand状态管理
└── constants/              # 常量配置
```

---

## 数据库设计

### 表结构

```sql
-- 排便记录表
CREATE TABLE poop_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  start_time TEXT NOT NULL,      -- 开始时间 ISO格式
  end_time TEXT,                   -- 结束时间
  duration_seconds INTEGER,       -- 持续时长(秒)
  note TEXT,                       -- 备注
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## 开发进度

### Phase 1: 基础架构
- [x] 项目初始化 (Expo + TypeScript)
- [x] 依赖安装 (expo-sqlite, dayjs, zustand)
- [x] 数据库初始化和表创建
- [x] 基础CRUD操作封装

### Phase 2: 核心功能
- [x] 首页计时器UI
- [x] 计时逻辑实现
- [x] 记录保存功能

### Phase 3: 数据展示
- [x] 历史记录列表页
- [x] 统计分析页
- [ ] 数据可视化图表

### Phase 4: 优化完善
- [ ] UI美化
- [ ] 性能优化
- [ ] 测试与修复

---

## 更新日志

### 2026-03-03
- 项目初始化完成
- 安装核心依赖: expo-sqlite, dayjs, zustand
- 创建项目目录结构
- 完成数据库层开发 (database.ts, repository.ts, types.ts)
- 完成状态管理 (timerStore)
- 完成三个核心页面: 首页(计时)、历史记录、统计分析

---

## 备注

- 开发时使用 `npx expo start` 启动开发服务器
- 可通过 Expo Go 应用在手机上预览
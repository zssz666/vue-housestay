# 栖居 - 民宿预定管理系统 🏠

&lt;p align="center"&gt;
  &lt;img src="https://img.shields.io/badge/Vue-3.4+-green.svg" alt="Vue3" /&gt;
  &lt;img src="https://img.shields.io/badge/TypeScript-5.0+-blue.svg" alt="TypeScript" /&gt;
  &lt;img src="https://img.shields.io/badge/ElementPlus-2.5+-409EFF.svg" alt="Element Plus" /&gt;
  &lt;img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License" /&gt;
&lt;/p&gt;

&lt;p align="center"&gt;
  &lt;b&gt;基于 Vue3 + TypeScript 的现代化民宿预定平台&lt;/b&gt;&lt;br&gt;
  &lt;span style="color: #666; font-size: 14px;"&gt;毕业设计项目 | 成都东软学院 | 信息管理与信息系统&lt;/span&gt;
&lt;/p&gt;

&lt;p align="center"&gt;
  &lt;a href="#项目简介"&gt;项目简介&lt;/a&gt; •
  &lt;a href="#功能特性"&gt;功能特性&lt;/a&gt; •
  &lt;a href="#技术栈"&gt;技术栈&lt;/a&gt; •
  &lt;a href="#快速开始"&gt;快速开始&lt;/a&gt; •
  &lt;a href="#项目结构"&gt;项目结构&lt;/a&gt; •
  &lt;a href="#API接口"&gt;API接口&lt;/a&gt;
&lt;/p&gt;

---

## 📖 项目简介

**栖居 (Qiju)** 是一个面向民宿行业的在线预定管理系统，旨在解决传统民宿管理中房源信息分散、订单处理效率低、客户数据管理混乱等问题。系统采用 **前后端分离架构**，支持用户在线预订、房东便捷管理、平台运营监管三大核心场景。

本项目为成都东软学院信息管理与信息系统专业本科毕业设计，严格遵循软件工程开发规范，涵盖需求分析、系统设计、开发实现与测试部署全流程。

### 🎯 核心设计思想

- **用户体验优先**：响应式设计，支持 PC/平板/移动端无缝切换
- **模块化架构**：组件化开发，易于维护与扩展
- **数据驱动**：基于真实业务场景的数据模型设计
- **安全可靠**：JWT 身份认证，权限分级管理

---

## ✨ 功能特性

### 🙋 用户端 (C-End)
- [x] 智能搜索：支持地点、日期、人数多维度筛选
- [x] 房源浏览：高清图集、设施标签、地图定位
- [x] 在线预订：实时房态查询、价格明细、优惠券抵扣
- [x] 订单管理：全流程跟踪（待支付→待入住→已完成）
- [x] 评价系统：图文评价、房东回复、评分统计
- [x] 个人中心：收藏夹、发票管理、账号安全

### 🏠 房东端 (B-End)
- [x] 工作台看板：数据可视化、营收统计、待办提醒
- [x] 房源管理：发布编辑、房态日历、价格策略
- [x] 订单处理：确认/拒绝、入住核销、验房退房
- [x] 财务中心：收支明细、提现申请、资金流水
- [x] 客户沟通：即时消息、评价回复

### 🔧 平台管理端 (Admin)
- [x] 资质审核：房东入驻审核、房源发布审核
- [x] 纠纷仲裁：订单争议处理、退款判定
- [x] 数据运营：用户画像、交易统计、趋势分析
- [x] 系统配置：参数设置、公告管理、权限分配

---

## 🛠 技术栈

### 前端技术
| 技术 | 版本 | 说明 |
|------|------|------|
| **Vue** | 3.4+ | 渐进式 JavaScript 框架 |
| **TypeScript** | 5.0+ | 类型安全的 JavaScript 超集 |
| **Vite** | 5.0+ | 下一代前端构建工具 |
| **Vue Router** | 4.2+ | 官方路由管理器 |
| **Pinia** | 2.1+ | 状态管理（替代 Vuex） |
| **Element Plus** | 2.5+ | 桌面端组件库 |
| **Axios** | 1.6+ | HTTP 客户端 |
| **ECharts** | 5.4+ | 数据可视化图表 |
| **SCSS** | - | CSS 预处理器 |

### 设计规范
- **色彩系统**：主色 `#FF5A5F`（民宿红），背景 `#F7F7F7`
- **字体栈**：PingFang SC, Microsoft YaHei, -apple-system
- **响应式断点**：Desktop(≥1440px) / Tablet(≥768px) / Mobile(&lt;768px)

---

## 🚀 快速开始

### 环境要求
- Node.js ≥ 18.0
- npm ≥ 9.0 或 yarn ≥ 1.22

### 安装依赖
```bash
# 克隆项目
git clone https://github.com/yourusername/qiju-homestay.git

# 进入项目目录
cd qiju-homestay

# 安装依赖
npm install

# 或使用 yarn
yarn install

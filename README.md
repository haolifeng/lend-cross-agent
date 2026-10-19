# js-lendcross-agent

跨链借贷（`lendCross`）业务的链下 Agent 服务。

Agent 以常驻进程方式运行：监听 Wanchain 上游跨链合约产生的事件，落库去重后，按源链交易类型回放跨链交易到对应的 Parser 合约，完成跨链 mint 与 repay 的兑付。

> English version: [`README.en.md`](./README.en.md)

> 本仓库当前状态见「[运行链路与上手注意](#八运行链路与上手注意)」：`monitor` 的发交易代码与 `syncWanChain` 入库代码均处于注释状态，默认只做扫描与去重记账。

---

## 一、功能概述

| 能力 | 说明 |
| --- | --- |
| 区块同步 | 按配置的确认块数回滚窗口，增量拉取 `crossScAddr` 上的历史日志 |
| 事件解码入库 | 解析 `SmgMintLogger` / `SmgReleaseLogger`，按 `hashX` 幂等写入 `event` 集合 |
| 去重闸门 | 调用链上 `CrossCheck.checkUniqeID()` 判定 `uniqueID` 是否已处理，失败即中断（fail-closed） |
| 源链交易回放 | 依据源链交易类型分发到 `HandlerTxType0/1/2`，构造 `(nonce, gasLimit, to, value, data, v, r, s)` 载荷 |
| 链上兑付 | 由管理员钱包签名调用 `TypeNTxParser.handlerTxWanLend(...)`（当前注释未启用） |
| 状态机 | 成功兑付后以 compare-and-set 方式把 `event.status` 置为 `finished` |

支持的源链：ETH、AVAX、MOONBEAM（在 `crossInfoDict` 中配置，可按需扩展）。

---

## 二、环境要求

- **Node.js** 16+（代码使用 `BigInt`、`async/await`，在 Node 20 上验证通过）
- **MongoDB** 4.x+（默认连接 `mongodb://127.0.0.1:27017/lendcross`）
- 可访问的 **Wanchain RPC** 与各源链 RPC 节点

依赖安装后仍需确认以下三个「隐式依赖」已存在于 `node_modules` 中，因为它们被代码直接 `require`，但未声明在 `package.json`：

| 模块 | 被引用位置 | 建议 |
| --- | --- | --- |
| `bignumber.js` | `comm/lib.js` | 显式安装并补写进 `package.json` |
| `moment` | `comm/logger.js` | 同上 |
| `web3-eth-abi` | `contract/Contract.js` | 同上 |

```bash
npm install bignumber.js moment web3-eth-abi
```

---

## 三、安装

```bash
git clone https://github.com/haolifeng/lend-cross-agent.git
cd lend-cross-agent
npm install
```

---

## 四、配置

### 4.1 配置文件的选择

`config/moduleConfig.js` 依据入口处的 `global.testnet` 在主网/测试网配置之间切换：

```js
module.exports = testnet ? testModuleConfig : mainModuleConfig;
```

而 `global.testnet` 当前在 `index.js` 中硬编码为 `true`。切换网络需修改该常量，切勿带着测试网配置上生产。

配置文件承载的主要内容：

| 配置项 | 说明 |
| --- | --- |
| `dbUrl` | MongoDB 连接串 |
| `INTERVAL_TIME` | 主循环间隔（毫秒），必须大于 0 |
| `promiseTimeout` | RPC / DB 操作超时（毫秒） |
| `logServerUrl` / `logServerPort` | Syslog 接收端（UDP） |
| `chain.nodeUrl` | Wanchain RPC 地址 |
| `chain.SAFE_BLOCK_NUM` 等 | 确认数、回滚窗口、同步批次 |
| `CONTRACT.*` | 跨链代理、TokenManager 地址与 ABI |
| `crossLendScAddr.*` | CrossCheck / CrossLendMint / CrossLendRepay / Type0-2TxParser 地址与 ABI |
| `crossInfoDict` | 各源链的 `nodeUrl`、`chainID`、`transChainID` |

### 4.2 管理员钱包（务必阅读）

**钱包凭据绝不写入上述配置文件**，必须来自进程环境变量。`wallets/index.js` 在首次调用 `getAdminWallet()` 时惰性加载并缓存：

```bash
cp .env.example .env
```

在 `.env` 中二选一填写：

```bash
# 方式一（推荐）：独立生成的专用私钥
AGENT_PRIVATE_KEY=0x<64 位十六进制字符>

# 方式二：BIP39 助记词
AGENT_MNEMONIC="word1 word2 ... word12"
AGENT_MNEMONIC_PATH="m/44'/60'/0'/0/0"   # 可选，缺省即此值
```

未配置或格式非法时，进程会在启动阶段 fail-fast 退出，不会带着不可用钱包静默运行。

> `.env`、`.env.local` 等已在 `.gitignore` 中。**请勿**把真实凭据写进 `config/*.js`、`*.example` 或任何纳入版本控制的文件。

---

## 五、运行

确保 MongoDB 可连接后：

```bash
node index.js
```

`package.json` 未提供 `start` 脚本（现有 `test` 脚本为占位实现），直接执行入口文件即可。

启动时会依次完成：初始化日志 → 建立 MongoDB 连接 → 初始化 Wanchain RPC 客户端 → **校验管理员钱包** → 进入 `handlerMain` 轮询。

日志同时输出到控制台、Syslog（UDP）与 `log/lendCrossAgent.log`（按天轮转）。

---

## 六、目录结构

```
.
├── index.js                    入口：初始化全局对象并启动主循环
├── abi/                        合约 ABI（CrossDelegate / TokenManager / Type0-2TxParser / ERC20 等）
├── agent/
│   └── WanAgent.js             把解码后的跨链事件转换为数据库记录
├── chain/
│   ├── index.js                初始化 RPC、按块区间拉取事件、转交 WanAgent 入库
│   ├── WanChain.js             Wanchain JSON-RPC 封装
│   └── Web3Obj.js              源链（ETH/AVAX/MOONBEAM）交易查询封装
├── comm/
│   ├── lib.js                  通用工具（BigNumber、hex 处理、sleep、chainId → 符号）
│   └── logger.js               winston 日志封装
├── config/
│   ├── moduleConfig.js         依据 global.testnet 切换配置
│   ├── moduleConfig_main.js    主网配置
│   └── moduleConfig_test.js    测试网配置
├── contract/
│   └── Contract.js             ABI 事件解析与函数编码
├── db/
│   ├── index.js                mongoose 连接与事件监听
│   ├── dbAccess.js             带超时的 CRUD 封装
│   ├── modelOps.js             业务数据访问层
│   └── models/                 event / state 集合 Schema
├── monitor/
│   ├── index.js                主循环：扫描未完成记录并按交易类型分发
│   ├── handlerCrossCheck.js    uniqueID 去重查询
│   ├── handlerTxTypeBase.js    input 数据解码基类
│   ├── handlerTxType0/1/2.js   legacy / EIP-2930 / EIP-1559 交易处理
│   └── scObj/                  ethers 合约封装（CrossCheck、Type0-2TxParser）
├── utils/
│   └── timeoutPromise.js       带超时能力的 Promise 包装
├── wallets/
│   └── index.js                管理员钱包（环境变量注入，惰性加载）
├── .env.example                环境变量模板
└── log/                        运行日志
```

---

## 七、数据模型

### `event` 集合

按 `hashX` 唯一索引，是跨链请求的主体。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `hashX` | String | 主键，取自事件参数 `uniqueID` |
| `uniqueID` | String | 源链交易哈希，用于去重与拉取原始交易 |
| `crossLendScAddr` | String | CrossLendMint 或 CrossLendRepay 地址 |
| `toHtlcAddr` | String | 跨链代理合约地址 |
| `tokenAddr` | String | 底层代币地址 |
| `tokenPairID` | Number | 代币对 ID |
| `crossFromChainSymobl` | String | 源链符号（决定查询哪个源链 RPC） |
| `value` | String | 金额，以字符串存储以避免精度丢失 |
| `eventTxHash` / `eventBlockNumber` | String / Number | 上游事件所在交易与区块 |
| `lendTxhash` / `lendTxblockNumber` | String / Number | Agent 发出的兑付交易 |
| `eventName` | String | 事件名 |
| `timestamp` | Number | 事件时间戳 |
| `status` | String | `init` → `finished` |

### `state` 集合

按 `chainType` 记录 `scannedBlockNumber`，用于断点续扫。

---

## 八、运行链路与上手注意

### 8.1 两条链路

```
                上游跨链事件                      兑付回放
 ┌──────────────────────────────┐   ┌──────────────────────────────────┐
 │ syncChain    （当前注释未启用）│   │ handlerMain  （默认启用）        │
 │  拉取区块日志                  │   │  查未完成 event                  │
 │  → Contract.parseEvent        │   │  → CrossCheck.checkUniqeID       │
 │  → WanAgent 解码并入库        │   │  → 按 tx.type 选择 Handler        │
 │  → 更新 state 扫描高度        │   │  → 发交易（当前注释未启用）        │
 └──────────────────────────────┘   │  → markEventFinished             │
                                    └──────────────────────────────────┘
```

### 8.2 首次启用前必须确认

两处关键代码当前被注释，请明确你是否真的要打开：

1. **`index.js` 中的 `syncWanChain(...)`** —— 事件入库链路。不打开则 `event` 表不会新增数据，只能处理历史存量记录。
2. **`monitor/index.js` 中的 `handler.handler(getAdminWallet())`** —— 唯一的链上写操作。打开后 Agent 才开始用管理员钱包发交易。

### 8.3 已知缺陷（启用前强烈建议先修复）

| 位置 | 问题 |
| --- | --- |
| `monitor/handlerTxType0.js`、`handlerTxType1.js` | `BigNumber` 未 import，调用时必然 `ReferenceError`，且被 `catch` 静默吞掉返回 `undefined`，导致状态无法推进 |
| `agent/WanAgent.js` | `sha256` 未定义；多处 `require('../conf/moduleConfig.js')` 路径应为 `config` |
| `contract/Contract.js` | `getFuncSignature` 中 `'funciton'` 拼写错误，恒返回空数组 |
| `chain/Web3Obj.js`、`chain/WanChain.js` | 混用 web3 0.20 与 web3 1.2.9 的 Provider 构造方式，API 名字母大小写有误 |
| `config/moduleConfig_main.js` | 缺少 `crossLendScAddr` 的 ABI 字段与大部分 `crossInfoDict` 条目，直接切主网会失败 |
| `package.json` | `bip44-constants` 未锁版本（供应链风险）；缺少 `bignumber.js`、`moment`、`web3-eth-abi` 声明 |

---

## 九、安全须知

本进程持有可签署链上交易的私钥，请按以下要求部署：

1. **凭据管理**
   - 仅通过环境变量注入私钥/助记词，禁止写入配置文件或提交到 Git。
   - 历史版本曾把钱包助记词提交进过版本库。若沿用旧地址或怀疑泄露，请立即生成新钱包，并把下列合约的 `owner` 转出，同时确认旧地址权限已失效：
     `CrossCheck`、`CrossLendMint`、`CrossLendRepay`、`Type0TxParser`、`Type1TxParser`、`Type2TxParser`。
   - 建议再排查一次 Git 历史中是否残留凭据，必要时用 `git filter-repo` 清洗并强制推送。

2. **数据库**
   - 默认连接串无鉴权无 TLS（`db/index.js` 中 `?authSource=admin` 被注释）。请启用用户名密码与 TLS，切勿把 27017 端口暴露到公网——`event` 表可被直接篡改从而操纵跨链行为。

3. **日志**
   - Syslog 走 UDP 明文，且 `index.js` 日志级别为 `debug`，会把完整事件、账户、代币数据写入磁盘并外发。
   - `chain/WanChain.js` 中存在把原始签名交易体写进日志的分支，一旦启用等于持久化可重放交易。生产环境请关闭 `debug` 并移除相关输出。

4. **权限模型**
   - CrossCheck 与 Parser 合约上的 `setTokenManager`、`setTokenAddrPairs`、`setDependsContractAddr`、`setUniqueIDFinished` 等均为 owner-only，目前由同一把热钱包签名，没有多签、没有 timelock、没有金额熔断。建议：特权配置操作走多签 + Timelock，业务签名与管理签名使用不同密钥，并在 Agent 侧增加单笔/单日限额熔断。

5. **依赖与网络**
   - 锁定依赖版本并提交 lockfile；RPC 节点为公共 HTTPS 服务，重要业务建议自建节点并做请求限流。

---

## 十、常见问题

**进程启动后立即退出怎么办？**
检查 `AGENT_PRIVATE_KEY` / `AGENT_MNEMONIC` 是否已配置且格式正确，这是 fail-fast 校验失败的表现。同时确认 MongoDB 可连接，否则 `ModelOps` 会直接 `process.exit()`。

**为什么 `event` 表一直没有新数据？**
`syncWanChain` 在 `index.js` 中被注释，事件入库链路未运行。

**为什么记录反复被处理？**
检查是否存在以下情况：`checkUniqeID` 调用失败（fail-closed 会跳过而非继续执行）、`crossFromChainSymobl` 为空导致取不到源链交易，或 `hashX` 为空。日志中会打印对应的告警。

**如何验证配置正确性？**
先确认 `record.uniqueID` 能在对应源链 RPC 上查到交易，再确认 `CrossCheck.checkUniqeID()` 能正常返回布尔值，最后再考虑打开发交易开关。

---

## 十一、许可证

ISC

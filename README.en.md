# js-lendcross-agent

Off-chain agent service for the cross-chain lending (`lendCross`) business.

The agent runs as a long-lived process. It listens for events emitted by the upstream cross-chain contract on Wanchain, persists and de-duplicates them, then replays the source-chain transaction into the matching Parser contract to settle the cross-chain mint and repay.

> For the current state of this repository, see "[Execution flow and first-run notes](#8-execution-flow-and-first-run-notes)": both the transaction-sending code in `monitor` and the `syncWanChain` ingestion code are commented out, so out of the box the agent only performs scanning and de-duplication bookkeeping.

This is the English version. 中文版本：[`README.md`](./README.md).

---

## 1. Features

| Capability | Description |
| --- | --- |
| Block sync | Incrementally pulls historical logs from `crossScAddr` using a rollback window derived from the configured confirmation count |
| Event decoding and persistence | Parses `SmgMintLogger` / `SmgReleaseLogger` and upserts into the `event` collection keyed by `hashX` |
| Replay guard | Calls `CrossCheck.checkUniqeID()` on-chain to ask whether a `uniqueID` was already handled; any failure aborts the record (fail-closed) |
| Source-chain replay | Dispatches to `HandlerTxType0/1/2` by transaction type and builds the `(nonce, gasLimit, to, value, data, v, r, s)` payload |
| On-chain settlement | Signs `TypeNTxParser.handlerTxWanLend(...)` with the administrator wallet (currently commented out) |
| State machine | Marks `event.status` as `finished` after settlement using a compare-and-set update |

Supported source chains: ETH, AVAX, MOONBEAM (configured in `crossInfoDict`; extend as needed).

---

## 2. Requirements

- **Node.js** 16+ (the code uses `BigInt` and `async/await`; verified on Node 20)
- **MongoDB** 4.x+ (default connection is `mongodb://127.0.0.1:27017/lendcross`)
- Reachable **Wanchain RPC** endpoint plus RPC endpoints of every source chain

After installing dependencies, verify these three **undeclared dependencies** exist in `node_modules`. They are `require`d directly by the code but missing from `package.json`:

| Module | Referenced by | Recommendation |
| --- | --- | --- |
| `bignumber.js` | `comm/lib.js` | Install explicitly and add to `package.json` |
| `moment` | `comm/logger.js` | Same as above |
| `web3-eth-abi` | `contract/Contract.js` | Same as above |

```bash
npm install bignumber.js moment web3-eth-abi
```

---

## 3. Installation

```bash
git clone https://github.com/haolifeng/lend-cross-agent.git
cd lend-cross-agent
npm install
```

---

## 4. Configuration

### 4.1 Which config file is used

`config/moduleConfig.js` switches between the mainnet and testnet configs based on `global.testnet` set by the entry point:

```js
module.exports = testnet ? testModuleConfig : mainModuleConfig;
```

`global.testnet` is currently hard-coded to `true` in `index.js`. Switching networks requires editing that constant — never go to production with the testnet config loaded.

Settings carried by the config files:

| Key | Meaning |
| --- | --- |
| `dbUrl` | MongoDB connection string |
| `INTERVAL_TIME` | Main loop interval in milliseconds; must be greater than 0 |
| `promiseTimeout` | Timeout in milliseconds for RPC / DB operations |
| `logServerUrl` / `logServerPort` | Syslog receiver (UDP) |
| `chain.nodeUrl` | Wanchain RPC endpoint |
| `chain.SAFE_BLOCK_NUM` etc. | Confirmations, rollback window, sync batch size |
| `CONTRACT.*` | Cross-delegate and TokenManager addresses plus ABIs |
| `crossLendScAddr.*` | Addresses and ABIs of CrossCheck / CrossLendMint / CrossLendRepay / Type0-2TxParser |
| `crossInfoDict` | Per source chain `nodeUrl`, `chainID`, `transChainID` |

### 4.2 Administrator wallet (read carefully)

**Wallet credentials must never be written into the config files above.** They come from process environment variables. `wallets/index.js` loads them lazily and caches the result on the first `getAdminWallet()` call:

```bash
cp .env.example .env
```

Fill in one of the following options in `.env`:

```bash
# Option A (recommended): a dedicated private key generated elsewhere
AGENT_PRIVATE_KEY=0x<64 hex characters>

# Option B: BIP39 mnemonic
AGENT_MNEMONIC="word1 word2 ... word12"
AGENT_MNEMONIC_PATH="m/44'/60'/0'/0/0"   # optional, this is the default
```

If no credential is present or the format is invalid, the process exits during the fail-fast startup check rather than running silently with an unusable wallet.

> `.env` and `.env.local` are already covered by `.gitignore`. **Never** put real credentials into `config/*.js`, any `*.example` file, or any file under version control.

---

## 5. Running

Make sure MongoDB is reachable, then:

```bash
node index.js
```

`package.json` ships no `start` script (the existing `test` script is a placeholder), so run the entry file directly.

Startup order: init logger → open MongoDB connection → init the Wanchain RPC client → **validate the administrator wallet** → enter the `handlerMain` polling loop.

Logs go to the console, Syslog (UDP), and `log/lendCrossAgent.log` with daily rotation.

---

## 6. Project layout

```
.
├── index.js                    Entry point: initializes globals and starts the main loop
├── abi/                        Contract ABIs (CrossDelegate / TokenManager / Type0-2TxParser / ERC20 ...)
├── agent/
│   └── WanAgent.js             Converts decoded cross-chain events into database records
├── chain/
│   ├── index.js                Init RPC, fetch events by block range, hand off to WanAgent
│   ├── WanChain.js             Wanchain JSON-RPC wrapper
│   └── Web3Obj.js              Source chain (ETH/AVAX/MOONBEAM) transaction lookup wrapper
├── comm/
│   ├── lib.js                  Shared helpers (BigNumber, hex handling, sleep, chainId → symbol)
│   └── logger.js               winston logger wrapper
├── config/
│   ├── moduleConfig.js         Selects config based on global.testnet
│   ├── moduleConfig_main.js    Mainnet config
│   └── moduleConfig_test.js    Testnet config
├── contract/
│   └── Contract.js             ABI event decoding and function encoding
├── db/
│   ├── index.js                mongoose connection and its event listeners
│   ├── dbAccess.js             Timeout-aware CRUD wrapper
│   ├── modelOps.js             Business data access layer
│   └── models/                 event / state collection schemas
├── monitor/
│   ├── index.js                Main loop: scans unfinished records and dispatches by tx type
│   ├── handlerCrossCheck.js    uniqueID de-duplication query
│   ├── handlerTxTypeBase.js    Base class for input data decoding
│   ├── handlerTxType0/1/2.js   legacy / EIP-2930 / EIP-1559 transaction handling
│   └── scObj/                  ethers contract wrappers (CrossCheck, Type0-2TxParser)
├── utils/
│   └── timeoutPromise.js       Promise wrapper with timeout support
├── wallets/
│   └── index.js                Administrator wallet (env-var injected, lazily loaded)
├── .env.example                Environment variable template
└── log/                        Runtime logs
```

---

## 7. Data model

### `event` collection

Unique index on `hashX`; represents a single cross-chain request.

| Field | Type | Description |
| --- | --- | --- |
| `hashX` | String | Primary key, taken from the event argument `uniqueID` |
| `uniqueID` | String | Source chain transaction hash; used for de-duplication and fetching the raw tx |
| `crossLendScAddr` | String | CrossLendMint or CrossLendRepay address |
| `toHtlcAddr` | String | Cross-chain delegate contract address |
| `tokenAddr` | String | Underlying token address |
| `tokenPairID` | Number | Token pair ID |
| `crossFromChainSymobl` | String | Source chain symbol (decides which source chain RPC is queried) |
| `value` | String | Amount, stored as a string to avoid precision loss |
| `eventTxHash` / `eventBlockNumber` | String / Number | Transaction and block of the upstream event |
| `lendTxhash` / `lendTxblockNumber` | String / Number | Settlement transaction sent by the agent |
| `eventName` | String | Event name |
| `timestamp` | Number | Event timestamp |
| `status` | String | `init` → `finished` |

### `state` collection

Records `scannedBlockNumber` per `chainType` so scanning can resume after a restart.

---

## 8. Execution flow and first-run notes

### 8.1 Two pipelines

```
              upstream cross-chain events                    settlement replay
 ┌───────────────────────────────────────┐   ┌───────────────────────────────────────┐
 │ syncChain    (currently commented out)│   │ handlerMain  (enabled by default)     │
 │  fetch logs by block range            │   │  query unfinished events              │
 │  → Contract.parseEvent                │   │  → CrossCheck.checkUniqeID            │
 │  → WanAgent decodes and persists      │   │  → pick Handler by tx.type            │
 │  → advance state.scannedBlockNumber   │   │  → send tx (currently commented out)   │
 └───────────────────────────────────────┘   │  → markEventFinished                  │
                                             └───────────────────────────────────────┘
```

### 8.2 Confirm before enabling

Two critical blocks are commented out; decide explicitly whether you want them on:

1. **`syncWanChain(...)` in `index.js`** — event ingestion. Without it no new rows land in `event`, and only pre-existing records get processed.
2. **`handler.handler(getAdminWallet())` in `monitor/index.js`** — the only on-chain write. Enabling it is what makes the agent start signing transactions with the administrator wallet.

### 8.3 Known defects (fix before enabling)

| Location | Issue |
| --- | --- |
| `monitor/handlerTxType0.js`, `monitor/handlerTxType1.js` | `BigNumber` is never imported, so the call throws `ReferenceError`; the `catch` swallows it and returns `undefined`, leaving the record unable to advance |
| `agent/WanAgent.js` | `sha256` is undefined; several `require('../conf/moduleConfig.js')` paths should be `config` |
| `contract/Contract.js` | `'funciton'` typo in `getFuncSignature` makes it always return an empty array |
| `chain/Web3Obj.js`, `chain/WanChain.js` | Mixes web3 0.20 and web3 1.2.9 Provider construction, with wrong letter casing in the API name |
| `config/moduleConfig_main.js` | Missing ABI fields under `crossLendScAddr` and most `crossInfoDict` entries; switching to mainnet straight away will fail |
| `package.json` | `bip44-constants` is unpinned (supply-chain risk); `bignumber.js`, `moment`, `web3-eth-abi` are not declared |

---

## 9. Security notes

This process holds a private key that signs on-chain transactions. Deploy it as follows:

1. **Credential handling**
   - Inject the private key / mnemonic through environment variables only. Never write them into config files or commit them to Git.
   - A wallet mnemonic was committed to version control in a past revision of this repository. If you still use that address or suspect exposure, generate a fresh wallet immediately and transfer `owner` away from the old address across the following contracts, confirming the old address no longer holds any privilege:
     `CrossCheck`, `CrossLendMint`, `CrossLendRepay`, `Type0TxParser`, `Type1TxParser`, `Type2TxParser`.
   - Re-check Git history for leftover credentials and, if needed, purge it with `git filter-repo` followed by a force push.

2. **Database**
   - The default connection string has neither authentication nor TLS (`?authSource=admin` is commented out in `db/index.js`). Enable credentials and TLS, and never expose port 27017 publicly — the `event` collection can be tampered with directly to manipulate cross-chain behaviour.

3. **Logging**
   - Syslog runs over plaintext UDP, and `index.js` sets the log level to `debug`, writing full events, accounts and token data to disk and shipping them off-host.
   - `chain/WanChain.js` contains branches that log the raw signed transaction body. Enabling those persists replayable transactions. Turn off `debug` and remove such output in production.

4. **Privilege model**
   - `setTokenManager`, `setTokenAddrPairs`, `setDependsContractAddr`, `setUniqueIDFinished` and similar functions on CrossCheck and the Parser contracts are owner-only and are currently signed by the same hot wallet, with no multi-sig, no timelock and no amount circuit breaker. Recommended: route privileged configuration through multi-sig plus timelock, use separate keys for business signing and administration, and add per-transaction / daily limits inside the agent.

5. **Dependencies and network**
   - Pin dependency versions and commit the lockfile. RPC endpoints are public HTTPS services; for important workloads run your own nodes and rate-limit outbound requests.

---

## 10. FAQ

**The process exits right after startup. Why?**
Check that `AGENT_PRIVATE_KEY` / `AGENT_MNEMONIC` is set and well-formed — this is the fail-fast validation failing. Also confirm MongoDB is reachable, otherwise `ModelOps` calls `process.exit()` directly.

**Why is the `event` collection not receiving new rows?**
`syncWanChain` is commented out in `index.js`, so the ingestion pipeline is inactive.

**Why is a record being processed over and over?**
Look for one of these conditions: `checkUniqeID` failing (fail-closed makes the record skip instead of proceed), an empty `crossFromChainSymobl` preventing the source transaction lookup, or an empty `hashX`. Each case emits a corresponding warning in the logs.

**How do I validate my configuration?**
First confirm `record.uniqueID` resolves to a real transaction on that source chain RPC, then confirm `CrossCheck.checkUniqeID()` returns a boolean, and only afterwards consider turning on the transaction-sending switch.

---

## 11. License

ISC

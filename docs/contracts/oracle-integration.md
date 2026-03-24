# oracle-integration

## Public Methods

### `init`
```rust
pub fn init(env: Env, admin: Address, oracle_sources_config: Vec<Address>) -> Result<(), Error>
```

### `request_data`
```rust
pub fn request_data(env: Env, caller: Address, feed_id: BytesN<32>, request_id: BytesN<32>) -> Result<(), Error>
```

### `fulfill_data`
```rust
pub fn fulfill_data(env: Env, caller: Address, request_id: BytesN<32>, payload: Bytes, _proof: Bytes) -> Result<(), Error>
```

### `latest`
```rust
pub fn latest(env: Env, feed_id: BytesN<32>) -> Option<Bytes>
```

### `get_request`
```rust
pub fn get_request(env: Env, request_id: BytesN<32>) -> Option<OracleRequest>
```

## Errors (`Error`)

| Variant | When |
|--------|------|
| `AlreadyInitialized` | `init` called after successful init |
| `NotAuthorized` | `request_data` before init; `fulfill_data` when oracle source list is missing from instance storage |
| `RequestExists` | Same `request_id` submitted twice |
| `RequestNotFound` | `fulfill_data` for unknown `request_id` |
| `AlreadyFulfilled` | Second `fulfill_data` for the same request |
| `InvalidInput` | Empty oracle list at init; zero `feed_id` or `request_id`; empty fulfillment payload |
| `OracleNotWhitelisted` | `fulfill_data` caller not in the configured oracle address list |
| `Overflow` | Defensive: TTL renewal arithmetic under an implausible `max_ttl` (not hit in default test ledger) |

## Tests

Integration-style unit tests live in `contracts/oracle-integration/src/test.rs`. They use `setup_initialized` (register → `init` with two whitelisted oracles) plus small helpers for 32-byte ids. Contract errors are asserted via `try_*` client methods (`Err(Ok(Error::…))` on failure, `Ok(Ok(()))` on success).


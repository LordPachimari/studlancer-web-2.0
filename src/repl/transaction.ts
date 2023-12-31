import { JSONObject, JSONValue, WriteTransaction } from "replicache";
import {
  delItems,
  delPermItems,
  putItems,
  putRedisItems,
  restoreItems,
  updateItems,
} from "./data";

const DELETE = "DELETE" as const;
const PERM_DELETE = "PERM_DELETE" as const;
const PUT = "PUT" as const;
const UPDATE = "UPDATE" as const;
const RESTORE = "RESTORE";
const REDIS_PUT = "REDIS_PUT";
declare type ReadonlyJSONValue =
  | null
  | string
  | boolean
  | number
  | ReadonlyArray<ReadonlyJSONValue>
  | ReadonlyJSONObject;
declare type ReadonlyJSONObject = {
  readonly [key: string]: ReadonlyJSONValue;
};
interface CustomWriteTransaction {
  put({ key, value }: { key: string; value: JSONObject }): void;
  /**
   * Removes a `key` and its value from the database. Returns `true` if there was a
   * `key` to remove.
   */
  redisPut({ key, value }: { key: string; value: string }): void;
  del({ key }: { key: string }): void;
  update({ key, value }: { key: string; value: JSONObject }): void;
  permDel({ key }: { key: string }): void;
  restore({ key }: { key: string }): void;
}

export class ReplicacheTransaction implements CustomWriteTransaction {
  private readonly _spaceID: string;
  private readonly _cache: Map<
    string,
    {
      method:
        | typeof PUT
        | typeof REDIS_PUT
        | typeof DELETE
        | typeof PERM_DELETE
        | typeof UPDATE
        | typeof RESTORE;
      value?: JSONObject | string;
      PK?: string;
    }
  > = new Map();
  private readonly _userId: string;

  constructor(spaceID: string, userId: string) {
    this._spaceID = spaceID;
    this._userId = userId;
  }

  put({ key, value, PK }: { PK?: string; key: string; value: JSONObject }) {
    this._cache.set(key, { method: PUT, value, ...(PK && { PK }) });
  }
  redisPut({ key, value }: { key: string; value: string }) {
    this._cache.set(key, { method: REDIS_PUT, value });
  }

  update({ key, value, PK }: { PK?: string; key: string; value: JSONObject }) {
    this._cache.set(key, { method: UPDATE, value, ...(PK && { PK }) });
  }
  del({ key }: { key: string }) {
    this._cache.set(key, { method: DELETE });
  }
  restore({ key }: { key: string }) {
    this._cache.set(key, { method: RESTORE });
  }
  permDel({ key }: { key: string }) {
    this._cache.set(key, { method: PERM_DELETE });
  }

  // TODO!
  //   async isEmpty(): Promise<boolean> {
  //     throw new Error("Method isEmpty not implemented");
  //   }
  //   scan(): ScanResult<string>;
  //   scan<Options extends ScanOptions>(
  //     _options?: Options,
  //   ): ScanResult<KeyTypeForScanOptions<Options>> {
  //     throw new Error("Method scan not implemented.");
  //   }

  async flush(): Promise<void> {
    const items = [...this._cache.entries()].map((item) => item);
    if (items.length === 0) {
      return;
    }

    const itemsToPut: {
      PK?: string;
      key: string;
      value: JSONObject;
    }[] = [];
    const redisItemsToPut: {
      [key: string]: unknown;
    } = {};
    const itemsToUpdate: {
      PK?: string;
      key: string;
      value: JSONObject;
    }[] = [];
    const keysToDel: string[] = [];
    const keysToPermDelete: string[] = [];
    const keysToRestore: string[] = [];
    for (const item of items) {
      if (item[1].method === PUT && item[1].value) {
        itemsToPut.push({
          key: item[0],
          value: item[1].value as JSONObject,
          ...(item[1].PK && { PK: item[1].PK }),
        });
      } else if (item[1].method === DELETE) {
        keysToDel.push(item[0]);
      } else if (item[1].method === UPDATE && item[1].value) {
        itemsToUpdate.push({
          key: item[0],
          value: item[1].value as JSONObject,
          ...(item[1].PK && { PK: item[1].PK }),
        });
      } else if (item[1].method === PERM_DELETE) {
        keysToPermDelete.push(item[0]);
      } else if (item[1].method === RESTORE) {
        keysToRestore.push(item[0]);
      } else if (item[1].method === REDIS_PUT && item[1].value) {
        redisItemsToPut[item[0]] = item[1].value;
      }
    }

    await Promise.all([
      delItems({
        keysToDel,
        spaceId: this._spaceID,
        userId: this._userId,
      }),
      delPermItems({
        keysToDel: keysToPermDelete,
        spaceId: this._spaceID,
        userId: this._userId,
      }),
      restoreItems({
        keysToDel: keysToRestore,
        spaceId: this._spaceID,
      }),

      putItems({
        items: itemsToPut,
        spaceId: this._spaceID,
      }),
      putRedisItems({ items: redisItemsToPut }),
      updateItems({
        items: itemsToUpdate,
        spaceId: this._spaceID,
      }),
    ]);
    this._cache.clear();
  }
}

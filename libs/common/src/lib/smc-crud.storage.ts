export class SmcNestCrudStorageHost {
  private static storage = new Map<
    string,
    { property: string; action: SmcCrudActionEnum[] }[]
  >();

  get(className: string) {
    return SmcNestCrudStorageHost.storage.get(className);
  }

  add(className: string, propertyKey: string, exclude: SmcCrudActionEnum[]) {
    const storage = SmcNestCrudStorageHost.storage.get(className) || [];
    SmcNestCrudStorageHost.storage.set(
      className,
      storage.concat({ property: propertyKey, action: exclude }),
    );
  }
}

const symbol = Symbol.for("SmcNestCrudStorageHost");

const globalRef = global as any;
export const SmcNestCrudStorage: SmcNestCrudStorageHost =
  globalRef[symbol] || (globalRef[symbol] = new SmcNestCrudStorageHost());

export enum SmcCrudActionEnum {
  ReadAll = "Read-All",
  ReadOne = "Read-One",
  CreateOne = "Create-One",
  CreateMany = "Create-Many",
  UpdateOne = "Update-One",
  ReplaceOne = "Replace-One",
  DeleteOne = "Delete-One",
  ALL = "ALL",
}

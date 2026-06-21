import {
  QueryJoin,
  SCondition,
  SConditionAND,
  SField,
  SFields,
} from '@peoplex/crud-request/';
import {
  CreateManyDto,
  CrudRequest,
  CrudService,
  UpdateManyDto,
} from '@peoplex/crud';
import { SFieldOperator } from '@peoplex/crud-request/';
import {
  cloneDeep,
  compact,
  isArray,
  isEmpty,
  isFunction,
  isNull,
  isObject,
  isPlainObject,
  isString,
  isUndefined,
  keys,
  map,
  mapValues,
} from 'lodash';
import { ObjectId } from 'mongodb';
import mongoose, { Model, PopulateOptions, Types } from 'mongoose';
import { SmcCrudActionEnum, SmcNestCrudStorage } from './smc-crud.storage';

const mapValuesDeep = (obj: any, fn: any, key?: string | number): any => {
  if (
    obj instanceof ObjectId ||
    obj instanceof mongoose.Schema.Types.ObjectId ||
    obj instanceof mongoose.Types.ObjectId ||
    obj instanceof Types.ObjectId
  ) {
    obj = obj.toString();
    return obj;
  }

  return isArray(obj)
    ? map(obj, (innerObj, idx) => mapValuesDeep(innerObj, fn, idx))
    : isPlainObject(obj)
      ? mapValues(obj, (val, key) => mapValuesDeep(val, fn, key))
      : isObject(obj)
        ? obj
        : fn(obj, key);
};

export class MongooseCrudService<T> extends CrudService<T> {
  constructor(public model: Model<T>) {
    super();
  }

  processSCondition(s: SCondition): any {
    const condition = s as any;
    keys(condition).forEach((k: any) => {
      const v = condition[k];
      switch (k) {
        case '$and':
        case '$or':
          condition[k] = compact(
            (v as SCondition[])
              .filter((c) => {
                if (isUndefined(c) || isNull(c)) {
                  return false;
                }
                if (isArray(c)) {
                  return true;
                }
                return !isObject(c) || Object.keys(c).length > 0;
              })
              .map((c) => {
                return this.processSCondition(c);
              }),
          );

          if (isEmpty(condition[k])) delete condition[k];

          break;

        case '$text':
          if (v) condition[k] = { $search: v };
          else delete condition[k];
          break;

        default:
          condition[k] = this.processSField(v);
      }
    });

    return isEmpty(condition) ? undefined : condition;
  }

  processSField(s: SField | Array<SFields | SConditionAND> | undefined): any {
    if (isUndefined(s)) return undefined;
    if (isArray(s)) {
      return s.forEach((v) => {
        this.processSCondition(v);
      });
    }
    if (isPlainObject(s)) {
      let sOperator = s as any;
      sOperator = this.processSFieldOperator(sOperator);
      return isEmpty(sOperator) ? undefined : sOperator;
    }
    return s;
  }

  buildQueryAggregate(req: CrudRequest, method?: SmcCrudActionEnum) {
    const { id, where, options } = this.buildQuery(req, method);

    return {
      id: id,
      where: this.transformWhereForAggregate(where),
      options: options,
    };
  }

  private transformWhereForAggregate(where: any) {
    if (isObject(where as any)) {
      const keys = Object.keys(where);

      for (const key of keys) {
        if (isArray(where[key])) {
          for (let i = 0; i < where[key].length; i++) {
            const item = where[key][i];
            const rs = this.transformWhereForAggregate(item);

            if (rs) {
              where[key][i] = rs;
            }
          }
        } else if (isObject(where[key])) {
          where[key] = this.transformWhereForAggregate(where[key]);
        } else {
          if (this.checkObjectId(where[key])) {
            where[key] = new Types.ObjectId(where[key]?.toString());
          } else if (this.isDate(where[key]?.toString())) {
            where[key] = new Date(where[key]?.toString());
          }
        }
      }
    } else {
      if (where === null) {
        return where;
      } else if (this.checkObjectId(where)) {
        where = new Types.ObjectId(where.toString());
      } else if (this.isDate(where.toString())) {
        where = new Date(where.toString());
      }
    }

    return where;
  }

  private isDate(value: any) {
    const regex = new RegExp(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    const rs = regex.test(value);

    return rs;
  }

  convertOperator(s: SFieldOperator, operator: string) {
    const value = (s as any)[operator];
    let cond: Record<string, any> | null = null;

    switch (operator) {
      case '$eq':
        cond = { $eq: value };
        break;
      case '$ne':
        cond = { $ne: value };
        break;
      case '$gt':
        cond = { $gt: value };
        break;
      case '$gte':
        cond = { $gte: value };
        break;
      case '$lt':
        cond = { $lt: value };
        break;
      case '$lte':
        cond = { $lte: value };
        break;
      case '$in':
        cond = { $in: value };
        break;
      case '$isnull':
        cond = value ? { $eq: null } : { $ne: null };
        break;
      case '$between':
        cond = { $gte: value[0], $lte: value[1] };
        break;
      case '$cont':
        cond = { $regex: this.escapeRegExp(value as string), $options: 'i' };
        break;
      default:
        cond = { [operator]: value };
        break;
    }

    return cond;
  }

  escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  processSFieldOperator(s: SFieldOperator) {
    const keysFind = keys(s) as any[];
    return keysFind.reduce((acc, k) => {
      const c = this.convertOperator(s, k as keyof SFieldOperator);
      return { ...acc, ...c };
    }, {});
  }

  findCheckPublic(search: SCondition) {
    let checkPublic: any[] = [];
    const searchObj = search as any;

    keys(searchObj).forEach((k) => {
      const v = searchObj[k];

      switch (k) {
        case '$and':
          checkPublic = checkPublic.concat(
            ...((v as SCondition[]).map((c) => this.findCheckPublic(c)) ?? []),
          );
          break;
        case '$or':
          checkPublic = checkPublic.concat(
            ...((v as SCondition[]).map((c) => this.findCheckPublic(c)) ?? []),
          );
          break;
        case '$checkPublic':
          checkPublic.push(v);

          break;
        default:
          break;
      }
    });
    if (checkPublic.length === 0) {
      return null;
    } else {
      this.deleteFilter(search, '$checkPublic').then();
    }
    return checkPublic;
  }

  buildQuery(crudRequest: CrudRequest, method?: SmcCrudActionEnum) {
    const req = cloneDeep(crudRequest);
    const parsed = req?.parsed ?? {};
    const {
      limit = 10,
      page = 1,
      fields = [],
      join = [],
      paramsFilter = [],
      search = {},
      authPersist,
    } = parsed;
    let { offset: skip = 0, filter = [], sort = [] } = parsed;

    const checkPublicFormReq = this.findCheckPublic(search);

    const user = this.formatDocument<any>(authPersist);
    const { checkPublic, standalone, allowAll } = user ?? {};
    delete user?.checkPublic;

    if (user) {
      const userProperties = this.mappingUserToArray(
        user['user'] ? user['user'] : user,
      );
      user['userProperties'] = userProperties;
    }

    if (search.$and) {
      search.$and = compact(search.$and);
    }

    if (search.$or) {
      search.$or = compact(search.$or);
    }

    const joinOptions: QueryJoin[] = [];
    const populateOptions: PopulateOptions[] = [];

    keys(req.options.query!.join).forEach((v) => {
      const value = req.options.query!.join![v];
      if (value.eager === true) {
        joinOptions.push({ field: v, select: value.allow ?? [] });
      }
    });

    join.concat(joinOptions).map((v: any) => {
      populateOptions.push({
        path: v.field,
        select: v.select?.join(' '),
      });
      return v;
    });

    if (page > 1) {
      skip = (page - 1) * limit;
    }

    if (!skip) {
      skip = 0;
    }

    filter = [...filter, ...paramsFilter];

    filter.forEach((f) => {
      const v: any = {};

      v[f.operator] = f.value;
      (search as SFields)[f.field] = v;
    });

    const defaultCond: SCondition = {
      $and: [],
    };

    if (standalone === false) {
      defaultCond?.$and?.push({
        $or: [{ tenant: user.tenant }, { tenant: { $exists: false } }],
      });
    }

    const publicCond: any = {
      $or: [{ isPublic: true }],
    };

    if (checkPublic?.length > 0) {
      checkPublic.forEach((v: any) => {
        const { field, operator } = v;

        const { value } = v;
        let userValue: any = '';

        if (isString(value)) {
          userValue = user[value];
        } else if (isObject(value)) {
          userValue = this.mappingCheckPublic(cloneDeep(value), user);
        }

        publicCond.$or.push({ [field]: { [operator]: userValue } });
      });
    }

    if (checkPublicFormReq && checkPublicFormReq?.length > 0) {
      checkPublicFormReq.forEach((v) => {
        publicCond.$or.push(v);
      });
    }

    if (allowAll) {
      publicCond?.$or?.push({ _id: { $ne: null } });
    }

    defaultCond?.$and?.push(publicCond);
    search.$and?.push(defaultCond);

    const where = this.processSCondition(search);

    const softDelete = req?.options?.query?.softDelete?.toString() === 'true';
    if (softDelete) {
      const softDeleteCond = {
        $or: [{ __isDeleted: { $exists: false } }, { __isDeleted: false }],
      } as SCondition;
      where?.$and?.push(softDeleteCond);
    }

    let selectQuery = Array.from<string>(
      new Set([...(req.options.query?.allow ?? []), ...fields]),
    );

    const exclude = !selectQuery.length;

    if (exclude) {
      (req.options.query?.exclude ?? []).forEach((v) => {
        selectQuery.push(`-${v}`);
      });
    }

    if (exclude) {
      SmcNestCrudStorage.get(this.model.modelName)?.forEach((v) => {
        if (
          v.action.includes(SmcCrudActionEnum.ALL) ||
          v.action.includes(method as any)
        ) {
          selectQuery.push(`-${v.property}`);
        }
      });
    }

    if (!sort || sort.length === 0) {
      sort = req.options?.query?.sort ?? [];
    }

    const listPopulate = selectQuery.filter((v) => {
      return populateOptions.find((p) => {
        return v.startsWith(p.path);
      });
    });

    listPopulate.forEach((v) => {
      const split = v.split('.');

      const field = split[0];
      const nested = split.slice(1).join('.');

      const splitPopulateOptions = populateOptions
        .find((p) => {
          return v.startsWith(p.path);
        })
        ?.path?.split('.');

      selectQuery = selectQuery.filter((s) =>
        (splitPopulateOptions?.length ?? 0) > 1
          ? !s.startsWith(v)
          : !s.startsWith(field),
      );

      const check = populateOptions.find((v) => v.path === field);
      if (check) {
        if (!isArray(check.select)) {
          check.select = [check.select];
        }
        check.select = [...check.select, nested];
        check.select = check.select
          .filter((element: any, index: any) => {
            return check.select.indexOf(element) === index;
          })
          .filter((v: any) => v);
      }
    });

    const language =
      (authPersist?.language as string)?.split('-')?.shift() ?? 'vi';

    const options = {
      page,
      skip,
      limit,
      sort: sort.reduce(
        (acc, v) => ((acc[v.field] = v.order === 'ASC' ? 1 : -1), acc),
        {} as any,
      ),
      populate: populateOptions,
      select: [...new Set(selectQuery)].join(' '),
      collation: { locale: language },
    };

    const idParam = paramsFilter.find(
      (v) => v.field === 'id' || v.field === '_id',
    );

    if (idParam) {
      if (!this.checkObjectId(idParam.value) && idParam.operator !== '$in') {
        throw this.throwBadRequestException('Invalid id');
      }
      if (idParam.operator === '$in') {
        if (!isArray(idParam.value)) {
          throw this.throwBadRequestException('Invalid id');
        }
        idParam.value.forEach((v) => {
          if (!this.checkObjectId(v)) {
            throw this.throwBadRequestException('Invalid id');
          }
        });
      }
    }

    return { options, where, id: idParam ? idParam.value : null };
  }

  private mappingUserToArray(obj: any) {
    const fields: string[] = [];
    for (const key in obj) {
      if (isFunction(obj[key])) {
        continue;
      } else if (isArray(obj[key])) {
        switch (key) {
          case 'tags':
            {
              let tags = '';

              obj[key].forEach((v, i) => {
                v = v.toString();
                if (i === 0) {
                  tags += `${v}`;
                } else {
                  tags += `,${v}`;
                }
              });
              fields.push(`${key}:${tags}`);
            }
            break;
          case 'groups':
            {
              const groups = obj[key];
              groups.forEach((v) => {
                const rs = this.mappingUserToArray(v);

                rs.forEach((vrs) => {
                  fields.push(`groups.${vrs?.toString()}`);
                });
              });
            }
            break;
        }
      } else if (isObject(obj[key])) {
        this.mappingUserToArray(obj[key]).forEach((v) => {
          fields.push(`${key}.${v?.toString()}`);
        });
      } else {
        fields.push(`${key}:${obj[key]?.toString()}`);
      }
    }

    return fields;
  }

  private mappingCheckPublic(value: any, user: any): any {
    if (isArray(value)) {
      return value.map((v) => this.mappingCheckPublic(v, user));
    } else if (isObject(value)) {
      const valObj = value as any;
      for (const key in valObj) {
        if (isString(valObj[key])) {
          valObj[key] = user[valObj[key]]?.toString() ?? valObj[key];
        } else if (isObject(valObj[key])) {
          valObj[key] = this.mappingCheckPublic(valObj[key], user);
        }
      }
    } else {
      value = user[value]?.toString();
    }

    return value;
  }

  checkObjectId(id: any) {
    if (!id) {
      return false;
    }
    if (
      (!ObjectId.isValid(id.toString()) &&
        !mongoose.Types.ObjectId.isValid(id.toString()) &&
        !Types.ObjectId.isValid(id.toString())) ||
      id?.length !== 24
    ) {
      return false;
    }
    return true;
  }

  buildQueryOld(req: CrudRequest) {
    this.buildQuery(req);

    const {
      limit = 10,
      page = 1,
      filter = [],
      fields = [],
      sort = [],
      paramsFilter = [],
      search = [],
    } = req.parsed ?? {};
    let { offset: skip = 0, join = [] } = req.parsed ?? {};
    if (page > 1) {
      skip = (page - 1) * limit;
    }

    const joinOptions: QueryJoin[] = [];

    keys(req.options.query!.join).forEach((v) => {
      const value = req.options.query!.join![v];
      if (value.eager === true) {
        joinOptions.push({ field: v });
      }
    });

    join = [...join, ...joinOptions];

    const options = {
      page,
      skip,
      limit,
      sort: sort.reduce(
        (acc, v) => ((acc[v.field] = v.order === 'ASC' ? 1 : -1), acc),
        {} as any,
      ),
      populate: join.map((v) => v.field).join(' '),
      select: fields.join(' '),
    };

    const searches = (search as any).$and!.reduce((acc: any, v: any) => {
      const field = v as SFields;
      const where = keys(field).map((key) => {
        const value = field[key];
        const f = key;
        const o = keys(value)[0];
        const v = (value! as SFields)[o];
        return { field: f, operator: o, value: v };
      });
      return [...acc, ...where];
    }, [] as any);

    const where = [...filter, ...searches].reduce(
      (acc, { field, operator, value }) => {
        let cond: any = {};
        switch (operator as keyof SFieldOperator) {
          case '$eq':
            cond = value;
            break;
          case '$ne':
            cond = { $ne: value };
            break;
          case '$gt':
            cond = { $gt: value };
            break;
          case '$gte':
            cond = { $gte: value };
            break;
          case '$lt':
            cond = { $lt: value };
            break;
          case '$lte':
            cond = { $lte: value };
            break;
          case '$in':
            cond = { $in: value };
            break;
          case '$notin':
            cond = { $nin: value };
            break;
          case '$isnull':
            cond = value ? { $eq: null } : { $ne: null };
            break;
          case '$between':
            cond = { $gte: value[0], $lte: value[1] };
            break;
          case '$and':
            cond = { $and: value };
            break;
          case '$or':
            cond = { $or: value };
            break;

          default:
            break;
        }

        acc[field] = cond;
        return acc;
      },
      {} as any,
    );

    const idParam = paramsFilter.find((v) => v.field === 'id');
    return { options, where, id: idParam ? idParam.value : null };
  }

  async deleteFilter(where: any, keyDelete: string) {
    let check = false;
    if (isArray(where)) {
      for (const item of where) {
        this.deleteFilter(item, keyDelete);
      }
    } else {
      for (const key in where) {
        if (isArray(where[key])) {
          for (const item of where[key]) {
            const rs = await this.deleteFilter(item, keyDelete);

            if (rs) {
              const index = where[key].indexOf(item, 0);
              if (index > -1) {
                where[key].splice(index, 1);
              }
            }
          }

          if (isEmpty(where[key])) {
            delete where[key];
          }
        } else if (typeof where[key] === 'object' && key !== keyDelete) {
          await this.deleteFilter(where[key], keyDelete);
        } else if (key === keyDelete) {
          delete where[key];
          check = true;
        }
      }
    }

    return check;
  }

  formatDocument<C = T>(d: any): C {
    if (!d) {
      return d;
    }

    let obj = d;

    if (typeof d?.toObject === 'function') {
      obj = d.toObject();
    }

    const data = mapValuesDeep(obj, (v: any) => {
      return v;
    });
    obj.id = obj._id;
    return data as C;
  }

  async getMany(req: CrudRequest) {
    const { options, where } = this.buildQuery(req, SmcCrudActionEnum.ReadAll);

    const softDeleteCond = {};

    const cond = { ...softDeleteCond, ...where };
    const queryBuilder = this.model.find(cond).setOptions({
      ...options,
    });

    const rawData = await queryBuilder.exec();
    const data = rawData.map(this.formatDocument);

    if (options.page) {
      const total = await this.model.countDocuments(where);
      const results = this.createPageInfo(
        data as T[],
        total,
        options.limit,
        options.skip,
      );
      return results;
    }

    return data as any[];
  }

  async getOne(req: CrudRequest): Promise<T> {
    const { options, where, id } = this.buildQuery(
      req,
      SmcCrudActionEnum.ReadOne,
    );
    const queryBuilder = this.model
      .findById(id)
      .setOptions({
        ...options,
      })
      .where({
        ...where,
      });
    const data = await queryBuilder.exec().then().catch();

    if (!data) {
      this.throwNotFoundException(this.model.modelName);
    }

    return this.formatDocument(data);
  }

  async createOne(req: CrudRequest | null, dto: T): Promise<T> {
    const paramsFilter = req?.parsed?.paramsFilter;

    const dtoClone: any = { ...dto };

    paramsFilter?.forEach((v) => {
      if (v.field !== '_id') {
        dtoClone[v.field] = v.value;
      }
    });

    const result = await this.model.create(dtoClone);
    return this.formatDocument(result);
  }

  async createMany(req: CrudRequest, dto: CreateManyDto<any>): Promise<T[]> {
    return (await this.model.insertMany(dto.bulk)) as any;
  }

  async updateOne(req: CrudRequest, dto: T): Promise<T> {
    const { id } = this.buildQuery(req, SmcCrudActionEnum.UpdateOne);

    const data = await (this.model as Model<T>).findByIdAndUpdate(
      id,
      dto as any,
      {
        new: true,
        runValidators: true,
        returnNewDocument: true,
      },
    );
    if (!data) {
      this.throwNotFoundException(this.model.modelName);
    }

    return this.formatDocument(data);
  }

  async replaceOne(req: CrudRequest, dto: T): Promise<T> {
    const { id } = this.buildQuery(req, SmcCrudActionEnum.ReplaceOne);
    const data = await (this.model as Model<T>).replaceOne(
      {
        _id: id,
      },
      dto,
      {
        runValidators: true,
        returnOriginal: true,
      },
    );
    if (!data) {
      this.throwNotFoundException(this.model.modelName);
    }
    const item = await this.model.findById(id);

    return this.formatDocument(item);
  }

  async updateMany(req: CrudRequest, dto: UpdateManyDto): Promise<T[]> {
    return (await this.model
      .updateMany(
        {
          _id: {
            $in: dto.ids,
          },
        },
        dto.data,
      )
      .catch(() => {
        throw this.throwBadRequestException('Invalid ids');
      })) as any;
  }

  async deleteOne(req: CrudRequest): Promise<T> {
    const { id } = this.buildQuery(req, SmcCrudActionEnum.DeleteOne);

    const user = req?.parsed?.authPersist;

    const data = await this.model.findById(id);
    if (!data) {
      throw this.throwNotFoundException(this.model.modelName);
    }

    const softDelete = req?.options?.query?.softDelete?.toString() === 'true';

    if (softDelete) {
      const updatedData = await this.model.findByIdAndUpdate(
        id,
        {
          deletedAt: new Date(),
          deletedBy: user?.id,
          __isDeleted: true,
        },
        {
          new: true,
          runValidators: true,
          strict: false,
        },
      );

      return this.formatDocument(updatedData);
    } else {
      await this.model.findByIdAndDelete(id);
      return this.formatDocument(data);
    }
  }

  async recoverOne(req: CrudRequest): Promise<void | T> {
    const softDelete = req?.options?.query?.softDelete?.toString() === 'true';
    const { id } = this.buildQuery(req, SmcCrudActionEnum.UpdateOne);

    const data = await this.model.findById(id);
    if (!data) {
      this.throwNotFoundException(this.model.modelName);
    }
    if (softDelete) {
      const rs = await this.model.findByIdAndUpdate(
        id,
        {
          $unset: {
            deletedAt: '',
            deletedBy: '',
            __isDeleted: '',
          },
        },
        {
          new: true,
          runValidators: true,
          returnNewDocument: true,
        },
      );
      return this.formatDocument(rs);
    }
    return this.formatDocument(data);
  }

  mapValuesDeep(obj: unknown) {
    return mapValuesDeep(obj, (v: unknown) => {
      return v;
    });
  }
}

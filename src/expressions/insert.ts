import type { ColumnsForSetOf, InputTypeOfColumn, IValueSource, TypeOfColumn, IExecutableSelectQuery, RemapIValueSourceType } from "./values"
import type { ITableOrView, NoTableOrViewRequired, NoTableOrViewRequiredView } from "../utils/ITableOrView"
import type { AnyDB, TypeSafeDB, NoopDB, PostgreSql, SqlServer, Oracle, Sqlite } from "../databases"
import type { int } from "ts-extended-types"
import type { database, tableOrView, tableOrViewRef, valueType } from "../utils/symbols"
import type { Column, ColumnWithDefaultValue, ComputedColumn, OptionalColumn } from "../utils/Column"
import type { RawFragment } from "../utils/RawFragment"
import { AutogeneratedPrimaryKeyColumnsTypesOf } from "../utils/tableOrViewUtils"

export interface InsertCustomization<DB extends AnyDB> {
    afterInsertKeyword?: RawFragment<DB>
    afterQuery?: RawFragment<DB>
}

export interface InsertExpressionOf<DB extends AnyDB> {
    [database]: DB
}

export interface InsertExpressionBase<TABLE extends ITableOrView<any>> extends InsertExpressionOf<TABLE[typeof database]> {
    [tableOrView]: TABLE
}

export interface ExecutableInsert<TABLE extends ITableOrView<any>> extends InsertExpressionBase<TABLE> {
    executeInsert(this: InsertExpressionOf<TypeSafeDB>, min?: number, max?: number): Promise<int>
    executeInsert(min?: number, max?: number): Promise<number>
    query(): string
    params(): any[]
}

export interface ExecutableInsertReturningLastInsertedId<TABLE extends ITableOrView<any>, RESULT> extends InsertExpressionBase<TABLE> {
    executeInsert(min?: number, max?: number): Promise<RESULT>
    query(): string
    params(): any[]
}

export interface CustomizableExecutableInsertReturning<TABLE extends ITableOrView<any>, RESULT> extends ExecutableInsertReturningLastInsertedId<TABLE, RESULT> {
    customizeQuery(customization: InsertCustomization<TABLE[typeof database]>): ExecutableInsertReturningLastInsertedId<TABLE, RESULT>
}

export interface CustomizableExecutableInsertFromSelect<TABLE extends ITableOrView<any>> extends ExecutableInsert<TABLE> {
    customizeQuery(customization: InsertCustomization<TABLE[typeof database]>): ExecutableInsert<TABLE>
    returningLastInsertedId: ReturningLastInsertedIdFromSelectType<TABLE>
    returning: ReturningFromSelectFnType<TABLE>
    returningOneColumn: ReturningOneColumnFromSelectFnType<TABLE>
}

export interface CustomiableExecutableInsert<TABLE extends ITableOrView<any>> extends ExecutableInsert<TABLE> {
    customizeQuery(customization: InsertCustomization<TABLE[typeof database]>): ExecutableInsert<TABLE>
    returningLastInsertedId: ReturningLastInsertedIdType<TABLE>
    returning: ReturningFnType<TABLE>
    returningOneColumn: ReturningOneColumnFnType<TABLE>
}

export interface CustomizableExecutableMultipleInsert<TABLE extends ITableOrView<any>> extends ExecutableInsert<TABLE> {
    customizeQuery(customization: InsertCustomization<TABLE[typeof database]>): ExecutableInsert<TABLE>
    returningLastInsertedId: ReturningMultipleLastInsertedIdType<TABLE>
    returning: ReturningFnType<TABLE>
    returningOneColumn: ReturningOneColumnFnType<TABLE>
}

export interface ExecutableInsertExpression<TABLE extends ITableOrView<any>> extends CustomiableExecutableInsert<TABLE> {
    set(columns: InsertSets<TABLE>): ExecutableInsertExpression<TABLE>
    setIfValue(columns: OptionalInsertSets<TABLE>): ExecutableInsertExpression<TABLE>
    setIfSet(columns: InsertSets<TABLE>): ExecutableInsertExpression<TABLE>
    setIfSetIfValue(columns: OptionalInsertSets<TABLE>): ExecutableInsertExpression<TABLE>
    setIfNotSet(columns: InsertSets<TABLE>): ExecutableInsertExpression<TABLE>
    setIfNotSetIfValue(columns: OptionalInsertSets<TABLE>): ExecutableInsertExpression<TABLE>
    ignoreIfSet(...columns: OptionalColumnsForInsertOf<TABLE>[]): ExecutableInsertExpression<TABLE>

    setIfHasValue(columns: InsertSets<TABLE>): ExecutableInsertExpression<TABLE>
    setIfHasValueIfValue(columns: OptionalInsertSets<TABLE>): ExecutableInsertExpression<TABLE>
    setIfHasNoValue(columns: InsertSets<TABLE>): ExecutableInsertExpression<TABLE>
    setIfHasNoValueIfValue(columns: OptionalInsertSets<TABLE>): this
    ignoreIfHasValue(...columns: OptionalColumnsForInsertOf<TABLE>[]): ExecutableInsertExpression<TABLE>
    ignoreIfHasNoValue(...columns: OptionalColumnsForInsertOf<TABLE>[]): ExecutableInsertExpression<TABLE>
    ignoreAnySetWithNoValue(): ExecutableInsertExpression<TABLE>
}

export interface MissingKeysInsertExpression<TABLE extends ITableOrView<any>, MISSING_KEYS> extends InsertExpressionBase<TABLE> {
    set<COLUMNS extends InsertSets<TABLE>>(columns: COLUMNS): MaybeExecutableInsertExpression<TABLE, Exclude<MISSING_KEYS, keyof COLUMNS>>
    setIfValue<COLUMNS extends OptionalInsertSets<TABLE>>(columns: COLUMNS): MaybeExecutableInsertExpression<TABLE, Exclude<MISSING_KEYS, keyof COLUMNS>>
    setIfSet<COLUMNS extends InsertSets<TABLE>>(columns: COLUMNS): MaybeExecutableInsertExpression<TABLE, Exclude<MISSING_KEYS, keyof COLUMNS>>
    setIfSetIfValue<COLUMNS extends OptionalInsertSets<TABLE>>(columns: COLUMNS): MaybeExecutableInsertExpression<TABLE, Exclude<MISSING_KEYS, keyof COLUMNS>>
    setIfNotSet<COLUMNS extends InsertSets<TABLE>>(columns: COLUMNS): MaybeExecutableInsertExpression<TABLE, Exclude<MISSING_KEYS, keyof COLUMNS>>
    setIfNotSetIfValue<COLUMNS extends OptionalInsertSets<TABLE>>(columns: COLUMNS): MaybeExecutableInsertExpression<TABLE, Exclude<MISSING_KEYS, keyof COLUMNS>>
    ignoreIfSet(...columns: OptionalColumnsForInsertOf<TABLE>[]): MissingKeysInsertExpression<TABLE, MISSING_KEYS>

    setIfHasValue<COLUMNS extends InsertSets<TABLE>>(columns: COLUMNS): MaybeExecutableInsertExpression<TABLE, Exclude<MISSING_KEYS, keyof COLUMNS>>
    setIfHasValueIfValue<COLUMNS extends OptionalInsertSets<TABLE>>(columns: COLUMNS): MaybeExecutableInsertExpression<TABLE, Exclude<MISSING_KEYS, keyof COLUMNS>>
    setIfHasNoValue<COLUMNS extends InsertSets<TABLE>>(columns: COLUMNS): MaybeExecutableInsertExpression<TABLE, Exclude<MISSING_KEYS, keyof COLUMNS>>
    setIfHasNoValueIfValue<COLUMNS extends OptionalInsertSets<TABLE>>(columns: COLUMNS): MaybeExecutableInsertExpression<TABLE, Exclude<MISSING_KEYS, keyof COLUMNS>>
    ignoreIfHasValue(...columns: OptionalColumnsForInsertOf<TABLE>[]): MissingKeysInsertExpression<TABLE, MISSING_KEYS>
    ignoreIfHasNoValue(...columns: OptionalColumnsForInsertOf<TABLE>[]): MissingKeysInsertExpression<TABLE, MISSING_KEYS>
    ignoreAnySetWithNoValue(): MissingKeysInsertExpression<TABLE, MISSING_KEYS>
}

export interface InsertExpression<TABLE extends ITableOrView<any>> extends InsertExpressionBase<TABLE> {
    dynamicSet(): MissingKeysInsertExpression<TABLE, keyof RequiredInsertSets<TABLE>>
    set(columns: InsertSets<TABLE> & RequiredInsertSets<TABLE>): ExecutableInsertExpression<TABLE>
    setIfValue(columns: OptionalInsertSets<TABLE> & RequiredInsertSets<TABLE>): ExecutableInsertExpression<TABLE>
    values(columns: InsertSets<TABLE> & RequiredInsertSets<TABLE>): ExecutableInsertExpression<TABLE>
    values(columns: Array<InsertSets<TABLE> & RequiredInsertSets<TABLE>>): CustomizableExecutableMultipleInsert<TABLE>
    defaultValues: DefaultValueType<TABLE>
    from(select: IExecutableSelectQuery<TABLE[typeof database], SelectForInsertResultType<TABLE>, SelectForInsertColumns<TABLE>, NoTableOrViewRequiredView<TABLE[typeof database]>>): CustomizableExecutableInsertFromSelect<TABLE>
}





export interface ExecutableInsertReturning<TABLE extends ITableOrView<any>, COLUMNS, RESULT> extends InsertExpressionBase<TABLE> {
    executeInsertNoneOrOne(): Promise<( COLUMNS extends IValueSource<any, any> ? RESULT : { [P in keyof RESULT]: RESULT[P] }) | null>
    executeInsertOne(): Promise<( COLUMNS extends IValueSource<any, any> ? RESULT : { [P in keyof RESULT]: RESULT[P] })>
    executeInsertMany(min?: number, max?: number): Promise<( COLUMNS extends IValueSource<any, any> ? RESULT : { [P in keyof RESULT]: RESULT[P] })[]>

    query(): string
    params(): any[]
}

export interface ComposableExecutableInsert<TABLE extends ITableOrView<any>, COLUMNS, RESULT> extends ExecutableInsertReturning<TABLE, COLUMNS, RESULT> {
    compose<EXTERNAL_PROP extends keyof RESULT & ColumnGuard<COLUMNS>, INTERNAL_PROP extends string, RESULT_PROP extends string>(config: {
        externalProperty: EXTERNAL_PROP,
        internalProperty: INTERNAL_PROP,
        propertyName: RESULT_PROP
    }): ComposeExpression<EXTERNAL_PROP, INTERNAL_PROP, RESULT_PROP, TABLE, COLUMNS, RESULT>
    composeDeletingInternalProperty<EXTERNAL_PROP extends keyof RESULT & ColumnGuard<COLUMNS>, INTERNAL_PROP extends string, RESULT_PROP extends string>(config: {
        externalProperty: EXTERNAL_PROP,
        internalProperty: INTERNAL_PROP,
        propertyName: RESULT_PROP
    }): ComposeExpressionDeletingInternalProperty<EXTERNAL_PROP, INTERNAL_PROP, RESULT_PROP, TABLE, COLUMNS, RESULT>
    composeDeletingExternalProperty<EXTERNAL_PROP extends keyof RESULT & ColumnGuard<COLUMNS>, INTERNAL_PROP extends string, RESULT_PROP extends string>(config: {
        externalProperty: EXTERNAL_PROP,
        internalProperty: INTERNAL_PROP,
        propertyName: RESULT_PROP
    }): ComposeExpressionDeletingExternalProperty<EXTERNAL_PROP, INTERNAL_PROP, RESULT_PROP, TABLE, COLUMNS, RESULT>

    // Note: { [Q in keyof SelectResult<{ [P in keyof MAPPING]: RESULT[MAPPING[P]] }>]: SelectResult<{ [P in keyof MAPPING]: RESULT[MAPPING[P]] }>[Q] } is used to define the internal object because { [P in keyof MAPPING]: RESULT[MAPPING[P]] } doesn't respect the optional typing of the props
    splitRequired<RESULT_PROP extends string, MAPPED_PROPS extends keyof RESULT & ColumnGuard<COLUMNS>, MAPPING extends { [P: string]: MAPPED_PROPS }>(propertyName: RESULT_PROP, mappig: MAPPING): ComposableExecutableInsert<TABLE, COLUMNS, Omit<RESULT, ValueOf<MAPPING>> & { [key in RESULT_PROP]: { [Q in keyof InsertResult<{ [P in keyof MAPPING]: RESULT[MAPPING[P]] }>]: InsertResult<{ [P in keyof MAPPING]: RESULT[MAPPING[P]] }>[Q] }}>
    splitOptional<RESULT_PROP extends string, MAPPED_PROPS extends keyof RESULT & ColumnGuard<COLUMNS>, MAPPING extends { [P: string]: MAPPED_PROPS }>(propertyName: RESULT_PROP, mappig: MAPPING): ComposableExecutableInsert<TABLE, COLUMNS, Omit<RESULT, ValueOf<MAPPING>> & { [key in RESULT_PROP]?: { [Q in keyof InsertResult<{ [P in keyof MAPPING]: RESULT[MAPPING[P]] }>]: InsertResult<{ [P in keyof MAPPING]: RESULT[MAPPING[P]] }>[Q] }}>
    split<RESULT_PROP extends string, MAPPED_PROPS extends keyof RESULT & ColumnGuard<COLUMNS>, MAPPING extends { [P: string]: MAPPED_PROPS }>(propertyName: RESULT_PROP, mappig: MAPPING): ComposableExecutableInsert<TABLE, COLUMNS, Omit<RESULT, ValueOf<MAPPING>> & ( {} extends InsertResult<{ [P in keyof MAPPING]: RESULT[MAPPING[P]] }> ? { [key in RESULT_PROP]?: { [Q in keyof InsertResult<{ [P in keyof MAPPING]: RESULT[MAPPING[P]] }>]: InsertResult<{ [P in keyof MAPPING]: RESULT[MAPPING[P]] }>[Q] }} : { [key in RESULT_PROP]: { [Q in keyof InsertResult<{ [P in keyof MAPPING]: RESULT[MAPPING[P]] }>]: InsertResult<{ [P in keyof MAPPING]: RESULT[MAPPING[P]] }>[Q] }})>
  
    guidedSplitRequired<RESULT_PROP extends string, MAPPED_PROPS extends keyof GuidedObj<RESULT> & ColumnGuard<COLUMNS>, MAPPING extends { [P: string]: MAPPED_PROPS }>(propertyName: RESULT_PROP, mappig: MAPPING): ComposableExecutableInsert<TABLE, COLUMNS, Omit<RESULT, GuidedPropName<ValueOf<MAPPING>>> & { [key in RESULT_PROP]: { [Q in keyof InsertResult<{ [P in keyof MAPPING]: GuidedObj<RESULT>[MAPPING[P]] }>]: InsertResult<{ [P in keyof MAPPING]: GuidedObj<RESULT>[MAPPING[P]] }>[Q] }}>
    guidedSplitOptional<RESULT_PROP extends string, MAPPED_PROPS extends keyof GuidedObj<RESULT> & ColumnGuard<COLUMNS>, MAPPING extends { [P: string]: MAPPED_PROPS }>(propertyName: RESULT_PROP, mappig: MAPPING): ComposableExecutableInsert<TABLE, COLUMNS, Omit<RESULT, GuidedPropName<ValueOf<MAPPING>>> & { [key in RESULT_PROP]?: { [Q in keyof InsertResult<{ [P in keyof MAPPING]: GuidedObj<RESULT>[MAPPING[P]] }>]: InsertResult<{ [P in keyof MAPPING]: GuidedObj<RESULT>[MAPPING[P]] }>[Q] }}>
}

export interface ComposeExpression<EXTERNAL_PROP extends keyof RESULT, INTERNAL_PROP extends string, RESULT_PROP extends string, TABLE extends ITableOrView<any>, COLUMNS, RESULT> {
    withNoneOrOne<INTERNAL extends {[key in INTERNAL_PROP]: RESULT[EXTERNAL_PROP]}>(fn: (ids: Array<RESULT[EXTERNAL_PROP]>) => Promise<INTERNAL[]>): ComposableExecutableInsert<TABLE, COLUMNS, RESULT & { [key in RESULT_PROP]?: INTERNAL }>
    withOne<INTERNAL extends {[key in INTERNAL_PROP]: RESULT[EXTERNAL_PROP]}>(fn: (ids: Array<RESULT[EXTERNAL_PROP]>) => Promise<INTERNAL[]>): ComposableExecutableInsert<TABLE, COLUMNS, RESULT & ( EXTERNAL_PROP extends RequiredKeys<COLUMNS> ? { [key in RESULT_PROP]: INTERNAL } : { [key in RESULT_PROP]?: INTERNAL })>
    withMany<INTERNAL extends {[key in INTERNAL_PROP]: RESULT[EXTERNAL_PROP]}>(fn: (ids: Array<RESULT[EXTERNAL_PROP]>) => Promise<INTERNAL[]>): ComposableExecutableInsert<TABLE, COLUMNS, RESULT & ( EXTERNAL_PROP extends RequiredKeys<COLUMNS> ? { [key in RESULT_PROP]: INTERNAL[] } : { [key in RESULT_PROP]?: INTERNAL[] })>
}
export interface ComposeExpressionDeletingInternalProperty<EXTERNAL_PROP extends keyof RESULT, INTERNAL_PROP extends string, RESULT_PROP extends string, TABLE extends ITableOrView<any>, COLUMNS, RESULT> {
    // Note: { [P in keyof Omit<INTERNAL, INTERNAL_PROP>]: Omit<INTERNAL, INTERNAL_PROP>[P] } is used to delete the internal prop because Omit<INTERNAL, INTERNAL_PROP> is not expanded in the editor (when see the type)
    withNoneOrOne<INTERNAL extends {[key in INTERNAL_PROP]: RESULT[EXTERNAL_PROP]}>(fn: (ids: Array<RESULT[EXTERNAL_PROP]>) => Promise<INTERNAL[]>): ComposableExecutableInsert<TABLE, COLUMNS, RESULT & { [key in RESULT_PROP]?: { [P in keyof Omit<INTERNAL, INTERNAL_PROP>]: Omit<INTERNAL, INTERNAL_PROP>[P] }}>
    withOne<INTERNAL extends {[key in INTERNAL_PROP]: RESULT[EXTERNAL_PROP]}>(fn: (ids: Array<RESULT[EXTERNAL_PROP]>) => Promise<INTERNAL[]>): ComposableExecutableInsert<TABLE, COLUMNS, RESULT & ( EXTERNAL_PROP extends RequiredKeys<COLUMNS> ? { [key in RESULT_PROP]: { [P in keyof Omit<INTERNAL, INTERNAL_PROP>]: Omit<INTERNAL, INTERNAL_PROP>[P] }} : { [key in RESULT_PROP]?: { [P in keyof Omit<INTERNAL, INTERNAL_PROP>]: Omit<INTERNAL, INTERNAL_PROP>[P] }} )>
    withMany<INTERNAL extends {[key in INTERNAL_PROP]: RESULT[EXTERNAL_PROP]}>(fn: (ids: Array<RESULT[EXTERNAL_PROP]>) => Promise<INTERNAL[]>): ComposableExecutableInsert<TABLE, COLUMNS, RESULT & ( EXTERNAL_PROP extends RequiredKeys<COLUMNS> ? { [key in RESULT_PROP]: Array<{ [P in keyof Omit<INTERNAL, INTERNAL_PROP>]: Omit<INTERNAL, INTERNAL_PROP>[P] }> } : { [key in RESULT_PROP]?: Array<{ [P in keyof Omit<INTERNAL, INTERNAL_PROP>]: Omit<INTERNAL, INTERNAL_PROP>[P] }> })>
}

export interface ComposeExpressionDeletingExternalProperty<EXTERNAL_PROP extends keyof RESULT, INTERNAL_PROP extends string, RESULT_PROP extends string, TABLE extends ITableOrView<any>, COLUMNS, RESULT> {
    withNoneOrOne<INTERNAL extends {[key in INTERNAL_PROP]: RESULT[EXTERNAL_PROP]}>(fn: (ids: Array<RESULT[EXTERNAL_PROP]>) => Promise<INTERNAL[]>): ComposableExecutableInsert<TABLE, COLUMNS, Omit<RESULT, EXTERNAL_PROP> & { [key in RESULT_PROP]?: INTERNAL }>
    withOne<INTERNAL extends {[key in INTERNAL_PROP]: RESULT[EXTERNAL_PROP]}>(fn: (ids: Array<RESULT[EXTERNAL_PROP]>) => Promise<INTERNAL[]>): ComposableExecutableInsert<TABLE, COLUMNS, Omit<RESULT, EXTERNAL_PROP> & ( EXTERNAL_PROP extends RequiredKeys<COLUMNS> ? { [key in RESULT_PROP]: INTERNAL } : { [key in RESULT_PROP]?: INTERNAL })>
    withMany<INTERNAL extends {[key in INTERNAL_PROP]: RESULT[EXTERNAL_PROP]}>(fn: (ids: Array<RESULT[EXTERNAL_PROP]>) => Promise<INTERNAL[]>): ComposableExecutableInsert<TABLE, COLUMNS, Omit<RESULT, EXTERNAL_PROP> & ( EXTERNAL_PROP extends RequiredKeys<COLUMNS> ? { [key in RESULT_PROP]: INTERNAL[] } : { [key in RESULT_PROP]?: INTERNAL[] })>
}

export interface ComposableCustomizableExecutableInsert<TABLE extends ITableOrView<any>, COLUMNS, RESULT> extends ComposableExecutableInsert<TABLE, COLUMNS, RESULT> {
    customizeQuery(customization: InsertCustomization<TABLE[typeof database]>): ComposableExecutableInsert<TABLE, COLUMNS, RESULT>
}

type ReturningFnType<TABLE extends ITableOrView<any>> =
    TABLE[typeof database] extends (NoopDB | PostgreSql | SqlServer | Sqlite | Oracle) 
    ? <COLUMNS extends InsertColumns<TABLE>>(columns: COLUMNS) => ComposableCustomizableExecutableInsert<TABLE, COLUMNS, InsertResult<ResultValues<COLUMNS>>>
    : never

type ReturningOneColumnFnType<TABLE extends ITableOrView<any>> =
    TABLE[typeof database] extends (NoopDB | PostgreSql | SqlServer | Sqlite | Oracle) 
    ? <COLUMN extends IValueSource<TABLE[typeof tableOrViewRef] | NoTableOrViewRequired<TABLE[typeof database]>, any>>(column: COLUMN) => ComposableCustomizableExecutableInsert<TABLE, COLUMN, FixInsertOneResult<COLUMN[typeof valueType]>>
    : never

type ReturningFromSelectFnType<TABLE extends ITableOrView<any>> =
    TABLE[typeof database] extends (NoopDB | PostgreSql | SqlServer | Sqlite) 
    ? <COLUMNS extends InsertColumns<TABLE>>(columns: COLUMNS) => ComposableCustomizableExecutableInsert<TABLE, COLUMNS, InsertResult<ResultValues<COLUMNS>>>
    : never

type ReturningOneColumnFromSelectFnType<TABLE extends ITableOrView<any>> =
    TABLE[typeof database] extends (NoopDB | PostgreSql | SqlServer | Sqlite) 
    ? <COLUMN extends IValueSource<TABLE[typeof tableOrViewRef] | NoTableOrViewRequired<TABLE[typeof database]>, any>>(column: COLUMN) => ComposableCustomizableExecutableInsert<TABLE, COLUMN, FixInsertOneResult<COLUMN[typeof valueType]>>
    : never

export type InsertColumns<TABLE extends ITableOrView<any>> = {
    [P: string]: IValueSource<TABLE[typeof tableOrViewRef] | NoTableOrViewRequired<TABLE[typeof database]>, any>
}

type ColumnGuard<T> = T extends null | undefined ? never : T extends never ? never : T extends IValueSource<any, any> ? never : unknown
type GuidedObj<T> = T & { [K in keyof T as K extends string | number ? `${K}!` : never]-?: NonNullable<T[K]>} & { [K in keyof T as K extends string | number ? `${K}?` : never]?: T[K]}
type GuidedPropName<T> = T extends `${infer Q}!` ? Q : T extends `${infer Q}?` ? Q : T
type ValueOf<T> = T[keyof T]
type RequiredKeys<T> = T extends IValueSource<any, any> ? never : { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T]

type InsertResult<RESULT> = 
    undefined extends string ? RESULT // tsc is working with strict mode disabled. There is no way to infer the optional properties. Keep as required is a better approximation.
    : { [P in MandatoryPropertiesOf<RESULT>]: RESULT[P] } & { [P in OptionalPropertiesOf<RESULT>]?: NonNullable<RESULT[P]> }
type MandatoryPropertiesOf<TYPE> = ({ [K in keyof TYPE]-?: null | undefined extends TYPE[K] ? never : (null extends TYPE[K] ? never : (undefined extends TYPE[K] ? never : K)) })[keyof TYPE]
type OptionalPropertiesOf<TYPE> = ({ [K in keyof TYPE]-?: null | undefined extends TYPE[K] ? K : (null extends TYPE[K] ? K : (undefined extends TYPE[K] ? K : never)) })[keyof TYPE]
type FixInsertOneResult<T> = T extends undefined ? null : T

type ResultValues<COLUMNS> = {
    [P in keyof COLUMNS]: ValueSourceResult<COLUMNS[P]>
}
type ValueSourceResult<T> = T extends IValueSource<any, infer R> ? R : never








type ReturningMultipleLastInsertedIdType<TABLE extends ITableOrView<any>> =
    TABLE[typeof database] extends (NoopDB | PostgreSql | SqlServer | Oracle | Sqlite) 
    ? AutogeneratedPrimaryKeyColumnsTypesOf<TABLE> extends never ? never : () =>  CustomizableExecutableInsertReturning<TABLE, AutogeneratedPrimaryKeyColumnsTypesOf<TABLE>[]>
    : never

type ReturningLastInsertedIdType<TABLE extends ITableOrView<any>> =
    AutogeneratedPrimaryKeyColumnsTypesOf<TABLE> extends never ? never : () =>  CustomizableExecutableInsertReturning<TABLE, AutogeneratedPrimaryKeyColumnsTypesOf<TABLE>>

type ReturningLastInsertedIdFromSelectType<TABLE extends ITableOrView<any>> =
    TABLE[typeof database] extends (NoopDB | PostgreSql | SqlServer | Sqlite) 
    ? AutogeneratedPrimaryKeyColumnsTypesOf<TABLE> extends never ? never : () =>  CustomizableExecutableInsertReturning<TABLE, AutogeneratedPrimaryKeyColumnsTypesOf<TABLE>[]>
    : never

type DefaultValueType<TABLE extends ITableOrView<any>> =
    unknown extends TABLE ? () => CustomiableExecutableInsert<TABLE> : // this is the case when TABLE is any
    keyof RequiredInsertSets<TABLE> extends never ? () => CustomiableExecutableInsert<TABLE> : never

type MaybeExecutableInsertExpression<TABLE extends ITableOrView<any>, MISSING_KEYS> = 
    MISSING_KEYS extends never ? ExecutableInsertExpression<TABLE> :  MissingKeysInsertExpression<TABLE, MISSING_KEYS>

export type SelectForInsertResultType<TABLE extends ITableOrView<any>> = {
    [P in ColumnsForSetOf<TABLE>]?: TypeOfColumn<TABLE, P>
} & {
    [P in RequiredColumnsForInsertOf<TABLE>]: TypeOfColumn<TABLE, P>
}

export type SelectForInsertColumns<TABLE extends ITableOrView<any>> = {
    [P in ColumnsForSetOf<TABLE>]?: RemapIValueSourceType<any, TABLE[P]>
} & {
    [P in RequiredColumnsForInsertOf<TABLE>]: RemapIValueSourceType<any, TABLE[P]>
}

export type InsertSets<TABLE extends ITableOrView<any>> = {
    [P in ColumnsForSetOf<TABLE>]?: InputTypeOfColumn<TABLE, P>
}

export type OptionalInsertSets<TABLE extends ITableOrView<any>> = {
    [P in ColumnsForSetOf<TABLE>]?: InputTypeOfColumn<TABLE, P> | null | undefined
}

export type RequiredInsertSets<TABLE extends ITableOrView<any>> = {
    [P in RequiredColumnsForInsertOf<TABLE>]: InputTypeOfColumn<TABLE, P>
}

export type RequiredColumnsForInsertOf<T extends ITableOrView<any>> = ({ [K in keyof T]-?: 
    T[K] extends IValueSource<T[typeof tableOrViewRef], any>  & Column
    ? (
        T[K] extends ComputedColumn
        ? never
        : (
            T[K] extends OptionalColumn 
            ? never 
            : (T[K] extends ColumnWithDefaultValue ? never : K)
        )
    ) : never 
})[keyof T]

export type OptionalColumnsForInsertOf<T extends ITableOrView<any>> = ({ [K in keyof T]-?: 
    T[K] extends IValueSource<T[typeof tableOrViewRef], any> & Column 
    ? (
        T[K] extends ComputedColumn
        ? never
        : (
            T[K] extends OptionalColumn 
            ? K 
            : (T[K] extends ColumnWithDefaultValue ? K : never)
        )
    ) : never 
})[keyof T]

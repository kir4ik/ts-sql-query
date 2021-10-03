/*
 * npm install oracledb
 * # Download and uncompress instantclient-basic-linux: https://www.oracle.com/es/database/technologies/instant-client/linux-x86-64-downloads.html
 * sudo apt-get install libaio1
 * export LD_LIBRARY_PATH=/path/to/instantclient/
 * docker run --name ts-sql-query-oracle -d -p 1521:1521 quillbuilduser/oracle-18-xe
 */

 /*
  * Useful query for see errors: select * from SYS.USER_ERRORS
  */

import * as oracledb from 'oracledb'
import { Table } from "../Table";
import { assertEquals } from "./assertEquals";
import { ConsoleLogQueryRunner } from "../queryRunners/ConsoleLogQueryRunner";
import { OracleConnection } from '../connections/OracleConnection';
import { OracleDBQueryRunner } from '../queryRunners/OracleDBQueryRunner';

class DBConection extends OracleConnection<'DBConnection'> {
    increment(i: number) {
        return this.executeFunction('incrementt', [this.const(i, 'int')], 'int', 'required')
    }
    appendToAllCompaniesName(aditional: string) {
        return this.executeProcedure('append_to_all_companies_name', [this.const(aditional, 'string')])
    }
    customerSeq = this.sequence('customer_seq', 'int')
}

const tCompany = new class TCompany extends Table<DBConection, 'TCompany'> {
    id = this.autogeneratedPrimaryKey('id', 'int');
    name = this.column('name', 'string');
    constructor() {
        super('company'); // table name in the database
    }
}()

const tCustomer = new class TCustomer extends Table<DBConection, 'TCustomer'> {
    id = this.autogeneratedPrimaryKeyBySequence('id', 'customer_seq', 'int');
    firstName = this.column('first_name', 'string');
    lastName = this.column('last_name', 'string');
    birthday = this.optionalColumn('birthday', 'localDate');
    companyId = this.column('company_id', 'int');
    constructor() {
        super('customer'); // table name in the database
    }
}()

const connectionPromise = oracledb.getConnection({
    user: 'sys',
    password: 'Oracle18',
    connectString: 'localhost:1521/XE',
    privilege: oracledb.SYSDBA
});

async function main() {
    const conn = await connectionPromise
    const connection = new DBConection(new ConsoleLogQueryRunner(new OracleDBQueryRunner(conn)))
    await connection.beginTransaction()

    let commit = false
    try {
        try {
            await connection.queryRunner.executeDatabaseSchemaModification(`drop table customer`)
        } catch { /* do nothing*/ }
        try {
            await connection.queryRunner.executeDatabaseSchemaModification(`drop table company`)
        } catch { /* do nothing*/ }
        try {
            await connection.queryRunner.executeDatabaseSchemaModification(`drop sequence customer_seq`)
        } catch { /* do nothing*/ }
        try {
            await connection.queryRunner.executeDatabaseSchemaModification(`drop function incrementt`)
        } catch { /* do nothing*/ }
        try {
            await connection.queryRunner.executeDatabaseSchemaModification(`drop procedure append_to_all_companies_name`)
        } catch { /* do nothing*/ }
        await connection.queryRunner.executeDatabaseSchemaModification(`
            create table company (
                id integer generated always as identity primary key,
                name varchar(100) not null
            )
        `)        
        await connection.queryRunner.executeDatabaseSchemaModification(`
            create table customer (
                id integer primary key,
                first_name varchar(100) not null,
                last_name varchar(100) not null,
                birthday date,
                company_id integer not null references company(id)
            )
        `)
        await connection.queryRunner.executeDatabaseSchemaModification(`create sequence customer_seq`)
        await connection.queryRunner.executeDatabaseSchemaModification(`
            create function incrementt(i in number) return number as
                begin
                    return(i + 1);
                end incrementt;
        `)
        await connection.queryRunner.executeDatabaseSchemaModification(`
            create procedure append_to_all_companies_name(aditional in varchar) as
                begin
                    update company set name = name || aditional;
                end append_to_all_companies_name;
        `)

        let i = await connection
            .insertInto(tCompany)
            .values({ name: 'ACME' })
            .returningLastInsertedId()
            .executeInsert()
        assertEquals(i, 1)

        i = await connection
            .insertInto(tCompany)
            .values({ name: 'FOO' })
            .executeInsert()
        assertEquals(i, 1)

        let ii = await connection
            .insertInto(tCustomer)
            .values([
                { firstName: 'John', lastName: 'Smith', companyId: 1 },
                { firstName: 'Other', lastName: 'Person', companyId: 1 },
                { firstName: 'Jane', lastName: 'Doe', companyId: 1 }
            ])
            .returningLastInsertedId()
            .executeInsert()
        assertEquals(ii, [1, 2, 3])

        i = await connection
            .selectFromNoTable()
            .selectOneColumn(connection.customerSeq.currentValue())
            .executeSelectOne()
        assertEquals(i, 3)

        let company = await connection
            .selectFrom(tCompany)
            .where(tCompany.id.equals(1))
            .select({
                id: tCompany.id,
                name: tCompany.name
            })
            .executeSelectOne()
        assertEquals(company, { id: 1, name: 'ACME' })

        let companies = await connection
            .selectFrom(tCompany)
            .select({
                id: tCompany.id,
                name: tCompany.name
            })
            .orderBy('id')
            .executeSelectMany()
        assertEquals(companies, [{ id: 1, name: 'ACME' }, { id: 2, name: 'FOO' }])

        let name = await connection
            .selectFrom(tCompany)
            .where(tCompany.id.equals(1))
            .selectOneColumn(tCompany.name)
            .executeSelectOne()
        assertEquals(name, 'ACME')

        let names = await connection
            .selectFrom(tCompany)
            .selectOneColumn(tCompany.name)
            .orderBy('result')
            .executeSelectMany()
        assertEquals(names, ['ACME', 'FOO'])

        i = await connection
            .insertInto(tCompany)
            .from(
                connection
                .selectFrom(tCompany)
                .select({
                    name: tCompany.name.concat(' 2')
                })
            )
            .executeInsert()
        assertEquals(i, 2)

        names = await connection
            .selectFrom(tCompany)
            .selectOneColumn(tCompany.name)
            .orderBy('result')
            .executeSelectMany()
        assertEquals(names, ['ACME', 'ACME 2', 'FOO', 'FOO 2'])

        i = await connection
            .update(tCompany)
            .set({
                name: tCompany.name.concat(tCompany.name)
            })
            .where(tCompany.id.equals(2))
            .executeUpdate()
        assertEquals(i, 1)

        name = await connection
            .selectFrom(tCompany)
            .where(tCompany.id.equals(2))
            .selectOneColumn(tCompany.name)
            .executeSelectOne()
        assertEquals(name, 'FOOFOO')

        i = await connection
            .deleteFrom(tCompany)
            .where(tCompany.id.equals(2))
            .executeDelete()
        assertEquals(i, 1)

        let maybe = await connection
            .selectFrom(tCompany)
            .where(tCompany.id.equals(2))
            .selectOneColumn(tCompany.name)
            .executeSelectNoneOrOne()
        assertEquals(maybe, null)

        let page = await connection
            .selectFrom(tCustomer)
            .select({
                id: tCustomer.id,
                name: tCustomer.firstName.concat(' ').concat(tCustomer.lastName)
            })
            .orderBy('id')
            .limit(2)
            .executeSelectPage()
        assertEquals(page, {
            count: 3,
            data: [
                { id: 1, name: 'John Smith' },
                { id: 2, name: 'Other Person' }
            ]
        })

        const customerCountPerCompanyWith = connection.selectFrom(tCompany)
            .innerJoin(tCustomer).on(tCustomer.companyId.equals(tCompany.id))
            .select({
                companyId: tCompany.id,
                companyName: tCompany.name,
                endsWithME: tCompany.name.endsWithInsensitive('me'),
                customerCount: connection.count(tCustomer.id)
            }).groupBy('companyId', 'companyName', 'endsWithME')
            .forUseInQueryAs('customerCountPerCompany')

        const customerCountPerAcmeCompanies = await connection.selectFrom(customerCountPerCompanyWith)
            .where(customerCountPerCompanyWith.companyName.containsInsensitive('ACME'))
            .select({
                acmeCompanyId: customerCountPerCompanyWith.companyId,
                acmeCompanyName: customerCountPerCompanyWith.companyName,
                acmeEndsWithME: customerCountPerCompanyWith.endsWithME,
                acmeCustomerCount: customerCountPerCompanyWith.customerCount
            })
            .executeSelectMany()
        assertEquals(customerCountPerAcmeCompanies, [
            { acmeCompanyId: 1, acmeCompanyName: 'ACME', acmeEndsWithME: true, acmeCustomerCount: 3 }
        ])

        i = await connection.increment(10)
        assertEquals(i, 11)

        await connection.appendToAllCompaniesName(' Cia.')

        name = await connection
            .selectFrom(tCompany)
            .where(tCompany.id.equals(1))
            .selectOneColumn(tCompany.name)
            .executeSelectOne()
        assertEquals(name, 'ACME Cia.')

        commit = true
    } finally {
        if (commit) {
            connection.commit()
        } else {
            connection.rollback()
        }
    }
}

main().then(() => {
    console.log('All ok')
    process.exit(0)
}).catch((e) => {
    console.error(e)
    process.exit(1)
})


import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";
// import { ForeignKeyMetadata } from "typeorm/metadata/ForeignKeyMetadata";

export default class AddCategoryIdToTransactions1609982781861 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.addColumn(
        'transactions',
        new TableColumn({
          name: 'category_id',
          type: 'uuid',
          isNullable: true,
        }),
      );

      await queryRunner.createForeignKey(
        'transactions',
        new TableForeignKey({
          columnNames: ['category_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'categories',
          name: 'TransactionCategory',
          onUpdate: 'CASCADE', //sempre que atualizar em uma tabela, atualiza na outra
          onDelete: 'SET NULL' //sempre que atualizar id, a id da outra tabela também será mudada e setada como nulo
        })
      )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropForeignKey('transactions', 'TransactionCategory');
      await queryRunner.dropColumn('transactions', 'category_id')
    }

}

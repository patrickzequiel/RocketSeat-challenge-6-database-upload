import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn, //falar qual coluna do banco de dados será referenciado
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

import Category from './Category'

@Entity('transactions') //Para referenciar uma tabela no banco de dados com nome transactions
class Transaction {
  @PrimaryGeneratedColumn('uuid')//tipo da tabela primária
  id: string;

  @Column()//não precisa passar padrão pqe padrão já é string
  title: string;

  @Column()
  type: 'income' | 'outcome';

  @Column('decimal')
  value: number;

  @ManyToOne(() => Category)
  @JoinColumn({name: 'category_id'})
  category: Category;

  @Column()
  category_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Transaction;

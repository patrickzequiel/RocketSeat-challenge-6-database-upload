import Transaction from '../models/Transaction';
import fs from 'fs';
import csvParse from 'csv-parse';
import TransactionsRepository from '../repositories/TransactionsRepository'
import { getCustomRepository, getRepository, In } from 'typeorm';
import Category from '../models/Category';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {

    const transactionsRepository = getCustomRepository(TransactionsRepository)
    const categoriesRepository = getRepository(Category)

    const contatcsReadStream = fs.createReadStream(filePath);

    const parsers = csvParse({
      from_line: 2, //pra começar a ler a partir da segunda linha
    })

    const parseCSV = contatcsReadStream.pipe(parsers) //pipe vai ler conforme as linhas disponíveis

    const transactions : CSVTransaction[] = [];
    const categories: string[] = []

    parseCSV.on('data', async line => {
      const [ title, type, value, category ] = line.map((cell: string) =>
      cell.trim()
      );

      if ( !title || !type || !value ) return;

      categories.push(category);

      transactions.push({ title, type, value, category });

    })

    await new Promise(resolve => parseCSV.on('end', resolve));

    const existenteCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existenteCategoriesTitles = existenteCategories.map(
      (category: Category) => category.title,
    );

    const addCategoryTitles = categories
    .filter(category => !existenteCategoriesTitles.includes(category)
    ).filter((value, index, self) => self.indexOf(value) == index);

    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({
        title,
      }))
    );

    await categoriesRepository.save(newCategories)

    const finalCategories = [...newCategories, ...existenteCategories];

    const createdTransactions = transactionsRepository.create(
      transactions.map(transaction => (
      {
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title == transaction.category,
        )
      })),
    );

    await transactionsRepository.save(createdTransactions);

    await fs.promises.unlink(filePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;

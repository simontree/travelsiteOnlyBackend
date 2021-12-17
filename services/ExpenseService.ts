import * as crypto from "crypto";

interface Expense {
  value: number;
  date: Date;
  name: string;
}

interface SavedExpense extends Expense {
  id: string;
}

class ExpenseService {
  expenses: SavedExpense[] = [];

  async add(expense: Expense): Promise<SavedExpense> {
    const newExpense: SavedExpense = {
      ...expense,
      id: crypto.randomUUID(),
    };
    this.expenses.push(newExpense);
    console.log("cool");
    return newExpense;
  }

  async getAll(): Promise<SavedExpense[]> {
    return this.expenses;
  }

  async delete(expenseId: string): Promise<void> {
    this.expenses = this.expenses.filter((expense) => {
      return expense.id !== expenseId;
    });
  }
}

export default ExpenseService;

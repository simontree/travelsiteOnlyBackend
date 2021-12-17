import { Knex } from "knex";

const user = [
  {
    email: "123@yohoo.com",
    password: "huhu123",
  },
  {
    email: "superuser@yohoo.de",
    password: "superEasy",
  },
];

export async function seed(knex: Knex): Promise<void> {
  return knex("user")
    .del()
    .then(() => {
      return knex("user").insert(user);
    });
}

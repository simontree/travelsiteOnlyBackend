import { Knex } from "knex";

const user = [
  {
    email: "huehne@htw-berlin.de",
    password: "hunter2",
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

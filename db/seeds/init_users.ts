import { Knex } from "knex";

const user = [
  {
    email: "huehne@htw-berlin.de",
    password: "$2y$10$O66J/G59rzFAgaPUeYCSZ.1LxHnGFYcnL.Cv./KUAm4YDwTKxIYOi",
  },
  {
    email: "superuser@yohoo.de",
    password: "$2y$10$AgTFjyWXmkdSVW.fBh8i4OxSKP/LCj6pdKJBZg2uNbjuyDNoKmaLG",
  },
];

export async function seed(knex: Knex): Promise<void> {
  return knex("user")
    .del()
    .then(() => {
      return knex("user").insert(user);
    });
}

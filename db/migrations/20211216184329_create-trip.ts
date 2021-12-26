import { Knex } from "knex";

///////////// ONLY FOR TESTING PURPOSE /////////////////////

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("trip", function (table) {
    table.uuid("trip_id").primary();
    table.string("name", 128).notNullable();
    table.date("start").notNullable();
    table.date("end").notNullable();
    table.string("country", 128).notNullable();
    table.string("user_id").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("trip");
}

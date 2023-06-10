import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('user', (table) => {
    table.dropColumn('phone_number');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('user', (table) => {
    table.string('phone_number');
  });
}

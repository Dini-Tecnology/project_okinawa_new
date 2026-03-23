import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddGroupBookingToReservations1765100000001 implements MigrationInterface {
  name = 'AddGroupBookingToReservations1765100000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('reservations', [
      new TableColumn({
        name: 'is_group_booking',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
      new TableColumn({
        name: 'group_size',
        type: 'integer',
        isNullable: true,
      }),
      new TableColumn({
        name: 'pre_fixed_menu',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
      new TableColumn({
        name: 'pre_fixed_menu_id',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'group_coordinator_name',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'group_coordinator_phone',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'deposit_required',
        type: 'boolean',
        default: false,
        isNullable: false,
      }),
      new TableColumn({
        name: 'deposit_amount',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
      }),
    ]);

    // Add index for group booking queries
    await queryRunner.query(
      `CREATE INDEX "idx_reservation_group_booking" ON "reservations" ("is_group_booking") WHERE "is_group_booking" = true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_reservation_group_booking"`);

    await queryRunner.dropColumns('reservations', [
      'is_group_booking',
      'group_size',
      'pre_fixed_menu',
      'pre_fixed_menu_id',
      'group_coordinator_name',
      'group_coordinator_phone',
      'deposit_required',
      'deposit_amount',
    ]);
  }
}

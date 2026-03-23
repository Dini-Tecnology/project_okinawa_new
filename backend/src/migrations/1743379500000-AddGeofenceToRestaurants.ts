/**
 * Migration: Add Geofence Columns to Restaurants
 *
 * Part of Epic 16 -- Backend Completions.
 * Adds lat, lng, and geofence_radius columns to the restaurants table
 * for drive-thru and food-truck geofencing support.
 */

import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddGeofenceToRestaurants1743379500000 implements MigrationInterface {
  name = 'AddGeofenceToRestaurants1743379500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'restaurants',
      new TableColumn({
        name: 'lat',
        type: 'decimal',
        precision: 10,
        scale: 7,
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'restaurants',
      new TableColumn({
        name: 'lng',
        type: 'decimal',
        precision: 10,
        scale: 7,
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'restaurants',
      new TableColumn({
        name: 'geofence_radius',
        type: 'int',
        isNullable: true,
        default: 500,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('restaurants', 'geofence_radius');
    await queryRunner.dropColumn('restaurants', 'lng');
    await queryRunner.dropColumn('restaurants', 'lat');
  }
}

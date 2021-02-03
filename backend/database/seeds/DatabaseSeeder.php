<?php

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->command->info('Data seeding started.');

        Model::unguard();

        $this->call([
            // UsersTableSeeder::class,
            // ElementTypeTableSeeder::class,
            // ElementsTableSeeder::class,
            // PlaylistTableSeeder::class,
            // PlaylistAndElementsTableSeeder::class,
            // TickerObjectTypeTableSeeder::class,
            // TickerGroupTableSeeder::class,
            // TickerObjectTableSeeder::class,
            // RadioTableSeeder::class,
            // SettingsTableSeeder::class,
            // RefineDataSeeder::class,
            WebRadioTableSeeder::class,
        ]);
    }
}

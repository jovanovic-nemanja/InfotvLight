<?php

use Illuminate\Database\Seeder;
use App\User;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $faker = \Faker\Factory::create();

        Bican\Roles\Models\Role::truncate();
        DB::table('role_user')->truncate();

        $adminRole = Bican\Roles\Models\Role::create([
            'name' => 'Admin',
            'slug' => 'admin'
        ]);

        $userRole = Bican\Roles\Models\Role::create([
            'name' => 'User',
            'slug' => 'user'
        ]);

        User::truncate();

        $admin = User::create([
            'name' => 'Super Admin',
            'avatar' => Avatar::create('Super Admin')->setDimension(300)->setFontSize(140)->setBorder(0, '#ffffff')->toBase64(),
            'bio' => $faker->sentence(),
            'email' => 'infotv@gmail.com',
            'password' => bcrypt('infotv'),
            'approved' => 1
        ]);
        $user = User::create([
            'name' => 'Normal User',
            'avatar' => Avatar::create('Normal User')->setDimension(300)->setFontSize(140)->setBorder(0, '#ffffff')->toBase64(),
            'bio' => $faker->sentence(),
            'email' => 'user@gmail.com',
            'password' => bcrypt('infotv'),
            'approved' => 1
        ]);

        $admin->attachRole($adminRole);
        $user->attachRole($userRole);

        $users = factory(User::class, 10)->create();
        $users->each(function ($user) use($userRole, $faker) {
            $user->attachRole($userRole);
        });
    }
}

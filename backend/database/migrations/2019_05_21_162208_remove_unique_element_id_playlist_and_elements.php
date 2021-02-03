<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class RemoveUniqueElementIdPlaylistAndElements extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('playlist_and_elements', function (Blueprint $table) {
//            $table->dropUnique('playlist_and_elements_playlist_id_element_id_unique');
            $table->dropUnique(['playlist_id', 'element_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('playlist_and_elements', function (Blueprint $table) {
//            $table->unique(['playlist_id', 'element_id']);
        });
    }
}

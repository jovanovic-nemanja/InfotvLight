<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTickerGroupsAndPlaylistAndElementsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('ticker_groups_and_playlist_and_elements', function (Blueprint $table) {
            $table->increments('id')->unsigned();
            $table->integer('group_id')->unsigned();
            $table->foreign('group_id')->references('id')->on('ticker_group')->onDelete('cascade');
            $table->integer('playlist_and_elements_id')->unsigned();
            $table->foreign('playlist_and_elements_id')->references('id')->on('playlist_and_elements')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('ticker_group_playlist_elements');
    }
}

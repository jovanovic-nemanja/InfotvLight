<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePlaylistAndElementsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('playlist_and_elements', function (Blueprint $table) {
            $table->increments('id')->unsigned();
            $table->integer('playlist_id')->unsigned();
            $table->foreign('playlist_id')->references('id')->on('playlist')->onDelete('cascade');
            $table->integer('element_id')->unsigned();
            $table->foreign('element_id')->references('id')->on('elements')->onDelete('cascade');
            $table->integer('order_number')->unsigned();
            $table->tinyInteger('mute')->unsigned()->default(0);
//            $table->unique(['playlist_id', 'element_id']);
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
        Schema::dropIfExists('playlist_elements');
    }
}
